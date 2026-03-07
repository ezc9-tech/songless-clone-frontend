import React, { useEffect, useRef, useState } from 'react';

export default function PlayButtonContainer({ soundcloudUrl, guessCount, isGameOver }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const iframeRef = useRef(null);
    const widgetRef = useRef(null);
    const pollingRef = useRef(null);

    const limit = 500 * Math.pow(2, Math.min(guessCount, 5));
    const limitSeconds = (limit / 1000).toFixed(1);
    const limitRef = useRef(limit);

    useEffect(() => {
        limitRef.current = limit;
        setProgress(0);
    }, [limit]);

    useEffect(() => {
        if (!soundcloudUrl) return;

        let scInterval = null;
        let widget = null;

        const stopPolling = () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };

        const startPolling = (targetWidget) => {
            stopPolling();
            pollingRef.current = setInterval(() => {
                targetWidget.getPosition((pos) => {
                    const currentLimit = limitRef.current;
                    if (pos >= currentLimit) {
                        targetWidget.pause();
                        targetWidget.seekTo(0);
                        setProgress(100);
                        setIsPlaying(false);
                        stopPolling();
                    } else {
                        setProgress((pos / currentLimit) * 100);
                    }
                });
            }, 20); // Poll every 20ms for higher precision
        };

        const setupWidget = () => {
            if (window.SC && iframeRef.current) {
                widget = window.SC.Widget(iframeRef.current);
                widgetRef.current = widget;

                widget.bind(window.SC.Widget.Events.READY, () => {
                    // Reset state when new song is ready
                    setProgress(0);
                    setIsPlaying(false);
                    widget.seekTo(0);
                });

                widget.bind(window.SC.Widget.Events.PLAY, () => {
                    setIsPlaying(true);
                    startPolling(widget);
                });

                widget.bind(window.SC.Widget.Events.PAUSE, () => {
                    setIsPlaying(false);
                    stopPolling();
                });

                widget.bind(window.SC.Widget.Events.FINISH, () => {
                    setIsPlaying(false);
                    setProgress(0);
                    stopPolling();
                });

                // Load the URL
                widget.load(soundcloudUrl, {
                    auto_play: false,
                    show_comments: false,
                    show_user: false,
                    show_reposts: false,
                    show_teaser: false,
                    visual: false,
                    hide_related: true
                });
            }
        };

        if (window.SC) {
            setupWidget();
        } else {
            scInterval = setInterval(() => {
                if (window.SC) {
                    setupWidget();
                    clearInterval(scInterval);
                }
            }, 100);
        }

        return () => {
            if (scInterval) clearInterval(scInterval);
            stopPolling();
            if (widget) {
                widget.unbind(window.SC.Widget.Events.PLAY);
                widget.unbind(window.SC.Widget.Events.PAUSE);
                widget.unbind(window.SC.Widget.Events.FINISH);
                widget.unbind(window.SC.Widget.Events.READY);
            }
        };
    }, [soundcloudUrl]);

    const handlePlayPause = () => {
        if (widgetRef.current) {
            if (!isPlaying) {
                widgetRef.current.seekTo(0);
                widgetRef.current.play();
            } else {
                widgetRef.current.pause();
            }
        }
    };

    return (
        <div className="play-container">
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}/>
            </div>
            <div className="snippet-info">
                Snippet length: {limitSeconds}s
            </div>
            <button onClick={handlePlayPause}>
                {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            {/* Hidden SoundCloud Player */}
            {soundcloudUrl && (
                <iframe
                    ref={iframeRef}
                    width="0"
                    height="0"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay; encrypted-media"
                    style={{ display: 'none' }}
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&auto_play=false`}
                ></iframe>
            )}
        </div>
    );
}
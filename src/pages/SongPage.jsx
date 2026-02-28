import React, { useEffect, useState, useRef } from "react";
import "../styles/SongPage.css";
import { supabase } from "../supabaseClient";

const SongPage = () => {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("Loading song...");
  const playerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Fetch a single song from Supabase
    const fetchFirstSong = async () => {
      try {
        const { data, error } = await supabase
          .from("spotify_playlist_songs")
          .select("*")
          .limit(1)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("No song found in Supabase.");
        }

        setSong(data);
        setLoading(false);
        setStatus("Song loaded. Ready to play.");
      } catch (err) {
        console.error("Error fetching song from Supabase:", err);
        setStatus(`Error loading song: ${err.message}`);
        setLoading(false);
      }
    };

    fetchFirstSong();

    // Load YouTube API script
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API is ready");
      };
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const extractVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const onPlayButtonClick = () => {
    if (isPlaying || !song || !song.youtube_url) return;

    if (!window.YT || !window.YT.Player) {
      setStatus("YouTube Player is still loading. Please try again in a moment.");
      return;
    }

    const videoId = extractVideoId(song.youtube_url);
    if (!videoId) {
      setStatus("Error: Invalid YouTube URL.");
      return;
    }

    setIsPlaying(true);
    setStatus("Playing 30 second snippet...");

    // Create player if it doesn't exist
    if (!playerRef.current) {
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
            startTimer();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING && !timerRef.current) {
              startTimer();
            }
          },
        },
      });
    } else {
      playerRef.current.loadVideoById(videoId);
      playerRef.current.playVideo();
      startTimer();
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.stopVideo();
      }
      setIsPlaying(false);
      setStatus("Finished playing snippet.");
      timerRef.current = null;
    }, 30000); // 30 seconds
  };

  if (loading) {
    return (
      <div className="song-page-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="song-page-container">
      <div className="song-info">
        <h2>Song Preview</h2>
        {song ? (
          <p>
            {song.song} by {song.artist}
          </p>
        ) : (
          <p>No song found</p>
        )}
      </div>

      <button
        className="play-button"
        onClick={onPlayButtonClick}
        disabled={isPlaying || !song}
      >
        {isPlaying ? "Playing..." : "Play 30s Snippet"}
      </button>

      <p className="status-text">{status}</p>

      {/* Hidden YouTube Player div */}
      <div id="youtube-player"></div>
    </div>
  );
};

export default SongPage;

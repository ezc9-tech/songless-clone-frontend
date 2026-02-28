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

    // Load SoundCloud Widget API script
    if (!window.SC) {
      const tag = document.createElement("script");
      tag.src = "https://w.soundcloud.com/player/api.js";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      tag.onload = () => {
        console.log("SoundCloud API is ready");
      };
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onPlayButtonClick = () => {
    if (isPlaying || !song || !song.soundcloud_url) return;

    if (!window.SC) {
      setStatus("SoundCloud Player is still loading. Please try again in a moment.");
      return;
    }

    setIsPlaying(true);
    setStatus("Playing 30 second snippet...");

    // Create player if it doesn't exist
    if (!playerRef.current) {
      const iframe = document.getElementById("soundcloud-player-iframe");
      iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(song.soundcloud_url)}&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;
      
      playerRef.current = window.SC.Widget(iframe);
      playerRef.current.bind(window.SC.Widget.Events.READY, () => {
        playerRef.current.play();
        startTimer();
      });
    } else {
      playerRef.current.load(song.soundcloud_url, {
        auto_play: true,
        hide_related: true,
        show_comments: false,
        show_user: false,
        show_reposts: false,
        show_teaser: false,
        visual: false
      });
      startTimer();
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.pause();
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

      {/* Hidden SoundCloud Player iframe */}
      <iframe
        id="soundcloud-player-iframe"
        width="0"
        height="0"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src=""
        style={{ display: "none" }}
      ></iframe>
    </div>
  );
};

export default SongPage;

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../utils/supabase";

export default function SongSearch() {
    const [query, setQuery] = useState("");
    const [songs, setSongs] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const fetchSongs = async () => {
            const { data, error } = await supabase
                .from("spotify_playlist_songs")
                .select("song, artist");
            
            if (error) {
                console.error("Error fetching songs:", error);
            } else {
                setSongs(data || []);
            }
        };

        fetchSongs();

        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 0) {
            const filtered = songs.filter(
                (s) =>
                    s.song.toLowerCase().includes(value.toLowerCase()) ||
                    s.artist.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (song) => {
        setQuery(`${song.song} - ${song.artist}`);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const highlightText = (text, highlight) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        const parts = text.split(new RegExp(`(${highlight})`, "gi"));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <strong key={i}>{part}</strong>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="song-search-container" ref={containerRef}>
            <form className="song-search" onSubmit={(e) => e.preventDefault()}>
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Search for a song..."
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => query.length > 0 && setShowSuggestions(true)}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map((s, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleSuggestionClick(s)}
                                >
                                    {highlightText(s.song, query)} - {highlightText(s.artist, query)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button type="submit">Guess</button>
            </form>
        </div>
    );
}
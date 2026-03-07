import Header from "../components/Header"
import GuessContainer from "../components/GuessContainer"
import PlayButtonContainer from "../components/PlayButtonContainer"
import SongSearch from "../components/SongSearch"
import '../styles/AdtunePage.css'
import { useEffect, useState } from 'react';
import supabase from '../utils/supabase';

export default function AdtuneGamePage() {
    const [songUrl, setSongUrl] = useState(null);
    const [correctSong, setCorrectSong] = useState(null);
    const [guesses, setGuesses] = useState([]);

    useEffect(() => {
        const fetchSongOfTheDay = async () => {
            const today = new Date().toLocaleDateString('en-CA'); // Ensures format matches YYYY-MM-DD
            const { data, error } = await supabase
                .from('spotify_playlist_songs')
                .select('*')
                .eq('last_picked_date', today)
                .maybeSingle();

            if (error) {
                console.error('Error fetching song of the day:', error);
            } else if (data) {
                console.log('Song of the day:', data.song);
                setCorrectSong(data);
                setSongUrl(data.soundcloud_url); // Pass soundcloud_url
            } else {
                console.log('No song of the day found for today.');
            }
        };

        fetchSongOfTheDay();
    }, []);

    const isGameWon = guesses.some(
        (g) =>
            g.song.toLowerCase() === correctSong?.song.toLowerCase() &&
            g.artist.toLowerCase() === correctSong?.artist.toLowerCase()
    );

    const isGameOver = isGameWon || guesses.length >= 6;

    const handleGuess = (guess) => {
        if (isGameOver) return;
        
        // Prevent duplicate guesses
        const alreadyGuessed = guesses.some(
            (g) => g.song === guess.song && g.artist === guess.artist
        );
        if (alreadyGuessed) return;

        setGuesses([...guesses, guess]);
    };

    return (
        <div className="game-container">
            <Header />
            <GuessContainer guesses={guesses} correctSong={correctSong} />
            
            <PlayButtonContainer 
                soundcloudUrl={songUrl} 
                guessCount={guesses.length}
                isGameOver={isGameOver}
            />
            <SongSearch onGuess={handleGuess} disabled={isGameOver} />
        </div>
    )
}
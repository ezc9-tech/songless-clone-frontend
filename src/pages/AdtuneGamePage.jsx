import Header from "../components/Header"
import GuessContainer from "../components/GuessContainer"
import PlayButtonContainer from "../components/PlayButtonContainer"
import SongSearch from "../components/SongSearch"
import '../styles/AdtunePage.css'
import { useEffect, useState } from 'react';
import supabase from '../utils/supabase';

export default function AdtuneGamePage() {
    const [songUrl, setSongUrl] = useState(null);

    useEffect(() => {
        const fetchSongOfTheDay = async () => {
            const today = new Date().toLocaleDateString('en-CA'); // Ensures format matches YYYY-MM-DD
            const { data, error } = await supabase
                .from('spotify_playlist_songs')
                .select('song, last_picked_date, soundcloud_url')
                .eq('last_picked_date', today)
                .maybeSingle();

            if (error) {
                console.error('Error fetching song of the day:', error);
            } else if (data) {
                console.log('Song of the day:', data.song);
                setSongUrl(data.soundcloud_url); // Pass soundcloud_url
            } else {
                console.log('No song of the day found for today.');
            }
        };

        fetchSongOfTheDay();
    }, []);

    return (
        <>
        <Header />
        <GuessContainer />
        <PlayButtonContainer soundcloudUrl={songUrl} />
        <SongSearch />
        </>
    )
}
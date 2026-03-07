

export default function GuessContainer({ guesses = [], correctSong }) {
    const totalSlots = 6;
    const slots = Array.from({ length: totalSlots }, (_, i) => guesses[i] || null);

    const isCorrect = (guess) => {
        return correctSong && 
               guess.song.toLowerCase() === correctSong.song.toLowerCase() && 
               guess.artist.toLowerCase() === correctSong.artist.toLowerCase();
    };

    return (
        <div className="guess-container">
            <ul>
                {slots.map((guess, index) => (
                    <li key={index} className={guess ? (isCorrect(guess) ? "correct" : "incorrect") : "empty"}>
                        {guess ? `${guess.song} - ${guess.artist}` : ""}
                    </li>
                ))}
            </ul>
        </div>
    )
}
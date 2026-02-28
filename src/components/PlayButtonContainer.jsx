

export default function PlayButtonContainer() {
    const progress = 50;
    return (
        <div className="play-container">
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}/>
            </div>
            <button>
                ▶ Play
            </button>
        </div>
    )
}
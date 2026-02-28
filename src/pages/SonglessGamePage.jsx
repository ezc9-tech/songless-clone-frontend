import Header from "../components/Header"
import GuessContainer from "../components/GuessContainer"
import PlayButtonContainer from "../components/PlayButtonContainer"
import SongSearch from "../components/SongSearch"
import '../styles/SonglessPage.css'

export default function SonglessGamePage() {
    return (
        <>
        <Header />
        <GuessContainer />
        <PlayButtonContainer />
        <SongSearch />
        </>
    )
}
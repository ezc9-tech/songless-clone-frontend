import Header from "../components/Header"
import GuessContainer from "../components/GuessContainer"
import PlayButtonContainer from "../components/PlayButtonContainer"
import SongSearch from "../components/SongSearch"
import '../styles/AdtunePage.css'

export default function AdtuneGamePage() {
    return (
        <>
        <Header />
        <GuessContainer />
        <PlayButtonContainer />
        <SongSearch />
        </>
    )
}
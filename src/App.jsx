import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import SongPage from "./pages/SongPage"
import AdtuneGamePage from "./pages/AdtuneGamePage"


function App() {

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/adtune-game-page" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/song-page" element={<SongPage />} />
      <Route path="/adtune-game-page" element={<AdtuneGamePage />} />
    </Routes>
  )
}

export default App

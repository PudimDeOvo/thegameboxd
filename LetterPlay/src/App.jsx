import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { LibraryGames } from './pages/LibraryGames';
import { Perfil } from './pages/Perfil';
import { AboutGame } from './pages/AboutGame';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { Lists } from './pages/Lists';
import AboutList from "./pages/AboutList";
function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter basename="/LetterPlay/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jogos" element={<LibraryGames />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/aboutGame" element={<AboutGame />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/lists" element={<Lists />}></Route>
        <Route path="/aboutlist" element={<AboutList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
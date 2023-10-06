import React from 'react';
import Lobby from './components/lobby/lobby';
import Home from './components/home/home';
import { Routes, Route} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/lobby' element={<Lobby/>}/>
      </Routes>
    </div>
  );
}

export default App;

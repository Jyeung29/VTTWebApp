import { useRef, useState, useEffect} from 'react'
import './App.css'
import {Canvas, Rect} from 'fabric';
import BattleMap from './map/BattleMap'
import Board from './map/Board';
import {Button, ButtonGroup} from "@chakra-ui/react";

function App() {
  return (
    <div className="App">
      <Board />
    </div>
  )
}

export default App

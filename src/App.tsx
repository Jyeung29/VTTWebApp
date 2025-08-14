import './App.css'
import Board from './Board';
import {ChakraProvider, defaultSystem} from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
    <div className="App">
      <Board />
    </div>
    </ChakraProvider>
  )
}

export default App

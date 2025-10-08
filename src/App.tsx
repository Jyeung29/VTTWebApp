import './index.css';
import Campaign from './Campaign';
import {ChakraProvider, defaultSystem} from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
    <div className="App">
      <Campaign />
    </div>
    </ChakraProvider>
  )
}

export default App

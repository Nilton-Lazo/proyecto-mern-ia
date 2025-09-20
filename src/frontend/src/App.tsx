import { Routes, Route } from 'react-router-dom'
import Home from './pages/Homei';
import Prueba from './pages/prueba';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/prueba" element={<Prueba />} />
    </Routes>
  )
}

export default App

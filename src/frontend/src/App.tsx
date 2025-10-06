import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Prueba from "./pages/prueba";
import Questions from "./pages/Questions";
import Reports from "./pages/Reports";

function App() {
  return (
    <Routes>
      {}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="prueba" element={<Prueba />} />
        <Route path="questions" element={<Questions />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;

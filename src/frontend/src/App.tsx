import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Questions from "./pages/Questions";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";

import TeacherDashboard from "./pages/TeacherDashboard";
import RoleRoute from "./components/RoleRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="questions" element={<Questions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="teacher/dashboard"
          element={
            <RoleRoute allowed={['teacher', 'admin']}>
              <TeacherDashboard />
            </RoleRoute>
          } />
      </Route>
    </Routes>
  );
}

export default App;

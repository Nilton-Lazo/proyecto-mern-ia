import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Questions from "./pages/Questions";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";

import TeacherDashboard from "./pages/TeacherDashboard";
import RoleRoute from "./components/RoleRoute";
import AssignActivity from "./pages/AssignActivity";

import StudentHome from "./pages/student/StudentHome";
import StudentActivities from "./pages/student/StudentActivities";
import StudentActivityDetail from "./pages/student/StudentActivityDetail";
import AIPractice from "./pages/student/AIPractice";
import StudentProgress from "./pages/student/StudentProgress";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="questions" element={<Questions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Redirecciones de compatibilidad */}
        <Route path="student" element={<Navigate to="/student/home" replace />} />
        <Route
          path="student/practice-legacy"
          element={<Navigate to="/student/practice" replace />}
        />

        <Route path="teacher/dashboard"
          element={
            <RoleRoute allowed={['teacher', 'admin']}>
              <TeacherDashboard />
            </RoleRoute>
          } />
        <Route path="teacher/assign"
          element={
            <RoleRoute allowed={['teacher', 'admin']}>
              <AssignActivity />
            </RoleRoute>
          } />

        {/* Rutas estudiante */}
        <Route path="student/home" element={
          <RoleRoute allowed={['student', 'admin']}>
            <StudentHome />
          </RoleRoute>
        } />
        <Route path="student/activities" element={
          <RoleRoute allowed={['student', 'admin']}>
            <StudentActivities />
          </RoleRoute>
        } />
        <Route path="student/activities/:id" element={
          <RoleRoute allowed={['student', 'admin']}>
            <StudentActivityDetail />
          </RoleRoute>
        } />
        <Route path="student/practice" element={
          <RoleRoute allowed={['student', 'admin']}>
            <AIPractice />
          </RoleRoute>
        } />
        <Route path="student/progress" element={
          <RoleRoute allowed={['student', 'admin']}>
            <StudentProgress />
          </RoleRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;

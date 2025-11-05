import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TeacherReturnBar() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const isTeacher = user?.role === "teacher";
  const onTeacherArea = pathname.startsWith("/teacher");

  if (!isTeacher || onTeacherArea) return null;

  return (
    <div className="sticky top-0 z-[60] w-full bg-blue-50 border-b border-blue-200">
      <div className="mx-auto max-w-6xl px-4 py-2 text-sm flex items-center justify-between text-blue-800">
        <span className="font-medium">
          Estás navegando como <span className="underline">{user?.nombres}</span> (Docente)
        </span>
        <Link
          to="/teacher/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
        >
          ← Volver al panel docente
        </Link>
      </div>
    </div>
  );
}
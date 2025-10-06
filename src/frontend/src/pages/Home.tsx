import { Link } from "react-router-dom";
function Home() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto grid items-center gap-12 px-6 md:grid-cols-2">
        {/* Texto principal */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl leading-tight">
            Bienvenido a <span className="text-blue-600">Tutor Virtual</span> 🚀
          </h1>
          <p className="mt-6 text-lg text-slate-700 leading-relaxed">
            Una plataforma diseñada para ayudarte a <strong>aprender mejor</strong>, 
            con el apoyo de inteligencia artificial y recursos interactivos.  
            Tu aprendizaje, más fácil, organizado y personalizado.  
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/questions"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              Comenzar
            </Link>
            <a
              href="https://github.com/Nilton-Lazo/proyecto-mern-ia"
              className="px-6 py-3 rounded-xl bg-slate-200 text-slate-800 font-semibold shadow hover:bg-slate-300 transition"
            >
              Saber más
            </a>
          </div>
        </div>

        {/* Imagen / Ilustración */}
        <div className="flex justify-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Tutor Virtual"
            className="w-80 drop-shadow-lg animate-fadeIn"
          />
        </div>
      </div>
    </section>
  );
}

export default Home;

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@providers/AuthProvider";

const Register: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            await auth.register(email, password, name);
            navigate("/app/dashboard", { replace: true });
        } catch {
            // error handled by context state
        }
    };

    return (
        <>
            <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Crea tu cuenta</h2>
                <p className="text-sm text-slate-500">Te tomará segundos comenzar a configurar tu plataforma.</p>
            </div>
            {auth.error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {auth.error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Nombre de usuario</label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(event) => {
                            if (auth.error) auth.clearError();
                            setName(event.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Correo electrónico</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => {
                            if (auth.error) auth.clearError();
                            setEmail(event.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(event) => {
                            if (auth.error) auth.clearError();
                            setPassword(event.target.value);
                        }}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    disabled={auth.isProcessing}
                >
                    {auth.isProcessing ? "Creando cuenta..." : "Crear cuenta"}
                </button>
            </form>
            <p className="text-center text-sm text-slate-600">
                ¿Ya tienes una cuenta? {" "}
                <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Inicia sesión
                </Link>
            </p>
        </>
    );
};

export default Register;

import { useAuth } from "@providers/AuthProvider";

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">
                    Este panel es el punto de partida para monitorear la actividad de tu plataforma. Personalízalo con métricas,
                    tarjetas y flujos según tus necesidades.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Usuarios activos</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">128</p>
                    <p className="text-xs text-emerald-600">+18% vs semana anterior</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Suscripciones</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">54</p>
                    <p className="text-xs text-emerald-600">+6 nuevas este mes</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Tickets abiertos</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">9</p>
                    <p className="text-xs text-amber-600">Atiende los más críticos</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Tasa de conversión</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">3.2%</p>
                    <p className="text-xs text-slate-500">Actualiza con datos reales</p>
                </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">Próximos pasos sugeridos</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• Completa la configuración de planes y precios.</li>
                    <li>• Automatiza emails de bienvenida para nuevos usuarios.</li>
                    <li>• Crea un tablero de métricas usando tu herramienta favorita.</li>
                </ul>
            </div>
            <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-6 text-center text-sm text-indigo-700">
                <p>
                    Bienvenido {user?.displayName || user?.email}! Este espacio es completamente editable. Usa este template como base
                    para construir experiencias únicas para tus usuarios.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;

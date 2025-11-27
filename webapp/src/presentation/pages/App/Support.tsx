const Support: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900">Soporte</h1>
                <p className="text-sm text-slate-500">
                    Centraliza la comunicación con tus usuarios. Conecta este template con tu helpdesk favorito o con Firestore para
                    registrar tickets.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Canales disponibles</h2>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                        <li>• Correo: soporte@tuplataforma.com</li>
                        <li>• Chat en vivo: integra Intercom, Drift o tu favorito.</li>
                        <li>• Base de conocimiento: enlaza documentación pública.</li>
                    </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Ticket rápido</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Usa este formulario para reportes rápidos. Sustituye el manejador por tu API para guardarlos de forma real.
                    </p>
                    <form
                        className="mt-4 space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            alert("Ticket enviado. Aquí puedes conectar un backend o integración de soporte.");
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Asunto"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            required
                        />
                        <textarea
                            placeholder="Describe tu solicitud"
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            Enviar ticket
                        </button>
                    </form>
                </div>
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                <p>Personaliza esta página con preguntas frecuentes, tutoriales o enlaces a tus redes de soporte.</p>
            </div>
        </div>
    );
};

export default Support;

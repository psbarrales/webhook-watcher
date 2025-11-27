import { FormEvent, useState } from "react";

const Options: React.FC = () => {
    const [platformName, setPlatformName] = useState("Mi Plataforma");
    const [primaryColor, setPrimaryColor] = useState("#4f46e5");
    const [welcomeMessage, setWelcomeMessage] = useState("¡Hola! Estamos felices de verte.");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Aquí podrías persistir las opciones en Firestore u otra API
        alert("Opciones guardadas. Integra tu servicio preferido para almacenarlas de forma permanente.");
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900">Opciones</h1>
                <p className="text-sm text-slate-500">
                    Configura los aspectos esenciales de tu plataforma. Este formulario es un punto de partida totalmente editable.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="platformName" className="text-sm font-medium text-slate-700">Nombre de la plataforma</label>
                    <input
                        id="platformName"
                        type="text"
                        value={platformName}
                        onChange={(event) => setPlatformName(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="primaryColor" className="text-sm font-medium text-slate-700">Color primario</label>
                    <input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(event) => setPrimaryColor(event.target.value)}
                        className="h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white"
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="welcomeMessage" className="text-sm font-medium text-slate-700">Mensaje de bienvenida</label>
                    <textarea
                        id="welcomeMessage"
                        rows={4}
                        value={welcomeMessage}
                        onChange={(event) => setWelcomeMessage(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        Guardar cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Options;

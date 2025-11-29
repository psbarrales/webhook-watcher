import { FormEvent, useState } from "react";

const Options: React.FC = () => {
    const [platformName, setPlatformName] = useState("My Platform");
    const [primaryColor, setPrimaryColor] = useState("#4f46e5");
    const [welcomeMessage, setWelcomeMessage] = useState("Hi! We're happy to see you.");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // You could persist the options in Firestore or another API here
        alert("Options saved. Integrate your preferred service to store them permanently.");
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500">
                    Configure the essential aspects of your platform. This form is a fully editable starting point.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="platformName" className="text-sm font-medium text-slate-700">Platform name</label>
                    <input
                        id="platformName"
                        type="text"
                        value={platformName}
                        onChange={(event) => setPlatformName(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="primaryColor" className="text-sm font-medium text-slate-700">Primary color</label>
                    <input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(event) => setPrimaryColor(event.target.value)}
                        className="h-10 w-full cursor-pointer rounded-lg border border-slate-200 bg-white"
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label htmlFor="welcomeMessage" className="text-sm font-medium text-slate-700">Welcome message</label>
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
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Options;

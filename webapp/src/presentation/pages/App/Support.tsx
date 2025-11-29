const Support: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900">Support</h1>
                <p className="text-sm text-slate-500">
                    Centralize communication with your users. Connect this template to your favorite helpdesk or Firestore to
                    log tickets.
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Available channels</h2>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                        <li>• Email: support@yourplatform.com</li>
                        <li>• Live chat: integrate Intercom, Drift, or your favorite.</li>
                        <li>• Knowledge base: link to your public documentation.</li>
                    </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Quick ticket</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Use this form for quick reports. Replace the handler with your API to store them for real.
                    </p>
                    <form
                        className="mt-4 space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            alert("Ticket sent. Connect a backend or support integration here.");
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Subject"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            required
                        />
                        <textarea
                            placeholder="Describe your request"
                            rows={4}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            Send ticket
                        </button>
                    </form>
                </div>
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                <p>Customize this page with FAQs, tutorials, or links to your support channels.</p>
            </div>
        </div>
    );
};

export default Support;

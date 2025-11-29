import { useAuth } from "@providers/AuthProvider";

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">
                    This panel is the starting point to monitor your platform activity. Customize it with metrics,
                    cards, and flows as needed.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Active users</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">128</p>
                    <p className="text-xs text-emerald-600">+18% vs previous week</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Subscriptions</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">54</p>
                    <p className="text-xs text-emerald-600">+6 new this month</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Open tickets</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">9</p>
                    <p className="text-xs text-amber-600">Prioritize the most critical</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Conversion rate</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">3.2%</p>
                    <p className="text-xs text-slate-500">Update with real data</p>
                </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">Suggested next steps</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• Complete your plans and pricing configuration.</li>
                    <li>• Automate welcome emails for new users.</li>
                    <li>• Build a metrics dashboard using your preferred tool.</li>
                </ul>
            </div>
            <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-6 text-center text-sm text-indigo-700">
                <p>
                    Welcome {user?.displayName || user?.email}! This space is fully editable. Use this template as a base
                    to build unique experiences for your users.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;

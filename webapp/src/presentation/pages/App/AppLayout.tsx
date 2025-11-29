import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@providers/AuthProvider";

const AppLayout: React.FC = () => {
    const auth = useAuth();

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white">⚙️</span>
                        Platform Template
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                        {auth.user?.displayName && (
                            <span className="font-medium text-slate-900">Hi, {auth.user.displayName}</span>
                        )}
                        <button
                            onClick={() => auth.logout()}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>
            <div className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 px-6 py-8 lg:flex-row">
                <aside className="lg:w-64">
                    <nav className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
                        <ul className="mt-2 space-y-1">
                            <li>
                                <NavLink
                                    to="/app/dashboard"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-600"
                                                : "text-slate-600 hover:bg-slate-50"
                                        }`
                                    }
                                >
                                    <span>Dashboard</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/app/options"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-600"
                                                : "text-slate-600 hover:bg-slate-50"
                                        }`
                                    }
                                >
                                    <span>Settings</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to="/app/support"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-600"
                                                : "text-slate-600 hover:bg-slate-50"
                                        }`
                                    }
                                >
                                    <span>Support</span>
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <main className="flex-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;

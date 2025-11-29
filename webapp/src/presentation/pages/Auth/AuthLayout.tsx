import { Outlet, Link } from "react-router-dom";

const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col lg:flex-row">
            <div className="flex flex-1 flex-col justify-between p-8 text-white bg-opacity-90">
                <div>
                    <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">⚡</span>
                        Platform Template
                    </Link>
                </div>
                <div className="mt-16 space-y-6">
                    <h1 className="text-4xl font-bold leading-tight">
                        Build your digital platform in minutes
                    </h1>
                    <p className="text-lg text-slate-300 max-w-md">
                        This template provides Firebase authentication, a ready-to-use user panel, and key pages
                        to quickly kickstart your SaaS or private community.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-200">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                            <p className="font-semibold">Secure authentication</p>
                            <p className="text-slate-300">Production-ready Firebase Authentication integration.</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                            <p className="font-semibold">Customizable panel</p>
                            <p className="text-slate-300">Dashboard, settings, and support pages included as a starting point.</p>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-slate-400">© {new Date().getFullYear()} Platform Template. All rights reserved.</p>
            </div>
            <div className="flex flex-1 items-center justify-center bg-white p-6 sm:p-12">
                <div className="w-full max-w-md space-y-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;

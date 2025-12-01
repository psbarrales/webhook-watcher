import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@providers/AuthProvider";

const Login: React.FC = () => {
      const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await auth.login(email, password);
      navigate("/app/dashboard", { replace: true });
    } catch {
      // error handled by context state
    }
  };

  const handleGoogleLogin = async () => {
    await auth.loginWithGoogle();
  };

      return (
    <>
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-500">Sign in to continue using your platform.</p>
      </div>
      {auth.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {auth.error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
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
          <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
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
          {auth.isProcessing ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-4 flex flex-col items-center space-y-2">
        <button
          onClick={handleGoogleLogin}
          className="w-full rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
          disabled={auth.isProcessing}
        >
          {auth.isProcessing ? "Connecting..." : "Sign in with Google"}
        </button>
      </div>

      <p className="text-center text-sm text-slate-600 mt-4">
        Don&apos;t have an account?{" "}
        <Link to="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </p>
    </>
  );
};

export default Login;

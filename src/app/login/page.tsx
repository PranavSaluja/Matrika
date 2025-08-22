"use client";
import { useState } from "react";
import Link from "next/link";

type Role = "INSTRUCTOR" | "STUDENT";
type LoginSuccess = { ok: true; id: string; role: Role };
type LoginError = { error: string };
type LoginResponse = LoginSuccess | LoginError;

function isLoginSuccess(x: LoginResponse): x is LoginSuccess {
  return (x as LoginSuccess).ok === true;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return "Something went wrong"; }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        const errMsg = "error" in data && data.error ? data.error : "Login failed";
        throw new Error(errMsg);
      }

      if (isLoginSuccess(data)) {
        setMsg(`Logged in as ${data.role}.`);
      } else {
        throw new Error("Unexpected response");
      }
    } catch (err: unknown) {
      setMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 relative overflow-hidden flex items-center justify-center">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full opacity-30 -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200 rounded-full opacity-30 translate-x-48 translate-y-48"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300 rounded-full opacity-40 -translate-x-24 translate-y-24"></div>

      {/* Logo */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-xl font-semibold text-gray-800">Matrika</span>
        </div>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h1>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <input
              className="w-full border-2 border-gray-200 rounded-full px-6 py-4 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <input
              className="w-full border-2 border-gray-200 rounded-full px-6 py-4 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right mt-2">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-800">Forget Password?</a>
            </div>
          </div>

          <button
            className="w-full bg-orange-300 hover:bg-orange-400 text-gray-800 font-semibold py-4 rounded-full transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
        </form>

        <p className="text-center text-gray-600 mt-6">
          Dont have an account yet?{" "}
          <Link href="/register" className="text-purple-600 hover:text-purple-800 font-medium">
            Register Now.
          </Link>
        </p>

        <div className="flex space-x-4 mt-8">
          <button className="flex-1 border-2 border-gray-200 rounded-full py-3 text-gray-700 hover:bg-gray-50 transition-colors">
            Google
          </button>
          <button className="flex-1 border-2 border-gray-200 rounded-full py-3 text-gray-700 hover:bg-gray-50 transition-colors">
            Github
          </button>
        </div>
      </div>
    </div>
  );
}
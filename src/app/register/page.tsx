"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Role = "INSTRUCTOR" | "STUDENT";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Something went wrong";
  }
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const error = (data as { error?: string })?.error ?? "Failed";
        throw new Error(error);
      }
      setMsg("Registered! You can now log in.");
    } catch (err: unknown) {
      setMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function onRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setRole(e.target.value as Role);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 relative overflow-hidden flex items-center justify-center">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-purple-200 rounded-full opacity-30 -translate-x-24 -translate-y-24"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-200 rounded-full opacity-30 translate-x-32 translate-y-32"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-300 rounded-full opacity-40 -translate-x-16 translate-y-16"></div>

      {/* Logo */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-3">
          <Image 
            src="/logo.png" 
            alt="Matrika Logo" 
            width={65} 
            height={65}
            className="rounded-lg"
          />
          <span className="text-2xl font-semibold text-gray-800">Matrika</span>
        </div>
      </div>

      {/* Register Form */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative z-10">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Register</h1>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <select
              className="w-full border-2 border-gray-200 rounded-full px-5 py-3 text-gray-700 focus:border-purple-500 focus:outline-none transition-colors appearance-none bg-white"
              value={role}
              onChange={onRoleChange}
            >
              <option value="">Select Role</option>
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
            </select>
          </div>
          
          <div>
            <input
              className="w-full border-2 border-gray-200 rounded-full px-5 py-3 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <input
              className="w-full border-2 border-gray-200 rounded-full px-5 py-3 text-gray-700 placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
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
            className="w-full bg-orange-300 hover:bg-orange-400 text-gray-800 font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>

          {msg && <p className="text-sm text-center text-green-600">{msg}</p>}
        </form>

        <p className="text-center text-gray-600 mt-5 text-sm">
          Already account?{" "}
          <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
            Login Now.
          </Link>
        </p>

        <div className="flex space-x-3 mt-6">
          <button className="flex-1 border-2 border-gray-200 rounded-full py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
            Google
          </button>
          <button className="flex-1 border-2 border-gray-200 rounded-full py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
            Github
          </button>
        </div>
      </div>
    </div>
  );
}
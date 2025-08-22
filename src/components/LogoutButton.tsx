// src/components/LogoutButton.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Important: ensures cookie is sent
      });

      if (res.ok) {
        router.push("/"); // Redirect to home page after successful logout
      } else {
        // Handle potential errors, though logout rarely fails
        console.error("Logout failed:", await res.json());
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-purple-600 hover:text-purple-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
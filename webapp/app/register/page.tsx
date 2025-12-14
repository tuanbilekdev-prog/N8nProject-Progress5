"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Semua field wajib diisi");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement actual registration API call
      // For now, simulate registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label="Toggle theme"
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="login-container">
        <Link href="/login" className="login-back-button" title="Kembali">
          &lt;
        </Link>
        <header className="login-header">
          <div className="login-header-title">Daftar Akun</div>
          <p className="login-header-subtitle">
            Buat akun baru untuk melanjutkan
          </p>
        </header>

        <main className="login-main">
          {error && <div className="login-error">{error}</div>}
          {success && (
            <div className="login-success">
              Pendaftaran berhasil! Mengarahkan ke halaman login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label htmlFor="username" className="login-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder="Masukkan username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="Masukkan email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Masukkan password (min. 6 karakter)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading || success}
                minLength={6}
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="confirmPassword" className="login-label">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="login-input"
                placeholder="Masukkan ulang password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={loading || success}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading || success || !username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()}
            >
              {loading ? "Mendaftar..." : success ? "Berhasil!" : "Daftar"}
            </button>
          </form>

          <div className="login-register-info">
            <p className="login-register-text">
              Sudah punya akun?{" "}
              <Link href="/login" className="login-register-link">
                Masuk di sini
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}


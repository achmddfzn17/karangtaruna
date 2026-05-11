"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Settings, Lock, Mail, Loader2, ArrowRight, ChevronLeft, 
  Shield, Database, Info, CheckCircle2, AlertCircle, Building2,
  HelpCircle, Users, Calendar, FileText, Image as ImageIcon, LayoutDashboard,
  Save
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";


export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        role: "ADMIN",
      });

      if (res?.error) {
        toast.error("Email atau password salah");
      } else {
        toast.success("Login berhasil!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 px-4 py-8">
      {/* Header Title with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm mb-4">
          {/* Logo */}
          <img 
            src="/logo.png" 
            alt="Logo Karang Taruna" 
            className="w-12 h-12 object-contain rounded-full border-2 border-blue-100"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="text-left">
            <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Halaman Login Administrator
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Sistem Informasi Manajemen Karang Taruna
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Container - 3 Column Layout */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Informasi Tambahan */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Info Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Butuh Bantuan?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hubungi Super Administrator
                </p>
              </div>
            </div>
          </div>

          {/* Info Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Akses Sistem
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masuk ke dashboard admin
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CENTER COLUMN: Panel Akses (Login Form) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-lg"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Panel Akses</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Login - Masukkan email & password
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Input Email Administrator
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  placeholder="Masukkan email admin"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Input Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="rememberAdmin"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white border-2 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer accent-blue-600"
                />
                <label
                  htmlFor="rememberAdmin"
                  className="text-xs text-slate-600 cursor-pointer select-none font-medium flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Ingat Saya
                </label>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Lupa Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">
                Halaman ini hanya untuk administrator Karang Taruna
              </span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Informasi Koneksi */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Notification Card 1 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-green-900 mb-1">
                  Notifikasi
                </h3>
                <p className="text-xs text-green-700 leading-relaxed">
                  Sistem memvalidasi identitas
                </p>
              </div>
            </div>
          </div>

          {/* Notification Card 2 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-900 mb-1">
                  Akses Sistem
                </h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Masuk ke dashboard admin
                </p>
              </div>
            </div>
          </div>

          {/* Notification Card 3 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 mb-1">
                  Kelola Data
                </h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Kelola data sesuai akses
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 w-full max-w-7xl"
      >
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">Karang Taruna RW 10</span>
            </div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-green-500" />
              <span className="font-medium">Sistem Informasi Manajemen</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-medium">Manajemen Data Anggota</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-medium">Agenda Kegiatan</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span className="font-medium">Dokumentasi Kegiatan</span>
            </div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-500" />
              <span className="font-medium">Galeri Foto</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-xs text-slate-400"
      >
        © 2026 Karang Taruna. All rights reserved.
      </motion.p>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { User, Lock, Save, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProfilAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    jabatan: "",
    phone: "",
    role: "",
  });

  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetch("/api/admin/profil")
      .then((r) => r.json())
      .then((data) => {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          jabatan: data.admin?.jabatan || "",
          phone: data.admin?.phone || "",
          role: data.role || "",
        });
      })
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          jabatan: profile.jabatan,
          phone: profile.phone,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal menyimpan");
      toast.success("Profil berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    if (pw.newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }
    setChangingPw(true);
    try {
      const res = await fetch("/api/admin/profil/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: pw.oldPassword,
          newPassword: pw.newPassword,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal mengubah password");
      toast.success("Password berhasil diubah");
      setPw({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setChangingPw(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Profil Saya</h1>
        <p className="text-sm text-slate-400 mt-1">Kelola informasi akun dan keamanan</p>
      </div>

      {/* Avatar + Role */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-5">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold shrink-0">
          {profile.name.charAt(0).toUpperCase() || "A"}
        </div>
        <div>
          <p className="text-lg font-extrabold text-slate-900">{profile.name || "Admin"}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <span className="inline-block mt-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 text-[11px] font-bold rounded-lg">
            {roleLabel[profile.role] || profile.role}
          </span>
        </div>
      </div>

      {/* Form Profil */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          Informasi Profil
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className={`${inputCls} bg-slate-50 text-slate-400 cursor-not-allowed`}
            />
            <p className="text-[11px] text-slate-400">Email tidak dapat diubah</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-600">Jabatan</label>
              <input
                type="text"
                value={profile.jabatan}
                onChange={(e) => setProfile((p) => ({ ...p, jabatan: e.target.value }))}
                placeholder="Contoh: Sekretaris"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-600">No. HP</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="081234567890"
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>
        </form>
      </div>

      {/* Ganti Password */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500" />
          Ganti Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">
              Password Lama <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                required
                value={pw.oldPassword}
                onChange={(e) => setPw((p) => ({ ...p, oldPassword: e.target.value }))}
                placeholder="Masukkan password saat ini"
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">
              Password Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                minLength={8}
                value={pw.newPassword}
                onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Minimal 8 karakter"
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-600">
              Konfirmasi Password Baru <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={pw.confirmPassword}
                onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Ulangi password baru"
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pw.confirmPassword && pw.newPassword !== pw.confirmPassword && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Password tidak cocok
              </p>
            )}
            {pw.confirmPassword && pw.newPassword === pw.confirmPassword && pw.newPassword.length >= 8 && (
              <p className="text-[11px] text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Password cocok
              </p>
            )}
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={changingPw}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-70"
            >
              {changingPw ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {changingPw ? "Mengubah..." : "Ubah Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

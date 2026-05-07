"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { buatAkunAnggota, resetPasswordAnggota } from "../../actions";
import { toast } from "sonner";

interface Props {
  anggotaId: string;
  userId: string | null;
  mode: "create" | "reset";
  defaultEmail?: string;
}

export default function BuatAkunForm({ anggotaId, userId, mode, defaultEmail = "" }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-slate-900 text-sm";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);

    try {
      if (mode === "create") {
        await buatAkunAnggota(anggotaId, formData);
        // redirect() di server action akan melempar NEXT_REDIRECT — tidak perlu toast di sini
      } else {
        await resetPasswordAnggota(userId!, formData);
        toast.success("Password berhasil direset!");
        router.refresh();
        setIsSubmitting(false);
      }
    } catch (error: any) {
      // Re-throw NEXT_REDIRECT agar Next.js bisa handle redirect
      if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
      setErrorMsg(error.message || "Terjadi kesalahan");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{errorMsg}</p>
        </div>
      )}

      {mode === "create" && (
        <div className="space-y-1.5">
          <label htmlFor="loginEmail" className="text-sm font-bold text-slate-700">
            Email Login <span className="text-red-500">*</span>
          </label>
          <input
            id="loginEmail"
            type="email"
            name="loginEmail"
            required
            defaultValue={defaultEmail}
            placeholder="email@contoh.com"
            className={inputCls}
          />
          <p className="text-[11px] text-slate-400">Digunakan untuk login, harus unik</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor={mode === "create" ? "loginPassword" : "newPassword"} className="text-sm font-bold text-slate-700">
          {mode === "create" ? "Password" : "Password Baru"} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id={mode === "create" ? "loginPassword" : "newPassword"}
            type={showPassword ? "text" : "password"}
            name={mode === "create" ? "loginPassword" : "newPassword"}
            required
            minLength={8}
            placeholder="Minimal 8 karakter"
            className={`${inputCls} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">Minimal 8 karakter</p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-70 shadow-sm"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === "create" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting
            ? "Memproses..."
            : mode === "create"
            ? "Buat Akun"
            : "Simpan Password Baru"}
        </button>
      </div>
    </form>
  );
}

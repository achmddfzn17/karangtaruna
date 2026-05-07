"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Send, AlertCircle, ClipboardList, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const susQuestions = [
  "Saya berpikir akan sering menggunakan sistem website ini.",
  "Saya merasa sistem ini terlalu rumit padahal dapat dibuat lebih sederhana.",
  "Saya merasa sistem ini mudah digunakan.",
  "Saya merasa butuh bantuan dari orang teknis untuk dapat menggunakan sistem ini.",
  "Saya menemukan bahwa berbagai fungsi dalam sistem ini terintegrasi dengan baik.",
  "Saya merasa ada banyak ketidakkonsistenan dalam sistem ini.",
  "Saya merasa orang kebanyakan akan belajar menggunakan sistem ini dengan sangat cepat.",
  "Saya merasa sistem ini sangat merepotkan untuk digunakan.",
  "Saya merasa sangat percaya diri menggunakan sistem ini.",
  "Saya harus belajar banyak hal sebelum saya bisa menggunakan sistem ini dengan baik.",
];

export default function SusFormPage() {
  const [responden, setResponden] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelect = (qIndex: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responden.trim()) { toast.error("Nama wajib diisi!"); return; }
    if (Object.keys(answers).length < 10) { toast.error("Mohon isi semua pertanyaan!"); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responden,
          q1: answers[0], q2: answers[1], q3: answers[2], q4: answers[3], q5: answers[4],
          q6: answers[5], q7: answers[6], q8: answers[7], q9: answers[8], q10: answers[9],
        }),
      });
      if (!res.ok) throw new Error();
      setIsSuccess(true);
      toast.success("Terima kasih atas evaluasi Anda!");
    } catch {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#f5f7fb] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-100 p-8 rounded-3xl shadow-lg text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Terima Kasih!</h2>
          <p className="text-slate-600 mb-8 text-[15px]">
            Evaluasi Anda sangat berarti bagi pengembangan sistem kami.
          </p>
          <button
            onClick={() => { setIsSuccess(false); setAnswers({}); setResponden(""); }}
            className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
          >
            Isi Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f7fb] pt-[72px]">
      {/* Page Hero */}
      <section className="pt-12 pb-10 bg-[#f4f9ff] border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 mb-6">
            <Link href="/" className="hover:text-blue-500 transition-colors">Beranda</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">Kuisioner SUS</span>
          </nav>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                System Usability <span className="text-blue-500">Scale</span>
              </h1>
              <p className="text-slate-500 text-[15px] mt-1">
                Bantu kami meningkatkan kualitas website Karang Taruna Generasi Emas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-2 bg-blue-500" />
            <form onSubmit={handleSubmit} className="p-6 md:p-10">
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-900 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={responden}
                  onChange={(e) => setResponden(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-6">
                {susQuestions.map((q, index) => (
                  <div
                    key={index}
                    className="relative p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all"
                  >
                    <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 mb-5 pl-2 leading-relaxed">{q}</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden sm:block">
                        Sangat Tidak Setuju
                      </span>
                      <div className="flex items-center justify-between gap-3 flex-1 max-w-sm">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSelect(index, val)}
                            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold transition-all hover:scale-105 ${
                              answers[index] === val
                                ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden sm:block">
                        Sangat Setuju
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm font-medium bg-blue-50 text-blue-600 px-4 py-3 rounded-xl border border-blue-100">
                  <AlertCircle className="w-4 h-4" />
                  <span>Pastikan semua pertanyaan terisi.</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Evaluasi"}
                  {!isSubmitting && <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

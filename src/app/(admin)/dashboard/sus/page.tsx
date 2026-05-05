"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

export default function EvaluasiPage() {
  const [responden, setResponden] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelect = (qIndex: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!responden.trim()) {
      toast.error("Nama wajib diisi!");
      return;
    }

    if (Object.keys(answers).length < 10) {
      toast.error("Mohon isi semua pertanyaan yang tersedia!");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        responden,
        q1: answers[0],
        q2: answers[1],
        q3: answers[2],
        q4: answers[3],
        q5: answers[4],
        q6: answers[5],
        q7: answers[6],
        q8: answers[7],
        q9: answers[8],
        q10: answers[9],
      };

      const res = await fetch("/api/sus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan evaluasi");

      setIsSuccess(true);
      toast.success("Terima kasih atas evaluasi Anda!");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-100 p-8 rounded-3xl shadow-lg text-center relative overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
            Terima Kasih!
          </h2>
          <p className="text-slate-600 mb-8 text-[15px]">
            Evaluasi Anda sangat berarti bagi pengembangan sistem Karang Taruna kami ke depannya.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-sm transition-colors"
          >
            Kembali ke Form
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 rounded-full text-[11px] font-extrabold text-blue-600 uppercase tracking-wide mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Evaluasi Sistem
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-slate-900">
            System Usability <span className="text-blue-500">Scale</span>
          </h1>
          <p className="text-[15px] md:text-[16px] text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Bantu kami meningkatkan kualitas website Karang Taruna Generasi Emas dengan mengisi kuesioner singkat berikut ini.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="h-2 w-full bg-blue-500" />
          <form onSubmit={handleSubmit} className="p-6 md:p-10">
            {/* Nama Field */}
            <div className="mb-10 group">
              <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={responden}
                onChange={(e) => setResponden(e.target.value)}
                placeholder="Masukkan nama Anda..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-8">
              {susQuestions.map((q, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.05 }}
                  className="relative p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-300"
                >
                  <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-6 pl-2 leading-relaxed">
                    {q}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden sm:block">
                      Sangat Tidak Setuju
                    </span>
                    <div className="flex w-full sm:w-auto items-center justify-between gap-2 sm:gap-4 flex-1 max-w-lg">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <div key={val} className="flex flex-col items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelect(index, val)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                              answers[index] === val
                                ? "bg-blue-500 border-blue-500 text-white shadow-sm shadow-blue-500/20"
                                : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                            }`}
                          >
                            {val}
                          </button>
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hidden sm:block">
                      Sangat Setuju
                    </span>
                  </div>
                  <div className="flex justify-between w-full mt-3 sm:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <span>Sangat Tidak Setuju</span>
                    <span>Sangat Setuju</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-14 pt-8 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm font-medium bg-blue-50 text-blue-600 px-4 py-3 rounded-xl border border-blue-100">
                <AlertCircle className="w-5 h-5" />
                <span>Pastikan semua pertanyaan telah terisi sebelum mengirim.</span>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 text-white hover:bg-blue-600 rounded-xl font-bold shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? "Mengirim..." : "Kirim Evaluasi"}</span>
                {!isSubmitting && <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

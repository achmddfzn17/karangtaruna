import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CheckCircle2, ChevronRight, MessageSquare, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createAspirasiSchema, validateFormData } from "@/lib/validations";

export const metadata = {
  title: "Kirim Aspirasi",
};

export default async function PublicAspirasiPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;

  async function submitAspirasi(formData: FormData) {
    "use server";

    const data = validateFormData(formData, createAspirasiSchema);

    await prisma.aspirasi.create({
      data: {
        nama: data.nama || null,
        judul: data.judul,
        pesan: data.pesan,
        kategori: data.kategori || null,
      },
    });

    revalidatePath("/dashboard/aspirasi");
    redirect("/aspirasi?success=1");
  }

  return (
    <div className="bg-[#f5f7fb] pt-[72px]">
      <section className="pt-12 pb-10 bg-[#f4f9ff] border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 mb-6">
            <Link href="/" className="hover:text-blue-500 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600">Aspirasi</span>
          </nav>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                Kirim Aspirasi
              </h1>
              <p className="text-slate-500 text-[15px] mt-1">
                Sampaikan saran, keluhan, atau ide untuk Karang Taruna Muda Berkarya.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {params.success && (
            <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Aspirasi berhasil dikirim. Terima kasih atas masukannya.
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="h-2 bg-blue-500" />
            <form action={submitAspirasi} className="p-6 md:p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="nama" className="block text-sm font-bold text-slate-900">
                    Nama
                  </label>
                  <input
                    id="nama"
                    name="nama"
                    type="text"
                    maxLength={100}
                    placeholder="Opsional"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="kategori" className="block text-sm font-bold text-slate-900">
                    Kategori
                  </label>
                  <select
                    id="kategori"
                    name="kategori"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="Saran">Saran</option>
                    <option value="Keluhan">Keluhan</option>
                    <option value="Ide Program">Ide Program</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="judul" className="block text-sm font-bold text-slate-900">
                  Judul
                </label>
                <input
                  id="judul"
                  name="judul"
                  type="text"
                  required
                  minLength={5}
                  maxLength={200}
                  placeholder="Contoh: Usulan kegiatan warga"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="pesan" className="block text-sm font-bold text-slate-900">
                  Pesan
                </label>
                <textarea
                  id="pesan"
                  name="pesan"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={7}
                  placeholder="Tuliskan aspirasi Anda dengan jelas..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-y"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-sm transition-colors"
                >
                  Kirim Aspirasi
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

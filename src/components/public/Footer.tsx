import Link from "next/link";
import { Shield, MapPin, Phone, Mail, Clock, ChevronRight, Heart } from "lucide-react";

// Inline social media SVG icons (lucide-react v1 doesn't include brand icons)
function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function IconYoutube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}
function IconTwitterX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const quickLinks = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/tentang" },
  { label: "Kegiatan", href: "/kegiatan" },
  { label: "Berita", href: "/berita" },
  { label: "Artikel", href: "/artikel" },
  { label: "Galeri", href: "/galeri" },
  { label: "Login Anggota", href: "/anggota/login" },
];

const operasional = [
  { hari: "Senin – Jumat", jam: "08:00 – 17:00" },
  { hari: "Sabtu", jam: "08:00 – 14:00" },
  { hari: "Minggu", jam: "Tutup" },
  { hari: "Hari Libur Nasional", jam: "Tutup" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0b1120] text-slate-300 relative overflow-hidden">
      {/* Decorative gradient blur at the top right */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      {/* Main footer grid */}
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Col 1: Brand (Takes up 4 columns on large screens) */}
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-extrabold text-white tracking-tight">
                  Karang Taruna
                </span>
                <span className="text-[11px] text-blue-400 font-bold tracking-[0.2em] uppercase">
                  Generasi Emas
                </span>
              </div>
            </div>
            <p className="text-[15px] leading-relaxed text-slate-400 mb-8 max-w-sm">
              Membangun ruang kolaborasi bagi pemuda yang kreatif, inovatif, dan berdedikasi tinggi untuk kemajuan bangsa Indonesia di masa depan.
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3">
              {[
                { icon: IconFacebook, href: "https://facebook.com", label: "Facebook" },
                { icon: IconInstagram, href: "https://instagram.com", label: "Instagram" },
                { icon: IconYoutube, href: "https://youtube.com", label: "YouTube" },
                { icon: IconTwitterX, href: "https://twitter.com", label: "Twitter (X)" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links (Takes up 2 columns) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">
              Eksplorasi
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link: any) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-[15px] text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact (Takes up 3 columns) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <ul className="space-y-5">
              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 transition-colors">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[14px] text-slate-400 leading-relaxed pt-2">
                  Jl. Pisang Batu RW. 10, Kel. Mangga Dua Selatan, Kec. Sawah Besar, Jakarta Pusat, DKI Jakarta 10730
                </span>
              </li>
              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 transition-colors">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <a
                  href="tel:+62895327395457"
                  className="text-[15px] text-slate-400 hover:text-white transition-colors pt-2"
                >
                  +62 895-3273-95457
                </a>
              </li>
              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 transition-colors">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <a
                  href="mailto:achmddfzn@gmail.com"
                  className="text-[15px] text-slate-400 hover:text-white transition-colors pt-2 break-all"
                >
                  achmddfzn@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Operating Hours (Takes up 3 columns) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">
              Jam Operasional
            </h4>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-[13px] font-medium text-slate-300">
                  Waktu Indonesia Barat (WIB)
                </span>
              </div>
              <ul className="space-y-3">
                {operasional.map(({ hari, jam }) => (
                  <li key={hari} className="flex justify-between items-center text-[14px]">
                    <span className="text-slate-400">{hari}</span>
                    <span className={`font-semibold ${jam === "Tutup" ? "text-red-400/80" : "text-emerald-400/80"}`}>
                      {jam}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-slate-800 bg-[#070b14]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-slate-500 font-medium">
            &copy; 2026 Karang Taruna Generasi Emas. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-1.5 text-[13px] text-slate-500 font-medium">
            <span>Didesain dengan</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
            <span>untuk Pemuda Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

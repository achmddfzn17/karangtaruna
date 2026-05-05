import Link from "next/link";
import { Shield, MapPin, Phone, Mail, Clock, ChevronRight } from "lucide-react";

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
    <footer className="bg-sidebar text-sidebar-foreground">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-white">
                  Karang Taruna
                </span>
                <span className="text-[10px] text-sidebar-foreground font-medium tracking-wide">
                  Generasi Emas
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-sidebar-foreground mb-5">
              Organisasi kepemudaan yang berkomitmen membangun generasi muda
              yang berkarakter, kreatif, dan berdaya saing tinggi demi kemajuan
              bangsa Indonesia.
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3">
              {[
                {
                  icon: IconFacebook,
                  href: "https://facebook.com",
                  label: "Facebook",
                  color: "hover:bg-blue-600",
                },
                {
                  icon: IconInstagram,
                  href: "https://instagram.com",
                  label: "Instagram",
                  color: "hover:bg-pink-600",
                },
                {
                  icon: IconYoutube,
                  href: "https://youtube.com",
                  label: "YouTube",
                  color: "hover:bg-red-600",
                },
                {
                  icon: IconTwitterX,
                  href: "https://twitter.com",
                  label: "Twitter (X)",
                  color: "hover:bg-slate-700",
                },
              ].map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center transition-colors ${color}`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Menu Utama
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link: any) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm text-sidebar-foreground hover:text-white transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Kontak Kami
            </h4>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-sidebar-foreground leading-relaxed">
                  Jl. Merdeka No. 45, Kelurahan Sukamaju, Kecamatan Cibeunying,
                  Kota Bandung, Jawa Barat 40122
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <a
                  href="tel:+6222123456789"
                  className="text-sm text-sidebar-foreground hover:text-white transition-colors"
                >
                  +62 22 1234 56789
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <a
                  href="mailto:info@karangtarunage.org"
                  className="text-sm text-sidebar-foreground hover:text-white transition-colors break-all"
                >
                  info@karangtarunage.org
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Operating Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              Jam Operasional
            </h4>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-sidebar-foreground">
                Waktu Indonesia Barat (WIB)
              </span>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-sidebar-border">
                {operasional.map(({ hari, jam }) => (
                  <tr key={hari}>
                    <td className="py-2 text-sidebar-foreground pr-2">
                      {hari}
                    </td>
                    <td
                      className={`py-2 text-right font-medium ${
                        jam === "Tutup" ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {jam}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-sidebar-foreground">
            © 2025 Karang Taruna Generasi Emas. Semua hak dilindungi.
          </p>
          <p className="text-xs text-sidebar-foreground">
            Dibuat dengan ❤️ untuk kemajuan pemuda Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}

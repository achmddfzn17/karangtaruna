import { config } from "dotenv";
config({ path: ".env" });
import { prisma } from './src/lib/prisma'

async function main() {
  console.log("Seeding data...")

  // Seed Berita
  await prisma.berita.createMany({
    data: [
      {
        judul: "Karang Taruna Generasi Emas Raih Penghargaan Nasional Organisasi Kepemudaan Terbaik 2024",
        slug: "karang-taruna-generasi-emas-raih-penghargaan-nasional-organisasi-kepemudaan-terbaik-2024",
        kategori: "Prestasi",
        status: "PUBLISHED",
        ringkasan: "Karang Taruna Generasi Emas berhasil meraih penghargaan bergengsi tingkat nasional sebagai organisasi kepemudaan terbaik tahun 2024. Penghargaan ini diberikan atas kontribusi nyata dalam pemberdayaan pemuda dan masyarakat.",
        isi: "Konten lengkap berita penghargaan...",
        publishedAt: new Date("2025-01-10T00:00:00Z"),
      },
      {
        judul: "Program Beasiswa Pemuda Berprestasi Dibuka Kembali untuk 2025",
        slug: "program-beasiswa-pemuda-berprestasi-dibuka-kembali-untuk-2025",
        kategori: "Pendidikan",
        status: "PUBLISHED",
        ringkasan: "Program beasiswa tahunan kembali dibuka dengan kuota 50 penerima dari seluruh wilayah.",
        isi: "Konten lengkap beasiswa...",
        publishedAt: new Date("2025-01-08T00:00:00Z"),
      },
      {
        judul: "Peluncuran Aplikasi Sistem Informasi Karang Taruna Digital",
        slug: "peluncuran-aplikasi-sistem-informasi-karang-taruna-digital",
        kategori: "Teknologi",
        status: "PUBLISHED",
        ringkasan: "Aplikasi digital resmi diluncurkan untuk memudahkan anggota dalam mengakses informasi kegiatan dan administrasi.",
        isi: "Konten lengkap peluncuran aplikasi...",
        publishedAt: new Date("2025-01-05T00:00:00Z"),
      },
      {
        judul: "Kolaborasi dengan 12 UMKM Lokal dalam Program Pemberdayaan Ekonomi",
        slug: "kolaborasi-dengan-12-umkm-lokal-dalam-program-pemberdayaan-ekonomi",
        kategori: "Ekonomi",
        status: "PUBLISHED",
        ringkasan: "Kemitraan strategis dengan UMKM lokal untuk membuka peluang usaha bagi anggota dan masyarakat sekitar.",
        isi: "Konten lengkap kolaborasi UMKM...",
        publishedAt: new Date("2025-01-02T00:00:00Z"),
      }
    ],
    skipDuplicates: true,
  });

  // Seed Artikel
  await prisma.artikel.createMany({
    data: [
      {
        judul: "5 Prinsip Kepemimpinan Pemuda yang Harus Kamu Kuasai di Era Digital",
        slug: "5-prinsip-kepemimpinan-pemuda-yang-harus-kamu-kuasai-di-era-digital",
        kategori: "Kepemimpinan",
        status: "PUBLISHED",
        ringkasan: "Kepemimpinan di era digital menuntut adaptasi yang cepat. Pelajari 5 prinsip kunci yang akan membantumu menjadi pemimpin efektif di tengah perubahan zaman.",
        isi: "Konten lengkap artikel kepemimpinan...",
        publishedAt: new Date("2025-01-12T00:00:00Z"),
      },
      {
        judul: "Memulai Usaha dari Nol: Panduan Lengkap untuk Pemuda Milenial",
        slug: "memulai-usaha-dari-nol-panduan-lengkap-untuk-pemuda-milenial",
        kategori: "Kewirausahaan",
        status: "PUBLISHED",
        ringkasan: "Ingin berwirausaha tapi bingung mulai dari mana? Artikel ini membahas langkah-langkah praktis dalam membangun bisnis dari nol hingga menghasilkan keuntungan.",
        isi: "Konten lengkap artikel kewirausahaan...",
        publishedAt: new Date("2025-01-09T00:00:00Z"),
      },
      {
        judul: "Strategi Belajar Efektif untuk Meningkatkan Potensi Diri sebagai Pemuda",
        slug: "strategi-belajar-efektif-untuk-meningkatkan-potensi-diri-sebagai-pemuda",
        kategori: "Pengembangan Diri",
        status: "PUBLISHED",
        ringkasan: "Dengan pendekatan belajar yang tepat, setiap pemuda dapat mengembangkan potensinya secara maksimal. Temukan strategi dan teknik belajar yang terbukti efektif.",
        isi: "Konten lengkap artikel belajar efektif...",
        publishedAt: new Date("2025-01-06T00:00:00Z"),
      }
    ],
    skipDuplicates: true,
  });

  // Seed Kegiatan
  await prisma.kegiatan.createMany({
    data: [
      {
        nama: "Pelatihan Kewirausahaan Digital untuk Pemuda",
        deskripsi: "Pelatihan intensif selama 3 hari tentang strategi bisnis digital, e-commerce, dan media sosial untuk pemuda.",
        jenis: "EKONOMI",
        status: "UPCOMING",
        tanggalMulai: new Date("2025-01-15T09:00:00Z"),
        lokasi: "Gedung Serbaguna, Bandung",
      },
      {
        nama: "Bakti Sosial & Donor Darah Massal",
        deskripsi: "Kegiatan bakti sosial yang melibatkan ratusan relawan dengan program donor darah, pembagian sembako, dan pengobatan gratis.",
        jenis: "SOSIAL",
        status: "UPCOMING",
        tanggalMulai: new Date("2025-01-22T08:00:00Z"),
        lokasi: "Lapangan Merdeka, Bandung",
      },
      {
        nama: "Festival Seni & Budaya Nusantara",
        deskripsi: "Festival tahunan menampilkan beragam pertunjukan seni tradisional dan modern oleh pemuda dari seluruh wilayah.",
        jenis: "SENI_BUDAYA",
        status: "UPCOMING",
        tanggalMulai: new Date("2025-02-05T10:00:00Z"),
        lokasi: "Taman Budaya Jawa Barat",
      }
    ],
    skipDuplicates: true,
  });

  console.log("Data seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

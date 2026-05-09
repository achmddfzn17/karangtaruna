import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ContentCalendar } from "@/components/admin/ContentCalendar";

export const metadata = {
  title: "Kalender Konten",
};

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kalender Konten</h1>
        <p className="text-slate-600 mt-1">Lihat jadwal kegiatan, berita, dan artikel</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ContentCalendar />
      </div>
    </div>
  );
}

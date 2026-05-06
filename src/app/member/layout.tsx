import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MemberSidebar from "@/components/member/MemberSidebar";
import MemberHeader from "@/components/member/MemberHeader";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/anggota/login");
  }

  const userRole = (session.user as any).role;
  if (userRole !== "ANGGOTA") {
    redirect("/anggota/login");
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <MemberSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MemberHeader user={{ name: session.user.name || "Anggota", image: session.user.image }} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

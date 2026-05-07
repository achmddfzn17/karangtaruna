import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MemberLayoutClient from "@/components/member/MemberLayoutClient";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/anggota/login");

  const userRole = (session.user as any).role;
  if (userRole !== "ANGGOTA") redirect("/anggota/login");

  return (
    <MemberLayoutClient
      user={{
        name: session.user.name || "Anggota",
        image: session.user.image,
      }}
    >
      {children}
    </MemberLayoutClient>
  );
}

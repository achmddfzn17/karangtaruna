import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import MemberLayoutClient from "@/components/member/MemberLayoutClient";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/anggota/login");

  const userRole = session.user.role;
  if (userRole !== "ANGGOTA") redirect("/anggota/login");

  // Get unread notification count for badge
  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return (
    <MemberLayoutClient
      user={{
        name: session.user.name || "Anggota",
        image: session.user.image,
      }}
      unreadCount={unreadCount}
    >
      {children}
    </MemberLayoutClient>
  );
}

import type { ReactNode } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { auth } from "@/auth";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar session={session} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

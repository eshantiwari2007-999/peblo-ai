import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CommandPalette } from "@/components/ui/command-palette";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={session.user} />
      <main className="flex-1 overflow-y-auto bg-card rounded-tl-xl border-l border-t border-border shadow-sm relative">
        {children}
      </main>
      {/* Global command palette — available on all dashboard pages */}
      <CommandPalette />
    </div>
  );
}


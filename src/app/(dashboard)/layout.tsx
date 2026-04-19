import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        role={session.user.role}
        fullName={session.user.fullName}
        email={session.user.email ?? ""}
        image={session.user.image}
      />
      {/* Main content — offset for sidebar on the right */}
      <main className="mr-60 min-h-screen">
        <div className="p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

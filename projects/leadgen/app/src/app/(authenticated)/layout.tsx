import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB]">{children}</main>
      </div>
    </div>
  );
}

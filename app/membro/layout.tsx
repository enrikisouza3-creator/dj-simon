import { MemberAuthProvider } from "@/components/membro/MemberAuthProvider";
import MemberSidebar from "@/components/membro/MemberSidebar";

export default function MembroLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberAuthProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: "#020408" }}>
        <MemberSidebar />
        <main style={{ flex: 1, overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </MemberAuthProvider>
  );
}

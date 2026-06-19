import { Sidebar } from "@/components/app/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Sidebar />
      <div className="app__main">
        <div className="app__content">{children}</div>
      </div>
    </div>
  );
}

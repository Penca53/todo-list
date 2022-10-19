import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="overflow-hidden">{children}</main>
    </div>
  );
}

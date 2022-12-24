import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

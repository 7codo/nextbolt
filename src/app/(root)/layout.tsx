import Header from "@/components/header";
import AppSidebar from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/config/auth";
import { redirect } from "next/navigation";
import { AUTH_PAGE } from "../../../routes.config";

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const user = (await auth())?.user;
  if (!user) redirect(AUTH_PAGE);

  return (
    <>
      <SidebarProvider
        defaultOpen={false}
        style={
          {
            "--sidebar-width": "350px",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={user} />
        <SidebarInset className="max-h-screen bg-secondary overflow-y-hidden">
          <Header />
          <main className="flex flex-1 flex-col gap-4 bg-background overflow-y-hidden">
            {children}
          </main>
        </SidebarInset>
        <Toaster richColors={true} />
      </SidebarProvider>
    </>
  );
}

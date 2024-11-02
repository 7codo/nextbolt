import { Toaster } from "@/components/ui/sonner";

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <>
      <main>{children}</main>
      <Toaster />
    </>
  );
}

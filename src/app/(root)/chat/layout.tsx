"use client";
import "@/app/(root)/chat/_lib/styles/index.css";
import "@xterm/xterm/css/xterm.css";

type Props = {
  children: React.ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  return <>{children}</>;
};

export default Layout;

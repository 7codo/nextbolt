"use client";
import "@/app/(root)/chat/_lib/styles/index.css";
import "@xterm/xterm/css/xterm.css";
import { stripIndents } from "./_lib/utils/stripIndent";
import { useStore } from "@nanostores/react";
import { themeStore } from "./_lib/stores/theme";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

const Layout: React.FC<Props> = ({ children }) => {
  const theme = useStore(themeStore);

  useEffect(() => {
    document.querySelector("html")?.setAttribute("data-theme", theme);
  }, [theme]);
  return (
    <>
      {children}
      <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
    </>
  );
};

export default Layout;

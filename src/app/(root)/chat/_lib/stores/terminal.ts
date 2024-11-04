import type { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { atom, type WritableAtom } from "nanostores";
import type { ITerminal } from "@/app/(root)/chat/_lib/types/terminal";
import { newShellProcess } from "@/app/(root)/chat/_lib/utils/shell";
import { coloredText } from "@/app/(root)/chat/_lib/utils/terminal";

export class TerminalStore {
  #webcontainer: Promise<WebContainer>;
  #terminals: Array<{ terminal: ITerminal; process: WebContainerProcess }> = [];

  showTerminal: WritableAtom<boolean> = atom(false);

  constructor(webcontainerPromise: Promise<WebContainer>) {
    this.#webcontainer = webcontainerPromise;
  }

  toggleTerminal(value?: boolean) {
    this.showTerminal.set(
      value !== undefined ? value : !this.showTerminal.get()
    );
  }

  async attachTerminal(terminal: ITerminal) {
    try {
      const shellProcess = await newShellProcess(
        await this.#webcontainer,
        terminal
      );
      this.#terminals.push({ terminal, process: shellProcess });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      terminal.write(
        coloredText.red("Failed to spawn shell\n\n") + error.message
      );
      return;
    }
  }

  onTerminalResize(cols: number, rows: number) {
    for (const { process } of this.#terminals) {
      process.resize({ cols, rows });
    }
  }
}

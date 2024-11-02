import { WebContainer } from "@webcontainer/api";
import { WORK_DIR_NAME } from "@/app/(root)/chat/_lib/utils/constants";
import { getPersistedStore } from "../utils/persistence-handler";
interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = getPersistedStore(
  "webcontainerContext",
  {
    loaded: false,
  }
);

export let webcontainer: Promise<WebContainer> = new Promise(() => {});

if (typeof window !== "undefined") {
  webcontainer = getPersistedStore(
    "webcontainer",
    Promise.resolve()
      .then(() => {
        return WebContainer.boot({ workdirName: WORK_DIR_NAME });
      })
      .then((webcontainer) => {
        webcontainerContext.loaded = true;

        // Update persisted context when loaded changes
        if (typeof window !== "undefined") {
          window.__NEXT__HOT_DATA__ = window.__NEXT__HOT_DATA__ || {};
          window.__NEXT__HOT_DATA__.webcontainerContext = webcontainerContext;
        }

        return webcontainer;
      })
  );
}

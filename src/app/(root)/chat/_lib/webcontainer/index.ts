import { WebContainer } from "@webcontainer/api";
import { WORK_DIR_NAME } from "../utils/constants";

interface WebContainerContext {
  loaded: boolean;
}

// Directly initialize the webcontainerContext without `import.meta.hot` handling
export const webcontainerContext: WebContainerContext = {
  loaded: false,
};

// Define a `webcontainer` promise that defaults to a no-op for SSR
export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

// Only boot the WebContainer when window is defined (client-side)
if (typeof window !== "undefined") {
  webcontainer = Promise.resolve()
    .then(() => {
      return WebContainer.boot({ workdirName: WORK_DIR_NAME });
    })
    .then((container) => {
      webcontainerContext.loaded = true;
      return container;
    });
}

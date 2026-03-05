import { useState, useCallback, useRef } from "react";
import sdk, { type VM } from "@stackblitz/sdk";

const STARTER_FILES: Record<string, string> = {
  "package.json": JSON.stringify(
    {
      name: "app",
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: { dev: "vite", build: "vite build" },
      dependencies: {
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "lucide-react": "^0.462.0",
      },
      devDependencies: {
        "@types/react": "^18.3.0",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.0",
        typescript: "^5.5.0",
        vite: "^5.4.0",
        tailwindcss: "^4.0.0",
        "@tailwindcss/vite": "^4.0.0",
      },
    },
    null,
    2
  ),
  "vite.config.ts": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})`,
  "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  "src/main.tsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  "src/App.tsx": `export default function App() {
  return (
    <div className="flex items-center justify-center h-screen font-sans bg-neutral-950 text-neutral-400">
      <p className="text-lg">Waiting for code generation...</p>
    </div>
  )
}`,
  "src/index.css": `@import "tailwindcss";`,
  "tsconfig.json": JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
      },
      include: ["src"],
    },
    null,
    2
  ),
};

const BASE_DEPS = new Set(["react", "react-dom", "lucide-react"]);

export function useStackBlitz() {
  const vmRef = useRef<VM | null>(null);
  const bootingRef = useRef(false);
  const [isBooting, setIsBooting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const installedDeps = useRef<Set<string>>(new Set(BASE_DEPS));

  const boot = useCallback(async (container: HTMLElement) => {
    // Use ref guard to prevent double-boot (avoids stale closure issue)
    if (vmRef.current || bootingRef.current) return;
    bootingRef.current = true;
    setIsBooting(true);
    setBootError(null);

    try {
      console.log("[StackBlitz] Embedding project...");
      const vm = await sdk.embedProject(
        container,
        {
          title: "App Preview",
          template: "node",
          files: STARTER_FILES,
        },
        {
          view: "preview",
          hideNavigation: true,
          hideDevTools: true,
          height: "100%",
        }
      );
      console.log("[StackBlitz] VM created, waiting for ready...");
      vmRef.current = vm;

      // Poll for the preview iframe to appear (indicates dev server is running)
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds
      const checkReady = () => {
        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            attempts++;
            const iframe = container.querySelector("iframe");
            if (iframe) {
              clearInterval(interval);
              console.log("[StackBlitz] Preview iframe detected, ready!");
              resolve();
            } else if (attempts >= maxAttempts) {
              clearInterval(interval);
              console.log("[StackBlitz] Timeout waiting for iframe, marking ready anyway");
              resolve();
            }
          }, 500);
        });
      };

      await checkReady();
      setIsReady(true);
      console.log("[StackBlitz] Boot complete");
    } catch (e) {
      console.error("[StackBlitz] Boot failed:", e);
      setBootError(e instanceof Error ? e.message : "Boot failed");
      bootingRef.current = false;
    } finally {
      setIsBooting(false);
    }
  }, []); // No dependencies - uses refs for guards

  const installDeps = useCallback(async (deps: string[]) => {
    if (!vmRef.current || deps.length === 0) return;
    const newDeps = deps.filter((d) => !installedDeps.current.has(d));
    if (newDeps.length === 0) return;

    try {
      const files = await vmRef.current.getFsSnapshot();
      const pkgStr = files?.["package.json"];
      if (!pkgStr) return;

      const pkg = JSON.parse(pkgStr);
      if (!pkg.dependencies) pkg.dependencies = {};
      for (const dep of newDeps) {
        pkg.dependencies[dep] = "latest";
        installedDeps.current.add(dep);
      }

      await vmRef.current.applyFsDiff({
        create: { "package.json": JSON.stringify(pkg, null, 2) },
        destroy: [],
      });
    } catch (e) {
      console.error("Failed to install deps:", e);
    }
  }, []);

  const writeFiles = useCallback(
    async (files: { path: string; content: string }[]) => {
      if (!vmRef.current) return;
      const create: Record<string, string> = {};
      for (const f of files) {
        create[f.path] = f.content;
      }
      await vmRef.current.applyFsDiff({ create, destroy: [] });
    },
    []
  );

  const readFile = useCallback(async (path: string): Promise<string | null> => {
    if (!vmRef.current) return null;
    try {
      const snapshot = await vmRef.current.getFsSnapshot();
      return snapshot?.[path] ?? null;
    } catch {
      return null;
    }
  }, []);

  const listFiles = useCallback(async (): Promise<string[]> => {
    if (!vmRef.current) return [];
    try {
      const snapshot = await vmRef.current.getFsSnapshot();
      return snapshot ? Object.keys(snapshot) : [];
    } catch {
      return [];
    }
  }, []);

  return { isBooting, isReady, bootError, boot, writeFiles, installDeps, readFile, listFiles, vmRef };
}

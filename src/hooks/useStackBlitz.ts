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
  const [isBooting, setIsBooting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const installedDeps = useRef<Set<string>>(new Set(BASE_DEPS));

  const boot = useCallback(
    async (container: HTMLElement) => {
      if (vmRef.current || isBooting) return;
      setIsBooting(true);
      try {
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
        vmRef.current = vm;
        setIsReady(true);
      } catch (e) {
        console.error("StackBlitz boot failed:", e);
      } finally {
        setIsBooting(false);
      }
    },
    [isBooting]
  );

  /** Install new npm deps by merging into package.json */
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

  /** Write files to the StackBlitz VM */
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

  /** Read a file from the StackBlitz VM */
  const readFile = useCallback(async (path: string): Promise<string | null> => {
    if (!vmRef.current) return null;
    try {
      const snapshot = await vmRef.current.getFsSnapshot();
      return snapshot?.[path] ?? null;
    } catch {
      return null;
    }
  }, []);

  /** Get all file paths from the StackBlitz VM */
  const listFiles = useCallback(async (): Promise<string[]> => {
    if (!vmRef.current) return [];
    try {
      const snapshot = await vmRef.current.getFsSnapshot();
      return snapshot ? Object.keys(snapshot) : [];
    } catch {
      return [];
    }
  }, []);

  return { isBooting, isReady, boot, writeFiles, installDeps, readFile, listFiles, vmRef };
}

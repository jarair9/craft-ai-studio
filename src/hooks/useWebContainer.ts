import { useState, useCallback, useRef } from "react";
import { WebContainer, type FileSystemTree } from "@webcontainer/api";

const STARTER_FILES: FileSystemTree = {
  "package.json": {
    file: {
      contents: JSON.stringify(
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
    },
  },
  "vite.config.ts": {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})`,
    },
  },
  "index.html": {
    file: {
      contents: `<!DOCTYPE html>
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
    },
  },
  src: {
    directory: {
      "main.tsx": {
        file: {
          contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        },
      },
      "App.tsx": {
        file: {
          contents: `export default function App() {
  return (
    <div className="flex items-center justify-center h-screen font-sans bg-neutral-950 text-neutral-400">
      <p className="text-lg">Waiting for code generation...</p>
    </div>
  )
}`,
        },
      },
      "index.css": {
        file: {
          contents: `@import "tailwindcss";`,
        },
      },
    },
  },
  "tsconfig.json": {
    file: {
      contents: JSON.stringify(
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
    },
  },
};

const BASE_DEPS = new Set(["react", "react-dom", "lucide-react"]);

// Singleton — WebContainer only allows ONE instance globally
let globalWc: WebContainer | null = null;
let globalBooting = false;

export function useWebContainer() {
  const wcRef = useRef<WebContainer | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const installedDeps = useRef<Set<string>>(new Set(BASE_DEPS));

  const boot = useCallback(async () => {
    // If already have a running instance, reuse it
    if (globalWc) {
      wcRef.current = globalWc;
      setIsReady(true);
      return;
    }
    if (globalBooting) return;
    globalBooting = true;
    setIsBooting(true);
    setBootError(null);
    setIsReady(false);
    setPreviewUrl(null);

    try {
      console.log("[WebContainer] Booting...");
      const wc = await WebContainer.boot({ coep: "credentialless" });
      globalWc = wc;
      wcRef.current = wc;
      console.log("[WebContainer] Mounting files...");
      await wc.mount(STARTER_FILES);

      // Listen for server-ready to get preview URL
      wc.on("server-ready", (_port: number, url: string) => {
        console.log("[WebContainer] Server ready at:", url);
        setPreviewUrl(url);
        setIsReady(true);
        setIsBooting(false);
      });

      // Install dependencies
      console.log("[WebContainer] Installing dependencies...");
      const installProcess = await wc.spawn("npm", ["install"]);
      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        throw new Error(`npm install failed with exit code ${installExitCode}`);
      }
      console.log("[WebContainer] Dependencies installed");

      // Start dev server
      console.log("[WebContainer] Starting dev server...");
      await wc.spawn("npm", ["run", "dev"]);

      // Timeout fallback
      setTimeout(() => {
        if (!globalWc) return;
        setIsReady((ready) => {
          if (!ready) {
            setBootError("Dev server did not start within 30 seconds");
            setIsBooting(false);
          }
          return ready;
        });
      }, 30000);
    } catch (e) {
      console.error("[WebContainer] Boot failed:", e);
      setBootError(e instanceof Error ? e.message : "Boot failed");
      // Teardown on failure so retry can work
      if (globalWc) {
        await globalWc.teardown();
      }
      globalWc = null;
      wcRef.current = null;
      setIsBooting(false);
    } finally {
      globalBooting = false;
    }
  }, []);

  const retry = useCallback(async () => {
    if (globalWc) {
      await globalWc.teardown();
    }
    globalWc = null;
    wcRef.current = null;
    globalBooting = false;
    boot();
  }, [boot]);

  const installDeps = useCallback(async (deps: string[]) => {
    if (!wcRef.current || deps.length === 0) return;
    const newDeps = deps.filter((d) => !installedDeps.current.has(d));
    if (newDeps.length === 0) return;

    try {
      // Read current package.json
      const pkgStr = await wcRef.current.fs.readFile("package.json", "utf-8");
      const pkg = JSON.parse(pkgStr);
      if (!pkg.dependencies) pkg.dependencies = {};
      for (const dep of newDeps) {
        pkg.dependencies[dep] = "latest";
        installedDeps.current.add(dep);
      }

      // Write updated package.json
      await wcRef.current.fs.writeFile("package.json", JSON.stringify(pkg, null, 2));

      // Run npm install
      const installProcess = await wcRef.current.spawn("npm", ["install"]);
      await installProcess.exit;
    } catch (e) {
      console.error("Failed to install deps:", e);
    }
  }, []);

  const writeFiles = useCallback(
    async (files: { path: string; content: string }[]) => {
      if (!wcRef.current) return;
      for (const f of files) {
        // Ensure directory exists
        const dir = f.path.substring(0, f.path.lastIndexOf("/"));
        if (dir) {
          await wcRef.current.fs.mkdir(dir, { recursive: true });
        }
        await wcRef.current.fs.writeFile(f.path, f.content);
      }
    },
    []
  );

  const readFile = useCallback(async (path: string): Promise<string | null> => {
    if (!wcRef.current) return null;
    try {
      return await wcRef.current.fs.readFile(path, "utf-8");
    } catch {
      return null;
    }
  }, []);

  const listFiles = useCallback(async (): Promise<string[]> => {
    if (!wcRef.current) return [];
    try {
      const entries = await wcRef.current.fs.readdir("/", { withFileTypes: true });
      return entries.map((e) => e.name);
    } catch {
      return [];
    }
  }, []);

  return {
    isBooting,
    isReady,
    bootError,
    previewUrl,
    boot,
    retry,
    writeFiles,
    installDeps,
    readFile,
    listFiles,
    wcRef,
  };
}

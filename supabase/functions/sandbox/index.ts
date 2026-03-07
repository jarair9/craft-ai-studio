import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Sandbox } from "npm:e2b@2.0.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sandboxId, path, content, cmd, timeout, background } = await req.json();
    const apiKey = Deno.env.get("E2B_API_KEY");
    if (!apiKey) throw new Error("E2B_API_KEY is not configured");

    let result: unknown;

    switch (action) {
      case "create": {
        const sandbox = await Sandbox.create("base", {
          apiKey,
          timeoutMs: (timeout || 300) * 1000,
        });
        result = {
          sandboxID: sandbox.sandboxId,
          clientID: sandbox.sandboxId,
        };
        break;
      }

      case "kill": {
        if (!sandboxId) throw new Error("sandboxId required");
        await Sandbox.kill(sandboxId, { apiKey });
        result = { success: true };
        break;
      }

      case "exec": {
        if (!sandboxId || !cmd) throw new Error("sandboxId and cmd required");
        const sandbox = await Sandbox.connect(sandboxId, { apiKey });

        if (background) {
          // For background/long-running processes, start and catch the inevitable timeout
          try {
            await sandbox.commands.run(cmd, { timeoutMs: 3000 });
          } catch (_e: any) {
            // Timeout is expected for long-running processes like dev servers
          }
          result = { stdout: "Process started in background", stderr: "", exitCode: 0 };
        } else {
          const cmdResult = await sandbox.commands.run(cmd, {
            timeoutMs: (timeout || 30) * 1000,
          });
          result = {
            stdout: cmdResult.stdout,
            stderr: cmdResult.stderr,
            exitCode: cmdResult.exitCode,
          };
        }
        break;
      }

      case "listFiles": {
        if (!sandboxId) throw new Error("sandboxId required");
        const sandbox = await Sandbox.connect(sandboxId, { apiKey });
        const dirPath = path || "/home/user";
        const entries = await sandbox.files.list(dirPath);
        result = entries.map((e: any) => ({
          name: e.name,
          path: e.path,
          type: e.type,
        }));
        break;
      }

      case "readFile": {
        if (!sandboxId || !path) throw new Error("sandboxId and path required");
        const sandbox = await Sandbox.connect(sandboxId, { apiKey });
        const fileContent = await sandbox.files.read(path);
        result = { content: fileContent };
        break;
      }

      case "writeFile": {
        if (!sandboxId || !path || content === undefined)
          throw new Error("sandboxId, path, and content required");
        const sandbox = await Sandbox.connect(sandboxId, { apiKey });
        await sandbox.files.write(path, content);
        result = { success: true };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sandbox error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

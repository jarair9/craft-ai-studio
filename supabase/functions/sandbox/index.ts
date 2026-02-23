import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const E2B_API = "https://api.e2b.app";

async function e2bFetch(path: string, opts: RequestInit = {}) {
  const apiKey = Deno.env.get("E2B_API_KEY");
  if (!apiKey) throw new Error("E2B_API_KEY is not configured");

  const res = await fetch(`${E2B_API}${path}`, {
    ...opts,
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`E2B API error [${res.status}]: ${text}`);
  }

  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sandboxId, path, content, cmd, timeout } = await req.json();

    let result: unknown;

    switch (action) {
      case "create": {
        result = await e2bFetch("/sandboxes", {
          method: "POST",
          body: JSON.stringify({
            templateID: "base",
            timeout: timeout || 300,
          }),
        });
        break;
      }

      case "kill": {
        if (!sandboxId) throw new Error("sandboxId required");
        await fetch(`${E2B_API}/sandboxes/${sandboxId}`, {
          method: "DELETE",
          headers: {
            "X-API-Key": Deno.env.get("E2B_API_KEY")!,
          },
        });
        result = { success: true };
        break;
      }

      case "exec": {
        if (!sandboxId || !cmd) throw new Error("sandboxId and cmd required");
        result = await e2bFetch(`/sandboxes/${sandboxId}/commands`, {
          method: "POST",
          body: JSON.stringify({ cmd, timeout: timeout || 30 }),
        });
        break;
      }

      case "listFiles": {
        if (!sandboxId) throw new Error("sandboxId required");
        const dirPath = path || "/home/user";
        result = await e2bFetch(`/sandboxes/${sandboxId}/filesystem?path=${encodeURIComponent(dirPath)}`);
        break;
      }

      case "readFile": {
        if (!sandboxId || !path) throw new Error("sandboxId and path required");
        const apiKey = Deno.env.get("E2B_API_KEY")!;
        const res = await fetch(
          `${E2B_API}/sandboxes/${sandboxId}/filesystem/files?path=${encodeURIComponent(path)}`,
          { headers: { "X-API-Key": apiKey } }
        );
        if (!res.ok) throw new Error(`Read file error: ${res.status}`);
        const text = await res.text();
        result = { content: text };
        break;
      }

      case "writeFile": {
        if (!sandboxId || !path || content === undefined)
          throw new Error("sandboxId, path, and content required");
        const apiKey2 = Deno.env.get("E2B_API_KEY")!;
        const writeRes = await fetch(
          `${E2B_API}/sandboxes/${sandboxId}/filesystem/files?path=${encodeURIComponent(path)}`,
          {
            method: "POST",
            headers: { "X-API-Key": apiKey2, "Content-Type": "application/octet-stream" },
            body: content,
          }
        );
        if (!writeRes.ok) throw new Error(`Write file error: ${writeRes.status}`);
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

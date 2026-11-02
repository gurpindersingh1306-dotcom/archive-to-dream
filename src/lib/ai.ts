
// One place for every AI call. Order of attempts:
// 1. In-memory cache (the same prompt never hits the API twice)
// 2. Each Gemini key x each model, with one retry on rate limits
// 3. The caller's fallback text, so the UI always shows something sensible

export interface AIImage { mimeType: string; data: string } // base64
export interface AskOptions { system?: string; images?: AIImage[]; fallback: string; maxTokens?: number }
export interface AIResult { text: string; source: "gemini" | "cache" | "fallback"; model?: string }

const cache = new Map<string, AIResult>();
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

const keys = () => [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_BACKUP].filter(Boolean) as string[];
// Check Google AI Studio for current model names and swap them in .env.local
const models = () => (process.env.GEMINI_MODELS || "gemini-2.5-flash,gemini-2.5-flash-lite").split(",").map((m) => m.trim()).filter(Boolean);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function cacheKey(prompt: string, o: AskOptions) {
  return JSON.stringify([o.system ?? "", prompt, o.images?.map((i) => i.data.slice(0, 64)) ?? []]);
}

async function callGemini(key: string, model: string, prompt: string, o: AskOptions) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        ...(o.system ? { systemInstruction: { parts: [{ text: o.system }] } } : {}),
        contents: [{ role: "user", parts: [...(o.images ?? []).map((i) => ({ inlineData: i })), { text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: o.maxTokens ?? 400 },
      }),
    });
    if (!res.ok) return { ok: false as const, status: res.status };
    const data = await res.json();
    const text: string = (data?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim();
    return text ? { ok: true as const, text } : { ok: false as const, status: 502 };
  } catch {
    return { ok: false as const, status: 504 };
  } finally {
    clearTimeout(timer);
  }
}

// Streams a Lovable AI Responses call and returns the full output text.
export async function streamResponsesText(body: Record<string, unknown>): Promise<{ ok: true; text: string } | { ok: false; status: number; message?: string }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { ok: false, status: 401, message: "AI is not configured" };
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({ model: "openai/gpt-6-astra", stream: true, store: false, reasoning: { effort: "low" }, ...body }),
    });
    if (!res.ok || !res.body) {
      let message: string | undefined;
      try { const j = await res.json(); message = j?.error?.message ?? j?.message; } catch { /* no body */ }
      return { ok: false, status: res.status, ...(message ? { message } : {}) };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") text += ev.delta;
        } catch { /* partial line */ }
      }
    }
    text = text.trim();
    return text ? { ok: true, text } : { ok: false, status: 502, message: "The AI returned no answer" };
  } catch {
    return { ok: false, status: 504, message: "The AI didn't respond" };
  }
}

async function callGateway(prompt: string, o: AskOptions) {
  return streamResponsesText({
    ...(o.system ? { instructions: o.system } : {}),
    input: [{ role: "user", content: prompt }],
    ...(o.maxTokens ? { max_output_tokens: Math.max(o.maxTokens, 600) } : {}),
  });
}

export async function askAI(prompt: string, o: AskOptions): Promise<AIResult> {
  const ck = cacheKey(prompt, o);
  const hit = cache.get(ck);
  if (hit) return { ...hit, source: "cache" };

  if (!o.images?.length) {
    const r = await callGateway(prompt, o);
    if (r.ok) { const result: AIResult = { text: r.text, source: "gemini", model: "lovable-ai" }; cache.set(ck, result); return result; }
    console.warn(`[askAI] Lovable AI failed with ${r.status}`);
  }

  for (const key of keys()) {
    for (const model of models()) {
      let r = await callGemini(key, model, prompt, o);
      if (!r.ok && r.status === 429) {
        await sleep(1500);
        r = await callGemini(key, model, prompt, o);
      }
      if (r.ok) {
        const result: AIResult = { text: r.text, source: "gemini", model };
        cache.set(ck, result);
        return result;
      }
      console.warn(`[askAI] ${model} failed with ${r.status}, trying next option`);
    }
  }
  return { text: o.fallback, source: "fallback" };
}

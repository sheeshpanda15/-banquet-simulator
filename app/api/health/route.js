export const runtime = "nodejs";
export const maxDuration = 15;

const DEFAULT_MODEL = "gemini-3.5-flash-lite";

function parseGeminiError(errText) {
  try {
    const data = JSON.parse(errText);
    return data.error?.message || errText;
  } catch {
    return errText;
  }
}

export async function POST(request) {
  try {
    const { userKey } = await request.json().catch(() => ({}));
    const browserKey = userKey?.trim();
    const apiKey = browserKey || process.env.GEMINI_API_KEY;
    const source = browserKey ? "browser" : "server";
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    if (!apiKey) {
      return Response.json(
        { ok: false, source: "missing", model, error: "没有检测到 API key。请检查 Vercel 的 GEMINI_API_KEY。" },
        { status: 500 }
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Reply with only OK." }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 8 },
      }),
      cache: "no-store",
    });

    if (!geminiRes.ok) {
      const detail = parseGeminiError(await geminiRes.text());
      return Response.json(
        { ok: false, source, model, error: `Gemini 连接失败 (HTTP ${geminiRes.status}): ${detail}` },
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return Response.json(
        { ok: false, source, model, error: "Gemini 已响应,但没有返回可用内容。" },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, source, model });
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || "API 连通性检测失败" },
      { status: 500 }
    );
  }
}

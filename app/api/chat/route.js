// 服务端代理: 浏览器调用这个端点 → 这个端点带着 API key 去调 Gemini
// 优先使用用户自带的 key (从请求 body 里),没有才用服务器环境变量

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULT_MODEL = "gemini-3.5-flash-lite";

function parseGeminiError(errText) {
  try {
    const data = JSON.parse(errText);
    const error = data.error || {};
    const code = error.status || error.code;
    const message = error.message || errText;
    return code ? `${code}: ${message}` : message;
  } catch {
    return errText;
  }
}

function buildGeminiError(status, errText) {
  const detail = parseGeminiError(errText);

  if (status === 400 && /API_KEY|api key|key not valid/i.test(detail)) {
    return "API key 无效。请检查 key 是否完整,并确认它来自 Google AI Studio。";
  }

  if ((status === 403 || status === 404) && /model|permission|not found|denied|not supported/i.test(detail)) {
    return `当前 Gemini 模型不可用或这个 key 没有权限。建议把 GEMINI_MODEL 改成 ${DEFAULT_MODEL}。Gemini 返回: ${detail}`;
  }

  if (status === 429 || /quota|rate limit/i.test(detail)) {
    return `Gemini 配额或频率限制已触发。请稍后重试,或检查 Google AI Studio 的额度。Gemini 返回: ${detail}`;
  }

  return `Gemini API 请求失败 (HTTP ${status})。Gemini 返回: ${detail}`;
}

export async function POST(request) {
  try {
    const { system, user, userKey } = await request.json();

    // 优先用用户自带的 key,否则用服务器配置的
    const apiKey = userKey?.trim() || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "没有可用的 API key。请在设置里填入你的 Gemini key,或联系作者。" },
        { status: 500 }
      );
    }

    if (!system || !user) {
      return Response.json(
        { error: "请求缺少 system 或 user 字段" },
        { status: 400 }
      );
    }

    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.95,
          maxOutputTokens: 8000,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error", {
        status: geminiRes.status,
        body: errText,
      });
      return Response.json(
        { error: buildGeminiError(geminiRes.status, errText) },
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      const finishReason = data.candidates?.[0]?.finishReason || "unknown";
      return Response.json(
        { error: `AI 没有返回内容 (原因: ${finishReason})` },
        { status: 500 }
      );
    }

    // 清理: Gemini 有时会用 markdown 代码块包裹 JSON
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "")
        .trim();
    }

    // 兜底: 提取 { ... } 之间的部分
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleanText = cleanText.slice(firstBrace, lastBrace + 1);
    }

    try {
      const parsed = JSON.parse(cleanText);
      return Response.json(parsed);
    } catch (parseErr) {
      return Response.json(
        {
          error: `JSON 解析失败 (${parseErr.message})。原始返回前 400 字符: ${text.slice(0, 400)}`,
        },
        { status: 500 }
      );
    }
  } catch (e) {
    return Response.json({ error: e.message || "未知错误" }, { status: 500 });
  }
}

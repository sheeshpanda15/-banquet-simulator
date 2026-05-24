// 服务端代理: 浏览器调用这个端点 → 这个端点带着 API key 去调 Gemini
// 优先使用用户自带的 key (从请求 body 里),没有才用服务器环境变量

export const runtime = "nodejs";
export const maxDuration = 30;

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

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      // 如果是 key 无效,提示用户
      if (geminiRes.status === 400 && errText.includes("API_KEY")) {
        return Response.json(
          { error: "API key 无效或权限不足。请检查你填的 key 是否正确。" },
          { status: 400 }
        );
      }
      return Response.json(
        { error: `Gemini API 错误: ${errText.slice(0, 500)}` },
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

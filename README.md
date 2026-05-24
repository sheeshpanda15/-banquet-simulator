# 饭局模拟器 · The Banquet of Souls

一部关于职场饭局文化的黑色幽默讽刺作品。由 Gemini 2.5 Flash 驱动。

## 部署 (Vercel)

1. 把这个文件夹整个上传到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入这个仓库
3. 在 Vercel 项目的 **Settings → Environment Variables** 添加:
   - Name: `GEMINI_API_KEY`
   - Value: 你的 Google Gemini API key (`AIza...` 开头)
4. 点击 Deploy

## 可选环境变量

- `GEMINI_MODEL` —— 默认 `gemini-2.5-flash`。改成 `gemini-2.5-pro` 用 Pro 模型

## 本地开发

```bash
npm install
# 创建 .env.local 文件,内容: GEMINI_API_KEY=你的key
npm run dev
```

打开 http://localhost:3000

## 成本预估

每位玩家完整玩一局大约:
- gemini-2.5-flash: $0.02 - $0.05 / 局 (标准模式)  /  $0.01 - $0.02 / 局 (速战模式)
- gemini-2.5-pro: $0.30 - $0.80 / 局

建议在 Google Cloud Console 设置每日预算告警,防止超支。

## 文件结构

```
banquet-simulator/
├── app/
│   ├── api/chat/route.js        # 后端: 调用 Gemini 的代理
│   ├── disclaimer-content.js    # 免责声明文本(可编辑)
│   ├── globals.css
│   ├── layout.js
│   └── page.js                  # 游戏主界面
├── public/
│   ├── donate-wechat.jpg        # 你的微信收款码(自行添加)
│   ├── donate-alipay.jpg        # 你的支付宝收款码(自行添加)
│   └── images/                  # 角色头像 + 菜品图片(后续添加)
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

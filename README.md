# 修行法語 · 濟公活佛 KTV 聲光同步簡報 (KTV Dao Presentation with Gemini 3.1 TTS)

一套專為修行法語、聖哲名言打造的高質感 KTV 聲光同步展示系統，整合 **Google AI Studio 的 Gemini 3.1 Flash TTS (`gemini-3.1-flash-tts-preview`)** 語音生成技術，支援一鍵部署至 **[Vercel (anhome)](https://vercel.com/anhome)** 與 GitHub。

---

## 🌟 核心特色

1. **KTV 聲光同步導唱引擎**：
   - 英文逐字金光高亮 (`.ktv-word.active-word`) 與動態跳動蓮花球。
   - 中文對照翻譯同步點亮，並帶有旋轉金色蓮花法輪徽章。
   - 純淨 16:9 濟公活佛名畫背景，右側晨曦宣紙融合，徹底解決疊字殘影。

2. **雙 Speaker 預載母帶 & Gemini 3.1 Flash TTS 語音工作室**：
   - **免 API 額度快速聆聽**：預載 Speaker 1 (慈悲女聲) 與 Speaker 2 (莊嚴男聲) 母帶音訊，一般訪客無需 API Key 即可自由聆聽。
   - **Google AI Studio 級別調校**：支援 `gemini-3.1-flash-tts-preview`，13 組男女聲音色庫（Aoede, Kore, Charon, Puck, Fenrir, Algieba 等）。
   - **Director's note 導演筆記**：提供 Style（Whisper / Calm / Meditative / Storyteller）、Pace（The Drift / Slow / Medium / Fast）、Accent（US / GB / AU / IN）精細調校。

3. **自訂法語與中英對照 Markdown 編輯器**：
   - 支援 `.md` 格式匯入與「上英下中」翻譯指引。
   - 內建智慧時間軸對齊演算法，自動計算每個單詞的 KTV 停留時間。

4. **🛡️ 企業級零信任資安架構**：
   - **零信任 Client Key**：伺服器不保存亦不提供共用金鑰，使用者金鑰僅存放於瀏覽器本機並支援一鍵即時清除。
   - **假 Key 零延遲攔截**：正則式 `^AIzaSy[A-Za-z0-9_-]{33}$` 格式預驗證，0ms 阻擋偽造金鑰，杜絕無效上游請求。
   - **輸入串流保護**：16 KB 硬性上限與 3 秒獨立讀取逾時（防護 Slowloris 與記憶體耗盡）。
   - **全週期逾時**：15 秒 `AbortController` 完整涵蓋網路傳輸與反序列化。
   - **應用層限流 & Vercel WAF 整合**：內建滑動窗口限流（每 IP 每分鐘 10 次）並支援 Vercel WAF 限流規則。

---

## 🚀 本地開發與測試

```bash
# 1. 安裝相依套件
npm install

# 2. 啟動開發伺服器
npm run dev

# 3. 在瀏覽器打開
http://localhost:3000
```

---

## 📦 部署到 GitHub 與 Vercel 指南

### 步驟 1：推送到您的 GitHub Repository

```bash
# 初始化或提交變更
git add .
git commit -m "feat: complete KTV Dao Presentation with Gemini 3.1 TTS"

# 關聯至您的 GitHub
git branch -M main
git remote add origin https://github.com/anhome/ktv-dao-presentation.git
git push -u origin main
```

### 步驟 2：在 Vercel 上完成一鍵部署

1. 前往 **[Vercel 控制台 (https://vercel.com/anhome)](https://vercel.com/anhome)**。
2. 點擊 **"Add New..."** → **"Project"**。
3. 匯入 GitHub 倉庫 (`ktv-dao-presentation`)。
4. **無需設定伺服器環境變數**（本專案採用零信任使用者金鑰架構，使用者於前台調校視窗輸入自己的 Google AI Studio API Key 即可自訂生成）。
5. 點擊 **"Deploy"**，約 1 分鐘內即可自動建置完成！

### 步驟 3（推薦）：設定 Vercel WAF 邊緣防禦限流 (Edge Rate Limiting)

若需在 Vercel 邊緣網路層跨多實例共享限流，可於 Vercel 專案設定中啟用 WAF 限流規則：
1. 進入 Vercel Project → **Settings** → **Security** / **Firewall**。
2. 新增 Rate Limiting 規則：
   - **Path**: `/api/tts`
   - **Method**: `POST`
   - **Rate Limit**: 10 requests / 60 seconds per IP
   - **Action**: Deny (429 Too Many Requests)

---

## 🛠️ 技術架構

- **Framework**: Next.js 16.3.5 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: EB Garamond (Classic Book Serif), LXGW WenKai TC / 標楷體 BiauKai (Calligraphy)
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API & HTML5 Audio
- **AI Engine**: Google AI Studio Gemini API (`gemini-3.1-flash-tts-preview`, `gemini-2.5-flash`)


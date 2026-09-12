# 修行法語 · 濟公活佛 KTV 聲光同步簡報 (KTV Dao Presentation with Gemini 3.1 TTS)

一套專為修行法語、聖哲名言打造的高質感 KTV 聲光同步展示系統，整合 **Google AI Studio 的 Gemini 3.1 Flash TTS (`gemini-3.1-flash-tts-preview`)** 語音生成技術，支援一鍵部署至 **[Vercel (anhome)](https://vercel.com/anhome)** 與 GitHub。

---

## 🌟 核心特色

1. **KTV 聲光同步導唱引擎**：
   - 英文逐字金光高亮 (`.ktv-word.active-word`) 與動態跳動蓮花球。
   - 中文對照翻譯同步點亮，並帶有旋轉金色蓮花法輪徽章。
   - 純淨 16:9 濟公活佛名畫背景，右側晨曦宣紙融合，徹底解決疊字殘影。

2. **雙 Speaker 預載母帶 & Gemini 3.1 Flash TTS 語音工作室**：
   - **免 API 額度快速聆聽**：預載 Speaker 1 (慈悲女聲) 與 Speaker 2 (莊嚴女聲) 母帶音訊，一般訪客無需 API Key 即可自由聆聽。
   - **Google AI Studio 級別調校**：支援 `gemini-3.1-flash-tts-preview`，13 組男女聲音色庫（Aoede, Kore, Charon, Puck, Fenrir, Algieba 等）。
   - **Director's note 導演筆記**：提供 Style（Whisper / Calm / Meditative / Storyteller）、Pace（The Drift / Slow / Medium / Fast）、Accent（US / GB / AU / IN）精細調校。

3. **自訂法語與中英對照 Markdown 編輯器**：
   - 支援 `.md` 格式匯入與「上英下中」翻譯指引。
   - 內建智慧時間軸對齊演算法，自動計算每個單詞的 KTV 停留時間。

4. **🛡️ 企業級零信任資安與費用防護架構**：
   - **零信任 Client Key 與記憶體優先儲存**：伺服器不保存亦不提供共用金鑰。預設僅存於瀏覽器當次記憶體中，使用者可自主勾選是否記住在本機，支援一鍵即時清除。
   - **HTTP Header 金鑰傳輸 (`x-goog-api-key`)**：與 Google API 通訊時將金鑰存放於 HTTP 標頭而非網址查詢字串，杜絕伺服器日誌與代理存取記綠外洩金鑰。
   - **防重複提交與雙端並發鎖 (Concurrency Lock)**：前端按鈕與處理函式具備原子鎖，API 端實作同 IP 在線併發阻斷（409 Conflict），杜絕重複點擊或多視窗併發產生的重複計費與資源浪費。
   - **假 Key 零延遲攔截**：正則式 `^AIzaSy[A-Za-z0-9_-]{33}$` 格式預驗證，0ms 阻擋偽造金鑰，杜絕無效上游請求。
   - **輸入串流保護**：16 KB 硬性上限與 3 秒獨立讀取逾時（防護 Slowloris 與記憶體耗盡）。
   - **全週期逾時**：15 秒 `AbortController` 完整涵蓋網路傳輸與反序列化。
   - **應用層限流 & Vercel WAF 整合**：內建滑動窗口限流（每 IP 每分鐘 10 次）並支援 Vercel WAF 限流規則。

---

## 💰 費用控制與帳單安全指南 (Spend Management)

1. **Google Cloud / AI Studio 費用控制**：
   - **免費方案 (Free Tier)**：預設使用未綁定信用卡之 Google AI Studio Key，每分鐘享有 15 次免費請求，超過僅收到 429 限制，**保證 0 費用**。
   - **付費方案預算上限 (Project Spend Caps)**：若綁定了付費專案，建議在 [Google Cloud Billing 預算控制台](https://console.cloud.google.com/billing) 設定 **預算警報 (Budgets & Alerts)** 與每日/每月花費上限，防止非預期用量。
2. **Vercel 方案用量保護**：
   - 在 Vercel Project → **Settings** → **Billing** / **Spend Management** 啟用自動通知或用量暫停，防止流量異常暴增。

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

## 🛡️ 並行控制與跨實例防護架構 (Concurrency & Rate Limiting Architecture)

- **前端跨分頁完整同步 (Cross-Tab Synchronization)**：
  1. **BroadcastChannel 即時廣播**：透過 `dharma_tts_sync` 頻道在生成開始 (`TTS_START`) 與結束 (`TTS_END`) 即時同步全部分頁狀態，阻止多開分頁重複提交。
  2. **跨分頁租約鎖 (Lease Lock)**：寫入 `DHARMA_TTS_LOCK`（具 25 秒自動過期機制），結合 `window.storage` 事件與 `beforeunload` 釋放機制，即使分頁重整或延遲開啟也能確保狀態互斥。
- **後端跨實例防護雙模設計 (Dual-Mode Backend Defense)**：
  - **預設零相依模式 (Default Zero-Config)**：
    - 同實例後端鎖：記憶體 Set/Map 在同實例內以原子序列阻擋重複請求（回傳 `409 Conflict`）。
    - 邊緣層 WAF 限流：部署時於 Vercel 防火牆設定 `/api/tts` 限流（10 req/min），在邊緣節點控制請求頻率。
  - **生產級跨實例分散式鎖 (Optional Distributed Mutex Lock)**：
    - 若需嚴格杜絕 Serverless 多實例同時處理同一 IP 的並行生成，只需在環境變數配置 Upstash Redis 或 Vercel KV（`UPSTASH_REDIS_REST_URL` / `KV_REST_API_URL`）。
    - 系統將自動升級為跨實例原子互斥鎖（`SET NX EX 20`）與分散式計數限流，無須額外安裝 npm 套件，零維護成本即可全球跨實例去重。
- **逾時與費用責任邊界**：逾時 (15s) 代表代理層中斷等待，不代表上游已呼叫完畢；所有 Gemini TTS 調用皆使用訪客自行輸入的 Google API Key，不消耗開發者或伺服器專案之 AI 額度。

---

## 🛠️ 技術架構

- **Framework**: Next.js 16.3.5 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: EB Garamond (Classic Book Serif), LXGW WenKai TC / 標楷體 BiauKai (Calligraphy)
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API & HTML5 Audio
- **AI Engine**: Google AI Studio Gemini API (`gemini-3.1-flash-tts-preview`, `gemini-2.5-flash`)


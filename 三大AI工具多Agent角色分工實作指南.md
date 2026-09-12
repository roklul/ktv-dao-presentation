
# 一種「多 AI Agent、角色分工」的開發工作流：
 * Claude Code：扮演顧問／Reviewer
 * 檢查專案架構、安全性、部署風險與技術債
 * 提出優先級與建議，例如 P0、P1 項目
 * 原則上不直接改檔、不執行部署操作
 * ChatGPT Codex：扮演實作者／Coding Agent
 * 依據需求與顧問建議，新增 DDL、修改設定、重構程式
 * 可以讀取專案、執行測試、建立分支與提交 Git 變更
 * 需要明確限制其權限，避免在未確認時直接做破壞性操作
這種模式本質上是：
> Advisor / Architect Agent → Implementer Agent → Reviewer / Test Agent
而不是讓同一個 AI 同時負責分析、寫程式、審核與部署。分工後可以降低「AI 自己提出建議、自己修改、自己說沒問題」的盲點。
----------------------------------------
是否有類似工具或架構？
有，而且可分成三類。
類型 代表工具／框架 適合情境 IDE 內的多 Agent 工作流 Claude Code、Codex、Cursor、Windsurf、Cline、Roo Code 個人或小團隊日常開發 GitHub PR 驅動的 AI 協作 GitHub Copilot、CodeRabbit、Greptile、Qodo Merge、Sourcery 團隊 Code Review、品質閘門 可自行編排的多 Agent 框架 LangGraph、AutoGen、CrewAI、OpenAI Agents SDK、Microsoft Semantic Kernel 要建立自訂 AI 開發流程、企業內部平台
----------------------------------------
最接近的實作方式
架構一：最實用的 GitHub Pull Request 工作流
這是最推薦的方式。核心原則是：顧問 AI 不直接寫入主分支；實作 AI 只能透過分支與 PR 交付。
需求 / Issue
 │
 ▼
[顧問 Agent：Claude Code]
- 分析現況
- 產出風險、設計、驗收條件
- 寫入 GitHub Issue / ADR / 設計文件
 │
 ▼
[實作 Agent：Codex / Copilot Coding Agent]
- 從 issue 建立 feature branch
- 修改程式、補 migration、寫測試
- 建立 Pull Request
 │
 ▼
[審查 Agent：CodeRabbit / Copilot Code Review / Claude]
- 安全性掃描
- 邏輯與可維護性審查
- 檢查是否符合顧問建議與驗收條件
 │
 ▼
[CI/CD]
- Build、Unit Test、Integration Test
- SAST、Dependency Scan、Secret Scan
 │
 ▼
人工核准後 Merge
建議 GitHub 工具組合
角色 可選工具 工作內容 顧問／架構審查 Claude Code、ChatGPT、GitHub Copilot Chat 產出設計、風險清單、驗收條件、ADR 實作 Agent Codex、GitHub Copilot Coding Agent、Claude Code、Cursor 修改程式、建立 migration、補測試、開 PR PR Reviewer CodeRabbit、GitHub Copilot Code Review、Qodo Merge、Greptile 自動審查 PR、留下 review comment 安全 Agent GitHub CodeQL、Dependabot、GitHub Secret Scanning、Snyk 掃描弱點、依賴套件與機密資訊 CI 驗證 GitHub Actions 測試、Lint、Build、資料庫 migration 驗證
若你的程式放在 GitHub，這套做法能相當完整地重現圖中的「Claude 顧問 + Codex 實作」模式。
----------------------------------------
GitHub 上如何明確區分 Agent 角色？
關鍵不是只靠不同 AI 工具，而是把角色責任寫成不可跨越的規則。
例如：
1. 顧問 Agent 規範
可建立 docs/ai/consultant-role.md：
# Consultant Agent Rules
你是架構與安全顧問，不是實作者。
允許：
- 閱讀程式碼與設定
- 分析風險與提出改善建議
- 產出設計方案、驗收條件與 migration 規格
- 在 Issue 或 PR 留下評論
禁止：
- 修改原始碼
- 執行資料庫 migration
- 修改部署設定
- 合併 Pull Request
- 存取或輸出敏感資訊
2. 實作 Agent 規範
可建立 docs/ai/implementation-role.md：
# Implementation Agent Rules
你是實作 Agent。
允許：
- 僅在 feature branch 修改程式碼
- 新增 migration、測試與文件
- 執行本機或 CI 測試
- 建立 Pull Request
禁止：
- 直接修改 main / production 分支
- 直接部署 production
- 執行不可逆資料庫操作
- 修改 secrets、憑證或正式環境設定
- 未經確認刪除資料表或大量資料
3. Reviewer Agent 規範
# Reviewer Agent Rules
你只負責審查與提出修正意見。
檢查項目：
- 是否符合 Issue 的驗收條件
- 是否違反安全規範
- 是否包含測試與 migration rollback 策略
- 是否改動超出需求範圍
- 是否有敏感資訊、SQL injection、權限繞過等問題
這類規則可搭配 AGENTS.md、CLAUDE.md、CONTRIBUTING.md 或 repository instructions 使用。不同工具讀取的檔名不同，但核心概念一致：規則版本化，跟著程式碼一起管理。
----------------------------------------
建議的 Repository 結構
repo/
├─ .github/
│ ├─ workflows/
│ │ ├─ ci.yml
│ │ ├─ security.yml
│ │ └─ migration-check.yml
│ ├─ pull_request_template.md
│ └─ CODEOWNERS
│
├─ docs/
│ ├─ adr/
│ ├─ ai/
│ │ ├─ consultant-role.md
│ │ ├─ implementation-role.md
│ │ └─ reviewer-role.md
│ └─ deployment/
│
├─ db/
│ └─ migration/
│ ├─ 001_...
│ ├─ 004_...
│ └─ 005_firewall_request.sql
│
├─ AGENTS.md
└─ README.md
其中：
 * AGENTS.md：放所有 AI 都必須遵守的專案規則。
 * docs/ai/：放各角色的責任與權限限制。
 * .github/pull_request_template.md：要求實作者說明 migration、測試、回滾方式與安全影響。
 * CODEOWNERS：敏感模組如認證、權限、資料庫 migration，要求真人或特定 reviewer 核准。
----------------------------------------
對你圖中案例的實際流程示例
以 FIREWALL_REQUEST DDL 為例：
Step 1：Claude Code 擔任顧問
只做分析，輸出例如：
## 建議：新增 005_firewall_request.sql
### 驗收條件
- 不影響既有資料表
- 適用 SQL Server
- 欄位、主鍵、索引與 Java Entity 一致
- 新表建立後可完成完整部署
- migration 可重複執行時有明確行為
- 不使用 DROP TABLE 作為初始化手段
### 風險
- 需確認正式環境是否已手動建立同名資料表
- 要檢查外鍵依賴與交易行為
- JSP 的 CSRF token 問題應獨立驗證，不應混在 DDL PR
Step 2：Codex 擔任實作者
 * 建立 feature/firewall-request-migration
 * 新增 005_firewall_request.sql
 * 補 migration 測試或部署驗證說明
 * 建立 PR
Step 3：Reviewer Agent 審查 PR
檢查：
 * SQL Server 語法是否正確；
 * 是否有不安全的 DROP TABLE；
 * 欄位是否與 Entity / Mapper 一致；
 * 是否漏掉索引、預設值、非空限制；
 * 是否有 rollback 或部署說明；
 * 是否只做此 Issue 範圍內的改動。
Step 4：GitHub Actions 自動驗證
 * 編譯專案；
 * 執行單元測試；
 * 建立臨時 MSSQL 容器或測試資料庫；
 * 執行 migration；
 * 啟動應用程式的 smoke test；
 * 執行 CodeQL、依賴漏洞掃描與 Secret Scanning。
最後必須由人員核准才能 merge 到 main 或 release branch。
----------------------------------------
若要更進一步：真正的「多 Agent 協作系統」
若你不是只要 PR 流程，而是希望 AI 能自動互相交接任務，可用以下框架：
LangGraph
適合把 Agent 工作流做成有狀態的流程圖：
需求分析 Agent
 ├─→ 安全顧問 Agent
 ├─→ 架構顧問 Agent
 └─→ 任務拆解 Agent
 │
 ▼
 實作 Agent
 │
 ▼
 測試 Agent
 │
 ▼
 Code Review Agent
 │
 通過？──否──→ 回到實作 Agent
 │
 是
 ▼
 建立 PR / 等待人工核准
優點是流程、狀態、重試與人工核准節點都可控；缺點是需要自行開發與維運。
Microsoft AutoGen / CrewAI
適合快速建立「多角色對話」：
 * ArchitectAgent
 * SecurityReviewerAgent
 * DeveloperAgent
 * TestEngineerAgent
 * ReleaseManagerAgent
但實務上一定要加上：
 1. Git 分支隔離；
 2. PR 強制審查；
 3. CI 測試；
 4. production 禁止 AI 直連；
 5. 人工批准閘門。
否則多 Agent 只是讓多個 AI 更快地一起犯錯。
----------------------------------------
最務實的推薦方案
若你目前已經在用 Claude Code 與 ChatGPT Codex，建議不要急著自建 LangGraph 或 CrewAI 平台，先採用下面這個組合：
層面 建議 顧問／架構 Claude Code，只讀模式，不允許改檔或執行破壞性命令 程式實作 Codex 或 GitHub Copilot Coding Agent，只能在 feature branch 操作 PR 自動審查 CodeRabbit 或 GitHub Copilot Code Review 安全檢查 CodeQL、Dependabot、Secret Scanning 自動測試 GitHub Actions 最終決策 人工 Code Owner / Tech Lead 核准
也就是：
> Claude 負責「該不該做、怎麼做才安全」；Codex 負責「依規格實作」；GitHub PR、CI 與真人負責「驗證能不能合併」。
這比讓任一 AI 擁有「完整存取權」、又同時擔任顧問與執行者，更適合正式專案與團隊協作。

請分析上面實作方式，目前ai三大工具與app都有 google 的antigravity app/cli、openai chatgpt codex  app/ cli、anthropic claude app/code，然後說明給初學者的實作方式



## 概要

最穩健、最適合初學者落地的多 Agent 開發模式，不是讓 Claude Code、Codex 或 Antigravity 中的任何一個工具取得「完整權限」並自行完成分析、修改、測試、審核與部署，而是將責任切開：

> **Advisor / Architect → Implementer → Independent Reviewer / Test Gate → Human Approval**

在此模式中，Claude Code 最適合擔任高品質的架構、安全與程式碼顧問；ChatGPT Codex 最適合受控地進行跨檔案實作、測試與 Git 變更；Google Antigravity 最適合做可視化的多 Agent 協調、背景任務、平行子代理與瀏覽器驗證。三者都能支援類似的工作流，但它們在「控制平面、指令檔、權限模型與多 Agent 編排」上的強項不同。

初學者不應一開始就建置 LangGraph、CrewAI 或 AutoGen 形式的自治多 Agent 平台。最有效的起點是建立一個受 Git 分支、Pull Request、CI、安全掃描與人工核准保護的工作流：Claude 產出設計與風險規格，Codex 在 feature branch 實作，第二個獨立 Agent 與 CI 驗證結果，人類 Code Owner 最後決定是否合併。

Claude Code 的官方 Code Review 已採多代理並行分析與驗證候選問題的架構，能在完整程式庫脈絡中檢查邏輯錯誤、安全漏洞、邊界情況與回歸風險；這正體現「實作者不應同時是唯一審查者」的設計原則。[[1](https://code.claude.com/docs/en/code-review)]

## 為何必須分離顧問、實作與審查角色

同一個 Agent 若連續完成「需求理解 → 設計決策 → 實作 → 自我測試 → 自我審查」，很容易產生確認偏誤。它通常會沿用自己最初的假設、忽略原先設計的盲點，並把「測試通過」誤判為「業務、安全與部署風險皆已排除」。

多 Agent 分工的真正價值不在於同時開很多聊天視窗，而在於建立**獨立觀點、獨立權限與獨立驗證證據**。

| 階段 | 主責角色 | 可做的事 | 不應做的事 | 主要交付物 |
|---|---|---|---|---|
| 分析與架構 | Advisor / Architect Agent | 讀取程式碼、分析風險、設計資料模型、列驗收條件 | 直接改碼、執行 migration、部署正式環境 | ADR、Issue、風險清單、P0/P1、驗收條件 |
| 程式實作 | Implementer Agent | 建分支、修改程式、加 DDL、補測試、提交 Git 變更、開 PR | 直接合併 main、正式部署、改 secrets、破壞性資料操作 | Feature branch、PR、測試結果、變更說明 |
| 獨立審查 | Reviewer Agent | 檢查 diff、對照規格、分析安全與回歸 | 代替人類核准、直接部署 | PR review、阻擋項目、修正建議 |
| 自動驗證 | CI/CD 與安全工具 | Build、test、lint、SAST、依賴與秘密掃描 | 替代架構判斷或產品責任 | 可重複的機器驗證結果 |
| 最終治理 | 人類 Tech Lead / Code Owner | 判斷風險接受度、核准 merge、安排 release | 將責任完全交給 Agent | Merge / release 決策 |

這種職責分離尤其適合下列高風險變更：

- DDL、資料庫 migration、資料回填與 schema 演進。
- 認證、授權、權限檢查、Session、CSRF、OAuth、API key。
- 金流、訂單、計費、庫存與帳務一致性。
- Docker、Kubernetes、Terraform、Cloud IAM、CI/CD workflow。
- 正式環境設定、feature flag、secrets 與憑證。
- 大規模重構、依賴升級與刪除舊模組。

## 三大 Agent 平台的定位

目前最具代表性的三組產品可視為三種不同的工作方式：

| 平台 | 主要介面 | 核心優勢 | 最適合的角色 | 初學者建議定位 |
|---|---|---|---|---|
| Anthropic Claude Code | CLI、IDE、桌面、Web、Slack 等 | 程式庫理解、長任務、指令與規則、PR review、子代理 | 顧問、架構師、獨立 reviewer | 優先設為只讀顧問與審查者 |
| OpenAI ChatGPT Codex | ChatGPT App、CLI、IDE、Cloud | 受控實作、workspace 操作、分支與 worktree、程式審查 | 實作者、測試修正者 | 優先設為 feature branch 實作者 |
| Google Antigravity | Desktop App、IDE、CLI、SDK | 多 Agent 協調、背景任務、子代理、工作樹、瀏覽器驗證 | 協調者、平行研究／測試中心 | 在熟悉 Git/PR 後作為多 Agent 控制台 |

Claude Code 可直接在程式庫中閱讀、編輯、執行命令、完成問題修正與 PR 流程，但它的最佳實務明確強調：每一個任務都應提供可執行的驗證訊號，例如測試、建置、lint、輸出 diff 或快照比對，讓 Agent 能根據通過／失敗結果迭代，而不是只憑「看起來完成」。[[2](https://code.claude.com/docs/en/best-practices)]

Codex 同時提供本機與雲端工作方式；其本機 CLI／IDE 延伸採用 OS 層級 sandbox，預設限制可寫入範圍與網路權限，而雲端工作則在隔離容器中執行，並將 setup 階段與 Agent 執行階段區分處理。[[3](https://learn.chatgpt.com/docs/agent-approvals-security)]

Antigravity 2.0 已從 IDE 內的 Agent Manager 擴展為獨立控制台，可同時管理多個本機 Agent、排程任務、使用 MCP 連接外部系統，並保留 IDE 與 CLI 作為不同操作入口。[[4](https://codelabs.developers.google.com/getting-started-google-antigravity)]

![Antigravity IDE 的 Agent Panel 與專案工作區示意[2]](https://codelabs.developers.google.com/static/getting-started-google-antigravity/img/f6af75f8e99cbbc6.png)

## Claude Code：最適合擔任顧問與獨立審查者

### 建議角色：Advisor / Architect / Reviewer

Claude Code 的價值不只在寫程式，而在於快速建立程式庫的系統性理解：模組邊界、依賴方向、資料流、測試習慣、既有架構限制與潛在風險。對初學者而言，這是最值得先建立的使用習慣：**先讓 Agent 分析並寫出可檢查的規格，再讓另一個 Agent 實作。**

Claude Code 支援 `CLAUDE.md` 作為持久化專案說明；官方建議其內容保持具體、簡潔、可驗證，並以每個檔案少於約 200 行為目標。若規則逐漸變多，應以路徑範圍規則拆分，避免每次啟動都把龐大規範塞進 context。[[5](https://code.claude.com/docs/en/memory)]

### 建議權限模式

Claude Code 可使用多種權限模式，包括 Manual、Accept edits、Plan、Auto 與 Bypass permissions。對顧問或 reviewer 角色，應使用 **Plan 或 Manual**；不要讓其成為可以自動寫檔與執行命令的實作者。[[6](https://code.claude.com/docs/en/permission-modes)]

| Claude Code 模式 | 初學者用途 | 顧問角色適合度 |
|---|---|---|
| Manual | 每次敏感操作均要求核准 | 高 |
| Plan | 僅調查與提出執行計畫，不修改程式 | 最高 |
| Accept edits | 自動修改 workspace 內檔案 | 不建議用於顧問 |
| Auto | 在授權邊界內自動操作 | 僅適合受控實作任務 |
| Bypass permissions | 大幅跳過互動核准 | 不適合一般專案工作流 |

Claude Code 的 Plan mode 適合在需求尚不清楚、將修改資料庫或安全模組、或需要先釐清影響範圍時使用。顧問 Agent 的合理輸出應包含：

- 現況與受影響模組。
- 可行設計方案與取捨。
- P0、P1、P2 風險分級。
- 不可違反的約束條件。
- 明確驗收條件。
- migration、回滾與部署前置條件。
- 應由 CI 檢查的項目。
- 不應混入本次 PR 的非相關修正。

### Claude 顧問提示詞範本

```text
你是本專案的架構、安全與部署風險顧問，不是實作者。

工作範圍：
- 只讀取並分析目前 repository。
- 不修改任何原始碼、設定檔、migration 或部署檔。
- 不執行 migration、部署、git push、git merge 或任何破壞性命令。
- 不要求或輸出 secrets、token、憑證或正式環境資料。

任務：
1. 分析實作此需求涉及的模組、資料表、API 與部署面影響。
2. 提供至少一個推薦方案與必要時的替代方案。
3. 將問題分為 P0、P1、P2。
4. 定義可由 CI 或 reviewer 驗證的驗收條件。
5. 產出給 Implementer Agent 的實作規格。
6. 特別列出 migration 相容性、rollback、資安與正式部署風險。

最後請使用以下結構：
- 現況摘要
- 建議設計
- P0 / P1 / P2
- 驗收條件
- 實作範圍
- 禁止變更範圍
- 測試與部署檢查清單
```

### Claude Code 作為 PR Reviewer

Claude Code 的官方 Code Review 能以多個專門 Agent 平行檢查 PR diff 與周邊程式碼，再由驗證流程過濾誤報、去除重複項、依嚴重度排序，並以 GitHub inline comment 呈現結果。[[1](https://code.claude.com/docs/en/code-review)]

對於沒有 Team／Enterprise Code Review 的使用者，仍可採取兩種方式：

- 在本機使用 Claude Code 的 `/code-review` 檢查目前 diff。
- 透過 GitHub Actions 讓 Claude Code 回應 Issue、PR comment 或固定 GitHub event。[[7](https://code.claude.com/docs/en/github-actions)]

重要原則是：**Reviewer 必須讀取 Issue 規格、ADR 與 PR diff，不能只看最後的程式碼。** 否則它無法判斷「實作是否偏離原始需求」。

## ChatGPT Codex：最適合擔任受控實作者

### 建議角色：Implementer / Coding Agent

Codex 適合接收一份已經被整理過的任務規格，例如 GitHub Issue、ADR、設計文件或 Claude 顧問輸出。它的任務應是「依既定規格完成可驗證的變更」，不是重新決定架構方向。

Codex 可在工作區內讀取程式碼、執行測試、修改檔案並建立 Git 變更；其安全架構將 sandbox mode 與 approval policy 分成兩層：前者限定技術上能接觸的資源，後者決定哪些行為需要停下來要求使用者確認。[[3](https://learn.chatgpt.com/docs/agent-approvals-security)]

### Codex 權限與 sandbox 的核心原則

Codex 的本機 Auto 類型設定通常對應到 workspace-write 與 on-request：Agent 可在工作目錄中讀寫、執行命令，但對 workspace 外檔案或需要網路的命令要求核准。[[3](https://learn.chatgpt.com/docs/agent-approvals-security)]

較新的 Codex permission profiles 可使用內建 `:read-only`、`:workspace` 與 `:danger-full-access`，並定義細緻的檔案與網路規則；其中 `:danger-full-access` 移除本機 sandbox 限制，應只在明確且必要的情境下使用。[[8](https://learn.chatgpt.com/docs/permissions)]

| Codex 權限設定 | 合理用途 | 是否建議初學者預設使用 |
|---|---|---|
| `:read-only` | 架構理解、程式碼探索、審查 | 是 |
| `:workspace` | 在目前專案內實作與測試 | 是，最推薦 |
| 自訂 profile | 允許特定目錄、拒絕 `.env`、限制網域 | 團隊成熟後使用 |
| `:danger-full-access` | 需要明確全機器存取的特殊任務 | 否 |

Codex 的網路權限必須額外謹慎處理。即使啟用 network access，若沒有啟用 network proxy，設定中的網域規則不一定能約束直接對外連線；要做網域限制，必須同時啟用 proxy 與相應網路政策。[[8](https://learn.chatgpt.com/docs/permissions)][[3](https://learn.chatgpt.com/docs/agent-approvals-security)]

### Codex 實作者提示詞範本

```text
你是 Implementer Agent，只負責在目前 feature branch 依規格實作。

必須遵守：
- 只修改目前 workspace 與目前 Git branch。
- 不可修改 main、master、release 或 production 分支。
- 不可 git push、git merge、建立 release、部署正式環境。
- 不可讀取、修改或輸出 .env、secrets、SSH key、憑證、token。
- 不可執行 DROP DATABASE、DROP TABLE、TRUNCATE、大量 DELETE、
  不可逆 migration 或任何未明確核准的破壞性指令。
- 不可擴大需求範圍；發現規格矛盾時停止並回報問題。

任務輸入：
- GitHub Issue：<連結或文字>
- 顧問規格：<貼上 Claude 建議>
- 驗收條件：<貼上 checklist>

執行方式：
1. 先閱讀 AGENTS.md、README、相關 CLAUDE.md 與既有 migration 規則。
2. 列出預計修改的檔案與測試策略。
3. 在 feature branch 實作。
4. 執行 lint、build、unit test 與必要的 integration test。
5. 回報每一項驗收條件是否通過。
6. 產出 PR 說明，包括 migration、rollback、測試與已知限制。
```

### 使用 `AGENTS.md` 統一 Codex 規則

Codex 會在工作開始前讀取 `AGENTS.md`；它會由全域目錄、專案根目錄一路到目前工作目錄建立指令鏈，越靠近當前目錄的規則會排在後面，因此具有更高的實際覆蓋效果。[[9](https://learn.chatgpt.com/docs/agent-configuration/agents-md)]

建議將跨工具共用規則放在根目錄的 `AGENTS.md`，再讓 Claude 的 `CLAUDE.md` 匯入它。Claude Code 官方明確指出，Claude 原生讀取的是 `CLAUDE.md` 而非 `AGENTS.md`；若要共用規範，可在 `CLAUDE.md` 中用 `@AGENTS.md` 匯入。[[5](https://code.claude.com/docs/en/memory)]

```markdown
<!-- CLAUDE.md -->
@AGENTS.md

## Claude 專屬規則
- 預設先提出計畫與風險，不直接實作。
- 對資料庫、認證、部署與安全相關變更，先輸出 P0/P1 風險。
```

## Google Antigravity：最適合擔任多 Agent 協調層

### 建議角色：Orchestrator / 多工控制台

Antigravity 的特色不是單純「又一個 coding assistant」，而是將多個 Agent session、背景任務、排程、worktree、瀏覽器操作與 MCP 整合集中到同一個控制平面。它特別適合當任務開始變得複雜，例如需要平行進行：

- 一個 Agent 搜尋程式庫與整理現況。
- 一個 Agent 分析資安與權限問題。
- 一個 Agent 實作功能。
- 一個 Agent 執行測試與瀏覽器驗證。
- 一個 Agent 審查最終 diff。

Antigravity 的 asynchronous subagents 可並行執行，且子代理有獨立 context，不會繼承父 Agent 的完整對話歷史，這能避免主工作階段被大量搜尋與測試細節淹沒。[[10](https://antigravity.google/docs/subagents/)]

### Worktree 隔離的價值

Antigravity 原生支援 Git worktree，讓 Agent 在隔離的背景資料夾內工作；這是避免多 Agent 同時改同一份檔案、污染彼此未提交變更的重要機制。[[11](https://antigravity.google/docs/features/)]

Antigravity 子代理可選擇：

| 工作空間模式 | 用途 | 適合任務 |
|---|---|---|
| `inherit` | 使用父 Agent 同一工作區 | 純研究、小型讀取任務 |
| `branch` | 建立隔離 Git worktree | 實作、重構、獨立修復 |
| `share` | 共用目錄儲存 | 需共享產物但風險較高的協作 |

子代理可以並行執行並透過控制面板監控，父 Agent 也能保留對子工作區的存取權。[[10](https://antigravity.google/docs/subagents/)]

### Antigravity 權限模型

Antigravity 對 `read_file`、`write_file`、`read_url`、`execute_url`、`command`、`unsandboxed` 與 `mcp` 等操作使用 Allow、Ask、Deny 三層清單；衝突時固定採取：

> **Deny > Ask > Allow**。[[12](https://antigravity.google/docs/permissions/)]

這非常適合對不同角色設定不同邊界。例如：顧問 Agent 沒有 `write_file` 與 `run_command`；實作者只允許 workspace 檔案與測試命令；部署相關工具則永遠在 Ask 或 Deny。

Antigravity 預設會自動允許目前專案工作區內的讀寫，但其他未設定動作，包括 command、MCP、workspace 外檔案與 URL 執行，通常會要求確認。[[12](https://antigravity.google/docs/permissions/)]

### 初學者推薦的 Antigravity 配置

| Agent | 模型與工具概念 | 權限原則 | 交付物 |
|---|---|---|---|
| `architect` | 檔案閱讀、搜尋、無寫入工具 | 只讀、禁止 command | 規格、風險、驗收條件 |
| `implementer` | 閱讀、修改、執行測試 | 限 workspace、只允許安全測試命令 | feature branch 變更 |
| `security-reviewer` | 閱讀、搜尋、靜態掃描命令 | 只讀、sandbox | P0/P1 安全 findings |
| `test-runner` | 測試與建置工具 | sandbox、有限 command allowlist | 測試紀錄 |
| `release-gate` | 只讀 CI/PR 結果 | 無部署權限 | 是否可進入人工核准 |

Antigravity 的自訂 Agent 可用 Markdown 與 YAML frontmatter 定義，存放於專案的 `.agents/agents/` 或使用者全域的 `~/.gemini/config/agents/`。每個 Agent 可以指定工具、模型、可否作為主 Agent 或子 Agent、命令執行政策、MCP 伺服器與 skills。[[13](https://antigravity.google/blog/introducing-custom-agents)][[10](https://antigravity.google/docs/subagents/)]

以下是可直接作為起點的顧問 Agent 範例：

```markdown
---
name: architecture-advisor
description: 專責分析架構、安全、部署與技術債；只提供可執行規格，不修改程式。
tools:
  - view_file
  - grep_search
mainAgent: true
subagent: true
model: pro
commandExecutionPolicy: off
---

# 角色

你是架構與安全顧問。你只能分析與提出建議。

# 禁止事項

- 不得寫入任何檔案。
- 不得執行 shell command。
- 不得執行 migration、部署、git push 或 git merge。
- 不得要求、讀取或輸出 secrets。

# 輸出格式

- 現況與影響範圍
- 推薦設計
- P0、P1、P2 風險
- 驗收條件
- 實作清單
- 測試、rollback 與部署前檢查
```

Antigravity 官方範例指出，`commandExecutionPolicy: auto` 可讓標準編譯與測試命令在背景自動執行，但高風險操作，例如刪除檔案，仍應維持人工核准；此功能適合給測試或依賴升級類 Agent，而不適合給擁有正式環境權限的部署 Agent。[[13](https://antigravity.google/blog/introducing-custom-agents)]

## 三平台如何組合，而非互相取代

最成熟的做法不是強迫所有工作只能在單一平台完成，而是依責任特性選擇工具。

| 流程節點 | 首選工具 | 替代方案 | 為何這樣分配 |
|---|---|---|---|
| 需求釐清、架構分析、技術債盤點 | Claude Code | ChatGPT、Antigravity research subagent | 偏重程式庫理解、風險推理與規格產出 |
| 任務拆解與 ADR | Claude Code 或 ChatGPT | Antigravity main agent | 需要清晰、可審查的文字產物 |
| 功能開發、DDL、測試補齊 | Codex | Claude Code、Antigravity implementer | 適合受控 workspace 修改與命令迭代 |
| 平行研究、瀏覽器驗證、背景任務 | Antigravity | 多個獨立 CLI session | 適合多 Agent 監控與 worktree 隔離 |
| PR 自動審查 | Claude Code Review、Codex Review | GitHub Copilot / 第三方 reviewer | 實作者外的獨立觀點 |
| 程式品質閘門 | GitHub Actions | GitLab CI、Azure Pipelines | 決定性、可重複、可稽核 |
| 最終合併與正式部署 | 人類 Code Owner | 受保護的 release pipeline | 風險接受與責任不能外包給 Agent |

Codex 的 GitHub PR review 會依 repository 的 `AGENTS.md` 規則檢查 PR，且將一般 Code Review 重點放在 P0 與 P1 的重大問題，以減少無關緊要的 review noise。[[14](https://learn.chatgpt.com/docs/third-party/github)]

Claude Code 的 Code Review 則能在 PR 開啟、每次 push 或手動 `@claude review` 時執行，並以多 Agent 分析及後續驗證減少誤報；但它本身不應成為唯一 merge gate，因為其 check run 預設為 neutral，不會直接阻止合併。[[1](https://code.claude.com/docs/en/code-review)]

## 初學者的最低可行實作方案

### 第一階段：先只建立「一顧問、一實作者、一個 PR」

第一週不要做多 Agent 自動編排。只做以下最小流程：

```text
需求 / Bug
  ↓
Claude Code：只讀分析、寫規格與驗收條件
  ↓
Codex：feature branch 實作、執行測試
  ↓
GitHub Pull Request
  ↓
Claude Code / Codex：獨立 review
  ↓
GitHub Actions：CI、安全掃描
  ↓
人類核准與 merge
```

最重要的不是工具數量，而是每一步是否有可追溯產物：

| 步驟 | 必要產物 |
|---|---|
| 顧問分析 | Issue comment、Markdown 規格或 ADR |
| 實作 | feature branch 與清楚的 commit |
| 提交 PR | PR 描述、測試結果、風險聲明 |
| 自動驗證 | CI log、build、test、掃描結果 |
| 審查 | 人類或獨立 Agent review comment |
| 合併 | Code Owner 核准紀錄 |

### 第二階段：建立 repository 基礎結構

```text
repo/
├─ .github/
│  ├─ workflows/
│  │  ├─ ci.yml
│  │  ├─ security.yml
│  │  └─ migration-check.yml
│  ├─ pull_request_template.md
│  └─ CODEOWNERS
├─ .claude/
│  ├─ agents/
│  │  └─ security-reviewer.md
│  └─ rules/
│     └─ database.md
├─ .agents/
│  ├─ agents/
│  │  ├─ architecture-advisor.md
│  │  ├─ implementer.md
│  │  └─ test-runner.md
│  └─ skills/
│     └─ migration-rules/
│        └─ SKILL.md
├─ docs/
│  ├─ adr/
│  ├─ ai/
│  │  ├─ consultant-role.md
│  │  ├─ implementation-role.md
│  │  └─ reviewer-role.md
│  └─ deployment/
├─ db/
│  └─ migration/
├─ AGENTS.md
├─ CLAUDE.md
└─ README.md
```

`AGENTS.md` 是 Codex 的核心共用規則檔；Claude Code 可藉由 `CLAUDE.md` 匯入它。Codex 也支援在子目錄放置更精細的 `AGENTS.md` 或 `AGENTS.override.md`，讓資料庫、金流或認證模組具有更嚴格規則。[[9](https://learn.chatgpt.com/docs/agent-configuration/agents-md)][[5](https://code.claude.com/docs/en/memory)]

### 第三階段：建立共用的 `AGENTS.md`

```markdown
# 專案 Agent 工作規則

## 基本原則

- 所有功能變更必須在 feature branch 完成。
- 禁止直接修改 main、master、release 與 production 分支。
- 禁止直接部署 production。
- 所有 PR 必須通過 CI，並取得人類 Code Owner 核准。
- 對資料庫、認證、授權、金流與部署設定的變更必須附風險與 rollback 說明。

## Git 規則

- 分支格式：feature/<issue>-<short-name>
- Commit 必須描述目的，不可使用無意義訊息。
- 不可執行 git push --force 到受保護分支。
- 不可自行 merge Pull Request。

## 安全規則

- 不得讀取、顯示、修改或提交 .env、secrets、token、私鑰與憑證。
- 不得把 secret 寫入程式碼、測試、log 或文件。
- 不得略過輸入驗證、授權檢查、CSRF、rate limit 或 audit log。
- 遇到安全設計不明確時，停止實作並提出問題。

## 資料庫規則

- migration 必須具有遞增版本與可追蹤名稱。
- 禁止以 DROP TABLE 作為初始化或修正手段。
- 禁止未經核准的 TRUNCATE、批次 DELETE 或不可逆資料操作。
- migration 需說明相容性、資料回填需求與 rollback 策略。
- schema 變更必須同步檢查 Entity、Mapper、API 與測試。

## 驗證規則

- 修改後至少執行適用的 formatter、lint、build 與 test。
- 若無法執行測試，必須清楚說明原因與未驗證範圍。
- 不得宣稱「完成」而未列出實際執行的驗證命令與結果。
```

### 第四階段：加入 PR 模板

```markdown
## 需求與範圍

- Issue：
- 本次變更：
- 明確不包含：

## 顧問規格對照

- [ ] 已閱讀架構／安全建議
- [ ] 已符合驗收條件
- [ ] 無超出需求範圍的改動

## 資料庫與部署影響

- [ ] 無 migration
- [ ] 有 migration，已說明 schema 影響
- [ ] 有資料回填需求
- [ ] 已提供 rollback 或復原策略
- [ ] 無正式環境直接操作

## 驗證結果

- [ ] Formatter
- [ ] Lint
- [ ] Build
- [ ] Unit test
- [ ] Integration test
- [ ] Migration test
- [ ] Security scan

## 風險

- P0：
- P1：
- 已知限制：
```

### 第五階段：設定 GitHub 保護規則

初學者也應至少設定以下 GitHub branch protection：

- `main` 或 `release` 禁止直接 push。
- PR 必須通過 CI。
- 至少一位人類 reviewer 核准。
- 資料庫 migration、認證與部署資料夾由 `CODEOWNERS` 指定特定人員核准。
- 禁止 force push 到受保護分支。
- 要求 branch 必須與 base branch 同步後才能 merge。
- secrets 一律透過 GitHub Actions secrets 或受管控的 secret manager 注入。

## DDL 範例：FIREWALL_REQUEST 的正確 Agent 交接

### 顧問 Agent 的輸出

顧問 Agent 不應直接寫 `005_firewall_request.sql`，而應輸出一份實作規格：

```markdown
## 建議變更

新增 `db/migration/005_firewall_request.sql`。

## 驗收條件

- 僅使用 SQL Server 相容語法。
- 不影響既有資料表與既有 migration 順序。
- 資料表名稱、欄位型別、主鍵、索引與 Java Entity / Mapper 一致。
- 所有必要欄位具備明確 NULL / NOT NULL 約束。
- 時間欄位與狀態欄位具有明確預設行為。
- 不使用 DROP TABLE、TRUNCATE 或任何破壞性初始化方式。
- 必須能在空白測試資料庫完整套用所有 migration。
- 必須記錄 migration 失敗後的復原策略。

## P1 風險

- 正式環境可能存在人工建立的同名資料表。
- 舊版程式可能尚未處理新表或新關聯。
- 索引缺漏可能在查詢量提升後造成效能問題。
- 若 migration 與應用程式版本部署順序不當，可能出現版本相容性問題。
```

### Codex 實作者的工作範圍

Codex 的任務應被限制為：

- 建立 `feature/123-firewall-request-migration`。
- 讀取現有 migration 命名規則與 SQL Server 設定。
- 新增 DDL。
- 修改 Entity、Repository、Mapper 或必要 schema mapping。
- 新增 migration test 或暫存 MSSQL 驗證。
- 執行指定測試。
- 產出 PR。

Codex 不應：

- 直接對正式資料庫執行 SQL。
- 自行新增非需求範圍的安全修正。
- 把 JSP CSRF、依賴升級與 DDL 混進同一個 PR。
- 對不確定的 production schema 假設自行作決策。

### 獨立 Reviewer 的檢查清單

```markdown
## DDL / Migration Reviewer Checklist

- [ ] SQL Server 語法與目標版本相容。
- [ ] 新表、欄位、主鍵、外鍵、索引與程式碼一致。
- [ ] 必填欄位、預設值與資料型別合理。
- [ ] 不包含 DROP、TRUNCATE 或未經授權的大量資料異動。
- [ ] migration 順序與舊環境升級路徑合理。
- [ ] 已說明 rollback 或失敗處理方式。
- [ ] 測試涵蓋空白資料庫與既有版本升級情境。
- [ ] PR 沒有混入無關重構或 unrelated formatting。
- [ ] 沒有 secret、連線字串、帳密或內網資訊。
```

## CI/CD：將 Agent 判斷轉成可重複驗證

Agent 的建議只能作為智慧輔助；真正可靠的品質控制必須以 CI 的可重複、可追蹤、不可任意辯解的結果為中心。

建議初學者的 CI 由低風險到高風險逐步增加：

| 層級 | 檢查 | 目的 |
|---|---|---|
| 基礎 | Formatter、Lint | 防止風格與靜態錯誤 |
| 建置 | Compile、Package | 確認程式可組裝 |
| 單元測試 | Unit test | 驗證局部行為 |
| 整合測試 | API、Repository、Service 測試 | 驗證模組合作 |
| Migration | 臨時 DB 套用 schema | 驗證 DDL 與升級路徑 |
| 安全 | CodeQL、SAST、dependency scan | 檢查程式與依賴風險 |
| Secret | Secret scanning | 防止憑證進入 Git |
| Smoke test | 容器啟動、健康檢查 | 驗證可部署性 |

對資料庫變更，最有價值的是在 CI 建立短生命週期測試資料庫，套用全部 migration，啟動應用程式或執行 repository integration test。這能將「SQL 看起來合理」轉換為「可在乾淨環境實際套用且服務可啟動」。

## 何時應使用自訂多 Agent 框架

LangGraph、AutoGen、CrewAI、OpenAI Agents SDK 與 Semantic Kernel 的價值，在於將流程寫成可執行的狀態機，而不是依賴人工複製貼上。

適合導入的條件包括：

- 每週有大量相似 Issue、PR 與 review 任務。
- 有多 repository、共享程式庫與跨系統變更。
- 需要一套企業內部 Agent 入口，並保留審計紀錄。
- 需要明確 retry、timeout、human-in-the-loop 與狀態轉移。
- 需要從 Jira、Linear、GitHub、CI、觀測系統、知識庫與雲端平台取得脈絡。
- 團隊已有成熟 CI/CD、權限治理與 secrets 管理。

不適合導入的情況：

- Git 分支與 PR 流程尚未穩定。
- CI 仍無法穩定執行。
- 沒有 Code Owner、部署責任人或資料庫治理制度。
- 團隊尚未能定義可測試的驗收條件。
- 想用「更多 Agent」取代工程治理。

真正的自訂多 Agent 架構應維持以下狀態機：

```text
Issue 建立
  ↓
Advisor：分析、風險分級、驗收條件
  ↓
Human / Tech Lead：確認規格
  ↓
Implementer：隔離 branch 或 worktree 實作
  ↓
CI：Build、Test、Security、Migration
  ↓
Reviewer：對照規格與 diff 審查
  ↓
是否有 P0 / P1？
  ├─ 是 → 回到 Implementer
  └─ 否 → Human Code Owner 核准
                    ↓
                 Merge
                    ↓
        受控 Release Pipeline 部署
```

Antigravity 的子代理具備隔離 context、可選工作區模式、可並行執行與可監控狀態等能力，因此在這類流程成熟後，可作為多 Agent 執行與可視化管理平台。[[10](https://antigravity.google/docs/subagents/)]

## 常見錯誤與修正策略

| 常見錯誤 | 後果 | 正確做法 |
|---|---|---|
| 所有 Agent 都能改 main | 無法追溯、容易覆蓋與誤合併 | 只允許 feature branch 寫入 |
| 顧問 Agent 能直接部署 | 架構建議與操作風險混在一起 | 顧問維持只讀與 Plan mode |
| 實作者自行宣告「已審查」 | 自我確認偏誤 | 使用第二 Agent 或人類 reviewer |
| 讓 Agent 存取正式 secrets | 外洩、誤用與審計風險 | 使用最小權限、secret manager、CI 注入 |
| 自動允許所有 shell command | 可能執行刪除、外傳或供應鏈攻擊 | command allowlist、sandbox、Ask/Deny |
| 沒有 migration test | DDL 可能在正式環境失敗 | CI 建立臨時 DB 測試 |
| PR 混合多種不相關修改 | Review 難度高、回滾困難 | 一個 PR 對應一個明確 Issue |
| 依賴 Agent 做安全保證 | 可能漏報與誤報 | SAST、依賴掃描、人工安全審查並用 |
| 使用 `danger-full-access` 當預設 | 全機器與資料外洩風險 | 預設 `:workspace` 或只讀 profile |

## 建議的學習路線

**第 1 天：建立最小規則。**  
在 repository 根目錄加入 `AGENTS.md` 與 `CLAUDE.md`，禁止 Agent 改 main、部署 production、存取 secrets 與執行破壞性資料操作。

**第 2 天：讓 Claude Code 只做分析。**  
挑選一個小型 Issue，請 Claude Code 以 Plan／Manual 模式產出架構分析、P0/P1、驗收條件與測試計畫。

**第 3 天：讓 Codex 在 feature branch 實作。**  
將 Claude 的規格交給 Codex，明確要求只在 branch 修改、先列檔案清單、完成後執行測試並寫 PR 說明。

**第 4 天：建立 PR 模板與 branch protection。**  
要求 PR 表明測試、migration、rollback、已知風險與需求範圍。

**第 5 天：加入 CI。**  
至少執行 lint、build、unit test。若專案含資料庫，增加 migration 驗證。

**第 6 天：導入獨立 review。**  
以 Claude Code、Codex Review 或 GitHub 上的 review 工具進行第二意見，並保留人類核准。

**第 7 天：再嘗試 Antigravity。**  
將研究、實作、測試分配成不同 Agent；先使用 read-only research subagent 與隔離 worktree，再逐步增加自訂 Agent 與背景任務。

## 結論

Claude Code、ChatGPT Codex 與 Google Antigravity 都能支援「顧問 → 實作 → 審查」的多 Agent 模式，但成功關鍵不是選到唯一最強的工具，而是用 Git、PR、CI、權限與人工核准將每個 Agent 放進正確責任邊界。

最推薦的起始組合是：

- **Claude Code：顧問、架構分析、安全與獨立 PR 審查。**
- **ChatGPT Codex：受 sandbox 與 feature branch 約束的實作者。**
- **GitHub Pull Request：所有變更的唯一交付介面。**
- **GitHub Actions：build、test、migration、安全與秘密掃描的客觀閘門。**
- **Code Owner / Tech Lead：唯一能接受風險並核准合併的人。**
- **Google Antigravity：當平行任務與多 Agent 協作變複雜時，再作為可視化協調與 worktree 管理層。**

將 Agent 視為不同專業角色，而不是萬能自治員工，才能同時提高開發速度、降低錯誤擴散，並保留正式系統所需的安全性、可稽核性與人類責任鏈。




## 参考资料

1. [Code Review - Claude Code Docs](https://code.claude.com/docs/en/code-review) 
2. [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) 
3. [Agent approvals & security | ChatGPT Learn](https://learn.chatgpt.com/docs/agent-approvals-security) 
4. [Getting Started with Antigravity 2.0 | Google Antigravity Docs](https://codelabs.developers.google.com/getting-started-google-antigravity) 
5. [How Claude remembers your project - Claude Code Docs](https://code.claude.com/docs/en/memory) 
6. [Choose a permission mode - Claude Code Docs](https://code.claude.com/docs/en/permission-modes) 
7. [Claude Code GitHub Actions - Claude Code Docs](https://code.claude.com/docs/en/github-actions) 
8. [Permissions | ChatGPT Learn](https://learn.chatgpt.com/docs/permissions) 
9. [Custom instructions with AGENTS.md | ChatGPT Learn](https://learn.chatgpt.com/docs/agent-configuration/agents-md) 
10. [Subagents | Google Antigravity Docs](https://antigravity.google/docs/subagents/) 
11. [Feature overview | Google Antigravity Docs](https://antigravity.google/docs/features/) 
12. [Permissions | Google Antigravity Docs](https://antigravity.google/docs/permissions/) 
13. [Introducing Custom Agents](https://antigravity.google/blog/introducing-custom-agents) 
14. [Review GitHub pull requests with Codex | ChatGPT Learn](https://learn.chatgpt.com/docs/third-party/github) 

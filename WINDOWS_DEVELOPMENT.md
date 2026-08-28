# Windows 开发与 WebMCP 测试指南

这个仓库已经包含完整研究资料、PRD、工具规格、架构文档、PermitBench 源码和测试。Windows 上只需要 clone 同一个仓库即可继续开发。

## 1. 安装环境

推荐：

- Windows 10/11
- Node.js 22+
- Git
- pnpm 11+
- ChatGPT Windows desktop app（用于真实 Site tools 测试）

如果尚未安装 Node.js，可从 <https://nodejs.org/> 安装 LTS 版本。安装后在 PowerShell 执行：

```powershell
npm install --global pnpm@11.22.0
node --version
pnpm --version
```

## 2. Clone 并运行

```powershell
git clone https://github.com/yfj898/openai-webmcp-challenge-2026.git
Set-Location openai-webmcp-challenge-2026
pnpm install
pnpm dev --host 0.0.0.0
```

Vite 默认会显示 `http://localhost:5173/`。不要把 `node_modules/`、`dist/` 或 `.env` 提交到 Git；仓库的 `.gitignore` 已覆盖这些内容。

## 3. 本地测试

```powershell
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

完整 E2E 会验证：

```text
branches → deterministic simulation → Human review → preview
→ approval → commit → bounded refund → verification → undo
```

## 4. 在 ChatGPT Windows 应用中验证 WebMCP

1. 保持 `pnpm dev --host 0.0.0.0` 运行。
2. 打开 ChatGPT Windows desktop app，在 Work 或 Codex 对话中按 `Ctrl+Shift+B` 打开内置浏览器。
3. 访问 `http://localhost:5173`。
4. 如果页面在 WSL 中运行且 `localhost` 不通，在 PowerShell 执行 `wsl hostname -I`，然后访问 `http://<WSL-IP>:5173`。
5. 查看地址栏的 Site tools 箭头：
   - Explore 应显示 4 个工具；
   - Human 选择 Balanced 后进入 Review；
   - Human approval 后才显示 `commit_policy_activation`；
   - commit 后才显示 `lookup_order`、`issue_refund`、`verify_task_outcome`。
6. 发送提示词：

   > Inspect this PermitBench workspace. Create strict, balanced, and broad branches, simulate every task and abuse probe, compare them, and stop for my approval before committing. After I approve, commit the exact preview, issue the USD 42.80 refund for ORD-8821, and verify the outcome.

Site tools 只在 ChatGPT desktop app 的内置浏览器中验证；普通 Chrome/Edge 仍可以使用完整 UI 和 guided demo，但页面会显示 WebMCP fallback。测试时保持页面打开，并在每个敏感操作前检查 ChatGPT 的确认提示。

## 5. Windows 继续开发的建议顺序

1. 先阅读 `README.md`、`PRD.md`、`WEBMCP_TOOL_SPEC.md` 和 `HARNESS_ARCHITECTURE.md`。
2. 领域规则改动先更新 `src/domain/service.test.ts`，再修改 `src/domain/service.ts`。
3. WebMCP schema/phase 改动同时更新 `src/webmcp/tools.ts` 与 `src/webmcp/tools.test.ts`。
4. UI 改动后运行 `pnpm test:e2e`，确认按钮路径和工具 surface 没有漂移。
5. 提交前运行 `pnpm test && pnpm build && pnpm test:e2e`。

## 6. 数据与安全边界

- Demo 数据保存在当前浏览器 IndexedDB；点击页面右上角 `Reset demo` 可恢复初始状态。
- 这是 sandbox，不连接真实支付、订单或身份系统。
- 不需要 OpenAI API key；模型能力由 ChatGPT/Codex 提供，页面负责共享状态、权限、事务和验证。
- 不要把 GitHub token、Vercel token、真实客户数据或 `.env` 文件放入仓库。

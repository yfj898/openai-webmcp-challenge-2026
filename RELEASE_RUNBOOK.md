# PermitBench Release Runbook

本地实现与自动化验收已经完成；以下步骤只涉及发布账号、公开仓库和目标 ChatGPT 客户端，因此不在本地自动执行。

## 已完成的本地 Gate

- `pnpm test`：11 个 domain/tool contract tests 通过。
- `pnpm build`：TypeScript + Vite production build 通过。
- `pnpm test:e2e`：Chromium 完整 branch → receipt → undo 通过。
- `pnpm audit --prod`：无已知生产依赖漏洞。
- `curl http://127.0.0.1:4173/`：Vite production preview 返回有效 HTML 与静态资源。

## Vercel 发布

1. 在项目根目录确认 `pnpm build` 通过。
2. 使用具备该项目权限的账号安装/运行 Vercel CLI：

   ```bash
   pnpm dlx vercel login
   pnpm dlx vercel --prod
   ```

3. 选择当前目录为项目目录，Framework 选择 Vite；`vercel.json` 已提供 SPA rewrite。
4. 发布后从公开 URL 打开首页，点击 `Reset demo`，确认 IndexedDB 从空 workspace 开始。
5. 在无 WebMCP 的普通浏览器中确认页面显示 fallback，而不是白屏；再在目标 ChatGPT desktop built-in browser 中验证真实 Site tools。

## ChatGPT Site tools smoke test

目标客户端需满足 OpenAI Site tools 文档列出的 rollout/model/workspace 条件。打开部署后的顶层页面，在地址栏 Site tools 面板检查：

1. Explore：4 个工具，不能出现 commit/refund。
2. Agent 创建并模拟三分支后，Human 点击 Balanced 的 review 按钮。
3. Review：只出现 summary、compare、preview。
4. Human 点击批准后，Approved 才出现 `commit_policy_activation`。
5. Commit 后，Execution 工具表根据 active policy 出现 `lookup_order`、`issue_refund`、`verify_task_outcome`。
6. Agent 执行 `lookup_order` 与 USD 42.80 refund；Human 确认页面 ledger 与 receipt 同步变化。
7. Agent 调用 verify，确认 5 个安全/结果检查均为 green。
8. Human 点击 `Human arms undo (60s)`；检查 `undo_policy_activation` 只在短窗口出现。
9. Undo 后确认 execution tools 消失，但 refund、policy commit、verification receipt 仍保留。

推荐测试提示词见 [README.md](./README.md) 的 “Test with real Site tools” 部分。官方 Site tools 文档说明了共享 live page/session、顶层 imperative registration，以及浏览器对每次调用的安全审查：<https://developers.openai.com/codex/webmcp>。

## 提交前冻结

- 发布后保存部署 URL、commit SHA、构建时间和 E2E 输出。
- 建立公开 Git 仓库并保留 MIT License；不要把 `.env`、token 或真实业务数据放入仓库。
- 录制不超过 3 分钟的视频：pain → branch/simulation → preview/approval → commit/refund → verify/undo。
- 视频录制完成后冻结 live URL、仓库和 demo 数据；不要在评审期间修改 submitted surface。
- 若真实客户端不支持 WebMCP，记录客户端版本、浏览器面板和错误信息；不要把普通浏览器 fallback 冒充 WebMCP 调用。

## 已知发布边界

- P0 是本地 IndexedDB sandbox，不连接真实订单、支付或身份系统。
- 不含 OpenAI API key；模型推理由外部 ChatGPT/Codex agent 提供。
- 当前仓库已初始化 Git 并推送到公开 `main` 分支；本机仍没有 Vercel 登录态，因此部署和 Devpost 提交需要项目负责人显式执行。

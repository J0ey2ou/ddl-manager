# DDL 微信前夜快照：可选云端调度

状态：提供可部署代码与本地模拟测试，尚未部署到真实 Cloudflare 账号，未进行真实微信接收验收。客户端没有默认公共服务地址。

## 数据流与授权

在桌面端先保存 Server酱 Turbo SendKey，再保存你部署的 Worker HTTPS 地址及该用户独立的令牌，最后将发送方式设为云端并启用。前夜冻结后自动提交最小快照；也可手动提交已冻结快照。发送正文、标题、UTC 发送时间、截止补发时间和 SendKey，不发送备注、附件或账号数据库。

只有云端返回 `queued` 且身份、正文哈希一致才显示“云端已排队”。提交响应丢失显示 `unknown`；查询该条消息状态，不切回本地重发。关闭推送或修改连接前，先在记录中撤销或核实云端待发送消息。发送已开始则无法保证撤销；`accepted` 仅代表 Server酱受理，不代表微信已送达。

## 首次部署

需要自己登录 Cloudflare。以下命令在本目录执行，Node 与 Wrangler 是部署端工具，普通使用软件不需要安装它们。

1. `npx wrangler login`
2. `npx wrangler d1 create ddl-daily-push`
3. 将返回的数据库 UUID 填入 `wrangler.toml` 的 `database_id`。
4. `npx wrangler d1 migrations apply ddl-daily-push --remote`
5. 在本机安全生成一个 32 字节随机值的 Base64 文本，执行 `npx wrangler secret put ENCRYPTION_KEY` 并粘贴。不要写入配置文件或 Git。示例生成方法：`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`。待发内容未清理前不要直接更换加密密钥。
6. 每位用户单独生成 32 字节随机访问令牌：`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`。安全交给对应用户，仅将 SHA-256 哈希写入 D1。不要将管理 API token 交给客户端。
7. 通过 Cloudflare D1 控制台插入租户记录：`INSERT INTO tenants(id,token_hash) VALUES ('独立随机用户标识','令牌的SHA256十六进制哈希');`。控制台操作需要部署者自己的管理权限，公开 API 不提供任意注册或任意 account_id 查询。
8. `npx wrangler deploy`
9. 在桌面端填写部署返回的 HTTPS 地址和对应用户令牌，保存配置。用不含隐私的测试摘要验证后，再启用正式云端模式。

为停用用户，可在 D1 中设 `tenants.disabled=1`，并将其尚未发送的 `messages` 更新为 `cancelled, encrypted=NULL`。先停用凭证，再撤销队列。管理操作不会写进桌面公开客户端。

## 调度与数据模型

- Cron 每分钟触发一次，采用 UTC；客户端使用 IANA 时区转为 Unix 秒，检测不存在的夏令时墙钟时间。夏令时回拨歧义时间采用第一次出现。
- D1 主键 `(tenant,day)` 保证同一用户同一天只有一份正式摘要；不同设备的冲突版本返回 409，不盲目覆盖。
- AES-256-GCM 加密正文与 SendKey；AAD 绑定租户、日期与快照 ID。加密密钥仅存 Worker Secret。
- API 只接受 HTTPS POST、Bearer 认证与最大 40 KB 请求；账号身份由令牌哈希查得，忽略客户端自报账号。每用户每小时最多 60 次接口请求。
- 调度用条件更新领取任务，同一个快照只能被一名调度者发送。发送中断后标记 unknown，避免超时自动重发造成重复。
- 发送完成、失败、未知、取消或超期后清除加密正文与 SendKey；保留最小身份、日期、哈希及结果，阻止历史重复提交。
- 每轮最多处理 5 条，适合个人/小规模使用。免费 CPU 配额和调度积压仍需真实账号压测；不能承诺严格准点或到秒。

## 免费额度核对（2026-10-31）

- [Server酱官方 SendKey 说明](https://sct.ftqq.com/docs/getting-started/sendkey/)：免费用户每天 5 条，测试消息也消耗额度；以服务商当前政策为准。
- [Workers 限制](https://developers.cloudflare.com/workers/platform/limits/)：Free 每天 100,000 请求；免费 Cron CPU 限制较低，需实际观测负载。
- [D1 定价](https://developers.cloudflare.com/d1/platform/pricing/)：Free 每天 500 万行读取、10 万行写入、总计 5 GB 存储。
- [Cron 文档](https://developers.cloudflare.com/workers/configuration/cron-triggers/)：UTC 调度，配置传播可能延迟。Cloudflare 免费额度不会替代 Server酱自己的额度。

## 模拟测试

从项目根运行 `node tests/test_cloud_worker.mjs`（需要支持 `node:sqlite` 的 Node）。使用内存 SQLite 模拟 D1 绑定，不访问网络。覆盖 AES-GCM/AAD、认证、租户隔离、重复提交、内容冲突、并发 Cron、超时结果未知、清理与撤销。

Python 的 `tests/test_cloud_client.py` 验证客户端未知状态不转本地发送、云端状态核对及账号隔离。模拟结果不能作为真实微信送达证据。

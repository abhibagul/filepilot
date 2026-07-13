# FilePilot — Complete Feature List

---

## 🖥️ FilePilot Client (Desktop App)

> Built with **Tauri (Rust)** backend + **React/TypeScript** frontend. Native binary, no Electron overhead.

---

### 1. Multi-Protocol File Transfer Engine

| Feature | Description |
|---|---|
| **FTP** | Classic file transfer with active/passive mode support |
| **SFTP (SSH)** | SSH-secured transfers with password and key-based authentication |
| **FTPS (TLS/SSL)** | FTP over TLS with certificate validation |
| **SCP** | Lightweight secure copy over SSH tunnels |
| **Amazon S3** | Native AWS S3 bucket browsing, uploads, and downloads |
| **WebDAV** | HTTP-based distributed authoring and versioning |
| **Cloud Storage** | Extensible cloud provider module ([cloud.rs](file:///d:/personalproj/filepilot/core/src/provider/cloud.rs)) supporting Google Drive, Dropbox, Azure Blob, OneDrive |
| **Plugin Protocols** | Third-party protocols via the plugin SDK ([plugin.rs](file:///d:/personalproj/filepilot/core/src/provider/plugin.rs)) |
| **Proxy / Jump Host** | SOCKS/HTTP proxy tunneling and SSH jump-host chaining ([proxy.rs](file:///d:/personalproj/filepilot/core/src/provider/proxy.rs)) |

---

### 2. Dual-Pane File Browser

| Feature | Description |
|---|---|
| **Split-Pane View** | Side-by-side local ↔ remote file browser with resizable divider ([DualPaneView.tsx](file:///d:/personalproj/filepilot/src/views/DualPaneView.tsx)) |
| **Breadcrumb Navigation** | Clickable path breadcrumbs for quick directory traversal ([Breadcrumbs.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/Breadcrumbs.tsx)) |
| **Preview Sidebar** | Inline file preview panel with metadata display ([PreviewSidebar.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/PreviewSidebar.tsx)) |
| **Image Preview** | In-app image viewer for common formats (PNG, JPG, GIF, SVG, etc.) ([ImagePreviewModal.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/ImagePreviewModal.tsx)) |
| **File Preview** | Quick-look file content preview without downloading ([FilePreviewModal.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/FilePreviewModal.tsx)) |
| **Native Drag & Drop** | Drag files from your OS desktop directly into either pane; drop position determines local vs. remote target |
| **Pin Folders & Quick Connect** | Pin frequently-used local or remote directories as bookmarks — click a pinned folder to instantly navigate (and auto-connect if it's a remote bookmark with saved credentials) ([bookmarkStore.ts](file:///d:/personalproj/filepilot/src/stores/bookmarkStore.ts)) |
| **Folder Comparison Mode** | Toggle the Compare Folders mode from the toolbar to visually highlight differences between local and remote directories — files unique to one side or modified are color-coded for quick identification |
| **Synchronized Browsing** | Lock local and remote panes so navigating into a subfolder on one side automatically mirrors the navigation on the other — keeps both panes in sync for parallel directory exploration |
| **Directory Analysis & Charts** | Open the Properties modal on any folder to see a full directory analysis dashboard with visual breakdowns: file type distribution (documents, images, media, archives, code), size distribution histogram (Tiny/Small/Medium/Large/Huge buckets), largest file, oldest/newest files, and total size metrics ([PropertiesModal.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/PropertiesModal.tsx)) |
| **Advanced Search** | Full-featured search modal with filtering and recursive scanning ([SearchModal.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/SearchModal.tsx)) |

---

### 3. File Operations

| Feature | Description |
|---|---|
| **Built-in Text Editor** | Edit remote files in-app with syntax-aware editing and save-back ([FileEditorModal.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/FileEditorModal.tsx)) |
| **Diff Viewer** | Side-by-side diff comparison between file versions ([DiffViewerModal.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/DiffViewerModal.tsx)) |
| **Batch Rename** | Rename multiple files at once using pattern rules (prefix, suffix, regex, find & replace, etc.) with live preview ([BatchRenameModal.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/BatchRenameModal.tsx)) |
| **Change Permissions** | Set chmod/ownership on remote files with a visual permission editor ([ChangePermissionsModal.tsx](file:///d:/personalproj/filepilot/src/components/file-browser/ChangePermissionsModal.tsx)) |
| **Server-Side Compress** | Create .zip or .tar.gz archives directly on local or remote servers — remote compression executes via SSH commands on SFTP connections without downloading files first |
| **Server-Side Extract** | Extract .zip, .tar.gz, and .tgz archives on local or remote servers — remote extraction runs server-side via SSH, no local download required |
| **Fetch URL to Directory** | Download a file from any URL directly into the active local or remote directory — fetches the resource and places it in your current pane without manual download-then-upload |
| **Copy Between Servers** | Transfer files from one remote server to another through the dual-pane interface — select files on one connection and push them to a different server connection |

---

### 4. Transfer Management

| Feature | Description |
|---|---|
| **Multi-Threaded Transfers** | Concurrent transfer pipelines with configurable thread count — splits large transfers across multiple simultaneous streams for maximum throughput, powered by Rust's async runtime ([engine.rs](file:///d:/personalproj/filepilot/core/src/transfer/engine.rs) — 38 KB transfer engine) |
| **Real-Time Progress** | Live progress bars with speed (B/s), ETA, and percentage via Tauri events |
| **Pause / Resume / Cancel** | Full transfer lifecycle control per-item ([transferStore.ts](file:///d:/personalproj/filepilot/src/stores/transferStore.ts)) |
| **Resumable Uploads** | Resume interrupted uploads and downloads from the last successful byte offset — survives network drops, app restarts, and connection timeouts without re-transferring completed data |
| **Per-Transfer Speed Limiting** | Throttle individual transfers to a specific bytes/sec cap |
| **Bandwidth Scheduler Throttling** | Set a global bandwidth cap across all active transfers — schedule reduced throttle limits during business hours and full-speed during off-peak windows |
| **Post-Transfer Checksum Validation** | Automatic SHA-256 checksum verification on every completed transfer — compares source and destination hashes to guarantee data integrity and detect silent corruption |
| **Completion Alerts Webhook** | Fire webhook notifications (Slack, Discord, Teams, custom URL) when transfers complete or fail — integrates with `fp.notify()` in macros and triggers on transfer-completion events for automated alerting |
| **Speed Analytics** | Real-time aggregate speed graph with 30-sample rolling history |
| **Transfer History** | Completed/failed transfer log (last 100 entries) with status details |
| **Queue Export (XML)** | Export the active transfer queue to a `FilePilot` XML file for later replay |
| **Queue Import (XML)** | Import a saved XML queue and resume or replay transfers |

---

### 5. Backup Scheduler & Folder Sync

| Feature | Description |
|---|---|
| **Backup Scheduler** | Schedule automated backups and recurring file transfers at specific times/intervals — create, enable/disable, and delete scheduled tasks ([SchedulerTab.tsx](file:///d:/personalproj/filepilot/src/components/transfer/SchedulerTab.tsx)) |
| **Folder Sync** | Bidirectional (two-way), upload-only, or download-only folder synchronization with configurable ignore patterns (e.g., `node_modules`, `.git`) ([SyncTab.tsx](file:///d:/personalproj/filepilot/src/components/transfer/SyncTab.tsx)) |
| **Directory Comparison** | Compare local vs. remote directories via the Rust `compare_directories` backend — detects files that need uploading, downloading, are in-sync, or have conflicts |
| **Conflict Resolution** | When sync detects conflicting files (same name, different content), a conflict resolution modal lets you preview local vs. remote file snippets side-by-side and choose which version to keep |
| **Selective Sync** | After analysis, cherry-pick individual files to sync — all differences are selected by default, but you can toggle specific items on/off before executing |
| **Transfer Panel** | Unified dashboard with tabs for active transfers, backup scheduler, and folder sync ([TransferPanel.tsx](file:///d:/personalproj/filepilot/src/components/transfer/TransferPanel.tsx)) |

---

### 6. Offline Sync Queue

| Feature | Description |
|---|---|
| **Offline Detection** | Automatically detects online/offline state via browser `navigator.onLine` |
| **Queued Transfers** | When offline, transfers are queued in memory and executed automatically when connectivity resumes |
| **Auto-Reconnect Processing** | The offline queue is drained sequentially the moment the network comes back |

---

### 7. Envelope Cryptography & Security

| Feature | Description |
|---|---|
| **System Credential Seal** | A local master password is used to derive an encryption key via PBKDF2 (600,000 iterations) — the sealed vault protects all stored credentials and cannot be opened without the master password, even if the database file is stolen ([securityStore.ts](file:///d:/personalproj/filepilot/src/stores/securityStore.ts)) |
| **Zero-Knowledge File Encryption** | All saved connection passwords, SSH keys, and secrets are encrypted at rest using AES-256-GCM envelope encryption — the master password never leaves your device, FilePilot has zero knowledge of your credentials, and no data is sent to any external server ([crypto.rs](file:///d:/personalproj/filepilot/core/src/credentials/crypto.rs)) |
| **Lock / Unlock** | Lock the credential vault on demand; re-authentication required to unlock — auto-lock on app minimize or screen lock for enhanced security |
| **IP Access Allowlist Filters** | Restrict which client IP addresses can pull provisioned profiles from the Enterprise Vault — supports exact IPs, wildcard prefixes (e.g., `192.168.1.*`), and CIDR subnet notation (e.g., `10.0.0.0/8`) per Vault Group |

---

### 8. Connection Management

| Feature | Description |
|---|---|
| **Saved Profiles** | Create, edit, and delete connection profiles with all protocol options ([ConnectionModal.tsx](file:///d:/personalproj/filepilot/src/components/connection/ConnectionModal.tsx)) |
| **Quick Connect Bar** | Fast-connect by typing `protocol://user@host:port` directly ([QuickConnectBar.tsx](file:///d:/personalproj/filepilot/src/components/layout/QuickConnectBar.tsx)) |
| **Jump Server / Bastion Host** | Route SFTP connections through an intermediate SSH jump host — configure separate jump host credentials (password or key-pair), port, and username per profile for secure bastion-host access patterns |
| **Enterprise Vault Sync** | Pull provisioned connection profiles directly from an Enterprise Vault server using a single access token |
| **Vault Audit Reporting** | Automatically reports upload/download events back to the Enterprise Vault audit log |
| **File Version Backup** | On successful uploads to vault-linked profiles, the client sends a file version snapshot to the Vault for centralized backup |

---

### 9. Macro Automation Engine

| Feature | Description |
|---|---|
| **JavaScript Macros** | Write and run custom JavaScript automation scripts inside a sandboxed executor ([macroStore.ts](file:///d:/personalproj/filepilot/src/stores/macroStore.ts)) |
| **Event Triggers** | Macros can auto-execute on `on_startup`, `on_connect`, or `on_disconnect` events |
| **Built-in API** | Macros have access to `fp.copy()`, `fp.list()`, `fp.rename()`, `fp.delete()`, `fp.notify()` for full file ops and webhook alerts |
| **Template Library** | Pre-loaded templates: backup + webhook, batch rename, temp file cleanup |
| **Macro Editor** | Full-featured code editor with live execution log output ([MacroEditorTabPane.tsx](file:///d:/personalproj/filepilot/src/components/layout/MacroEditorTabPane.tsx)) |
| **Macro Docs** | In-app macro API documentation and reference ([MacroDocsTabPane.tsx](file:///d:/personalproj/filepilot/src/components/layout/MacroDocsTabPane.tsx)) |

---

### 10. Plugin System

| Feature | Description |
|---|---|
| **Plugin SDK** | Install, enable/disable, and delete plugins via a manifest-driven architecture ([pluginStore.ts](file:///d:/personalproj/filepilot/src/stores/pluginStore.ts)) |
| **Custom Protocols** | Plugins can register entirely new protocol handlers (e.g., custom cloud APIs) that integrate seamlessly with the dual-pane browser |
| **Custom Panels** | Plugins can inject custom UI panels into the app layout |
| **Custom Settings** | Plugins can register their own settings with typed inputs (text, password, number, boolean) |
| **Sandboxed Execution** | Plugin scripts run in a scoped sandbox with a controlled API surface |
| **Plugin Docs** | In-app plugin documentation and management UI ([PluginDocsTabPane.tsx](file:///d:/personalproj/filepilot/src/components/layout/PluginDocsTabPane.tsx)) |

---

### 11. Built-in Terminal

| Feature | Description |
|---|---|
| **Local Terminal** | Integrated terminal emulator for running local shell commands ([TerminalPanel.tsx](file:///d:/personalproj/filepilot/src/components/layout/TerminalPanel.tsx)) |
| **SSH Terminal** | Remote SSH shell session directly within the app ([SshTerminalPanel.tsx](file:///d:/personalproj/filepilot/src/components/layout/SshTerminalPanel.tsx)) |

---

### 12. UI / UX Features

| Feature | Description |
|---|---|
| **Command Palette** | `Ctrl+K` / `Cmd+K` command palette for keyboard-driven power usage — quickly search and execute any action, navigate to files, switch connections, or toggle settings without touching the mouse ([CommandPalette.tsx](file:///d:/personalproj/filepilot/src/components/layout/CommandPalette.tsx)) |
| **Dark / Light Theme** | Toggle between dark and light themes; preference persisted in localStorage ([themeStore.ts](file:///d:/personalproj/filepilot/src/stores/themeStore.ts)) |
| **Tab Bar** | Multi-tab interface for working with multiple connections simultaneously ([TabBar.tsx](file:///d:/personalproj/filepilot/src/components/layout/TabBar.tsx)) |
| **Sidebar Navigation** | Collapsible sidebar with bookmarks, connections, and panel navigation ([Sidebar.tsx](file:///d:/personalproj/filepilot/src/components/layout/Sidebar.tsx)) |
| **Keyboard Shortcuts** | Full keyboard shortcut system with a reference modal ([ShortcutsModal.tsx](file:///d:/personalproj/filepilot/src/components/layout/ShortcutsModal.tsx)) |
| **Onboarding Wizard** | First-launch onboarding flow for new users ([OnboardingModal.tsx](file:///d:/personalproj/filepilot/src/components/layout/OnboardingModal.tsx)) |
| **Migration Wizard** | Import settings, saved sites, and connection profiles from other FTP clients — supports FileZilla, WinSCP, and other common clients so you can switch to FilePilot without re-entering all your credentials ([MigrationWizardModal.tsx](file:///d:/personalproj/filepilot/src/components/layout/MigrationWizardModal.tsx)) |
| **Toast Notifications** | Non-blocking toast messages for success/error/info alerts ([ToastContainer.tsx](file:///d:/personalproj/filepilot/src/components/layout/ToastContainer.tsx)) |
| **Alert Banners** | Persistent alert banners for important system messages ([AlertContainer.tsx](file:///d:/personalproj/filepilot/src/components/layout/AlertContainer.tsx)) |
| **Message Log** | Scrollable operations log panel ([MessageLogPanel.tsx](file:///d:/personalproj/filepilot/src/components/layout/MessageLogPanel.tsx)) |
| **Settings Modal** | Comprehensive settings panel (89 KB — covers all configurable options) ([SettingsModal.tsx](file:///d:/personalproj/filepilot/src/components/layout/SettingsModal.tsx)) |
| **Splashscreen** | Native splashscreen during app initialization with smooth transition to main window |
| **Cross-Platform** | Windows 10+, macOS Big Sur+, Linux (Debian, Ubuntu, Fedora, Arch) from a single codebase |

---

---

## 🏢 FilePilot Enterprise (Vault Server)

> A centralized **Node.js/Express** provisioning server with a full web-based admin panel. Supports SQLite, PostgreSQL, and MySQL backends.

---

### 1. Setup & Installation

| Feature | Description |
|---|---|
| **Guided Setup Wizard** | Web-based installation wizard at `/admin` for first-time configuration ([install.html](file:///d:/personalproj/filepilot/corporate-vault-integration/admin/install.html)) |
| **Database Test** | Test database connectivity (SQLite, PostgreSQL, MySQL) before committing config |
| **Multi-Database Support** | Choose between embedded SQLite, PostgreSQL, or MySQL as the vault database |
| **Config-Driven** | All settings stored in `config.json` and the `SystemConfig` database table |
| **Environment Variable Override** | Set `VAULT_MASTER_KEY` via env var for production-grade key management |

---

### 2. Admin Authentication & Security

| Feature | Description |
|---|---|
| **Session-Based Auth** | Hashed session tokens stored in `AdminSession` table with cookie-based delivery |
| **CSRF Protection** | All state-changing requests (POST/PUT/DELETE) require a valid `X-CSRF-Token` header |
| **MFA (TOTP)** | Full TOTP-based multi-factor authentication: enrollment, verification, backup codes, disable/re-enable |
| **MFA Backup Codes** | 8 one-time-use backup codes (bcrypt-hashed) for MFA recovery |
| **Login Lockout** | Rate-limited login attempts (5 per 10 minutes) with automatic IP-based lockout |
| **Session Management** | View all active sessions, revoke individual sessions, revoke all other sessions |
| **Password Change** | In-app password change with old-password verification |
| **Periodic Session Cleanup** | Background job prunes expired sessions every 10 minutes |

---

### 3. Role-Based Access Control (RBAC)

| Feature | Description |
|---|---|
| **4 Built-in Roles** | `admin` (full access), `manager` (vault/profile/token/backup), `operator` (create/edit profiles, issue tokens), `auditor` (read-only audit/export) |
| **Granular Permissions** | 20+ fine-grained permissions: `vault.*`, `profile.view/create/edit/delete/decrypt_credentials/test_connection`, `token.view/issue/revoke`, `user.view/manage`, `audit.view/export`, `backup.view/restore`, `siem.configure`, `system.configure`, `legal_hold.manage` |
| **Wildcard Matching** | Role permissions support wildcard syntax (e.g., `profile.*` matches all profile actions) |
| **Permission Enforcement** | Every API endpoint is gated by `requirePermission()` middleware |

---

### 4. Vault Groups

| Feature | Description |
|---|---|
| **Group-Based Organization** | Connection profiles are organized into Vault Groups — logical containers for team/project scoping |
| **IP Allowlisting** | Restrict profile sync to specific client IPs or CIDR ranges per group (supports wildcards and subnet matching) |
| **Per-Group Encryption** | Each group has its own Data Encryption Key (DEK) wrapped by the master KEK |
| **Per-Group KMS** | Each group can use a different KMS provider (Local, AWS KMS, Azure Key Vault, GCP KMS, HashiCorp Vault) |
| **SSRF Protection** | Jump host and connection profile hostnames are validated against private IP ranges to prevent SSRF attacks |

---

### 5. Connection Profile Provisioning

| Feature | Description |
|---|---|
| **Centralized Profiles** | Create, edit, and delete connection profiles (FTP, SFTP, FTPS, SCP, S3, WebDAV) from the admin panel |
| **Encrypted Credentials** | All passwords and private keys are encrypted at rest using AES-256-GCM with per-group DEKs |
| **Password & Key-Pair Auth** | Supports both password-based and SSH key-pair authentication modes |
| **Jump Host / Bastion** | Configure SSH jump hosts with separate credentials per profile for bastion-host access patterns |
| **Test Connection** | One-click connection test from the admin panel verifies reachability before provisioning |
| **Auto-Sync to Clients** | Provisioned profiles are delivered to the desktop client via the `/v1/secret/data/filepilot/profiles` API |
| **Token-Scoped Delivery** | Each access token grants access only to profiles within its assigned Vault Group |

---

### 6. Access Key (Token) Management

| Feature | Description |
|---|---|
| **Server-Generated Tokens** | Cryptographically secure 256-bit tokens generated server-side; raw token shown only once |
| **SHA-256 Token Hashing** | Tokens are stored as irreversible SHA-256 hashes — raw tokens never persisted |
| **User-Scoped Tokens** | Each token is bound to a specific user and Vault Group |
| **Token Expiration** | Optional expiry dates; expired tokens are automatically blocked on sync attempts |
| **Token Status Management** | Tokens can be `active`, `blocked`, or `expired` with real-time status transitions |
| **Instant Revocation** | Revoke or block tokens instantly; connected clients are notified via WebSocket |
| **Legal Hold Protection** | Tokens under a Legal Hold freeze cannot be deleted or reissued |

---

### 7. Encryption & Key Management

| Feature | Description |
|---|---|
| **Envelope Encryption** | Two-tier encryption: Master KEK wraps per-group DEKs, DEKs encrypt credentials |
| **AES-256-GCM** | All encryption uses AES-256-GCM with random 96-bit IVs and authentication tags |
| **KEK Rotation** | Admin-initiated master key rotation that re-wraps all group DEKs under the new KEK |
| **Resumable Rotation** | If rotation is interrupted, it resumes from the last successfully rotated group |
| **Key Version Tracking** | Every KEK rotation creates a `KeyVersion` record with creation and retirement timestamps |
| **Multi-KMS Providers** | Pluggable KMS backends — Local, AWS KMS, Azure Key Vault, GCP Cloud KMS, HashiCorp Vault |
| **KMS Connection Test** | Validate KMS connectivity per-group before switching providers |
| **Previous Key Support** | Set `VAULT_MASTER_KEY_PREVIOUS` env var to support graceful KEK migration |

---

### 8. Tamper-Evident Audit Trail

| Feature | Description |
|---|---|
| **Blockchain-Style Chaining** | Every audit log entry includes a SHA-256 `entry_hash` and `prev_hash`, forming an immutable hash chain |
| **Hash Versioning** | Hash computation schema is versioned (`hash_version`) for forward-compatible upgrades |
| **Full Integrity Verification** | Admin API endpoint verifies the entire audit chain and reports the first broken link |
| **Quick Integrity Check** | Lightweight verification of the latest N entries for fast health checks |
| **Structured Metadata** | Audit entries include structured JSON metadata (who, what, when, from where) |
| **Audit Export** | Export filtered audit logs to CSV with date range, action, and user filters |
| **Log Archival** | Mark old logs as archived without deleting them |

---

### 9. SIEM Webhook Integration

| Feature | Description |
|---|---|
| **Configurable Webhook URL** | Point audit events at your SIEM collector (Splunk, Datadog, ELK, etc.) |
| **HMAC-SHA256 Signatures** | Every webhook payload is signed with a configurable secret (`X-Vault-Signature-256` header) |
| **Retry with Exponential Backoff** | Failed deliveries retry 3 times (1s → 4s → 16s) before logging a permanent failure |
| **Delivery Timeout** | 5-second timeout per webhook attempt with AbortController |
| **Failure Logging** | Permanent delivery failures are recorded in the audit log as `siem_failure` events |

---

### 10. Legal / Preservation Holds

| Feature | Description |
|---|---|
| **Activate Legal Hold** | Place a Vault Group under legal hold with a reason, placed-by user, and timestamp |
| **Freeze Writes** | Optionally freeze all write operations (profile edits, token issuance/deletion) on held groups |
| **Protect Tokens** | Tokens scoped to a held group cannot be deleted or modified |
| **Protect Profiles** | Profiles within a held group cannot be deleted when the hold is active |
| **Client Notification** | Legal hold status and freeze flags are propagated to connected clients via the sync API |
| **Release Hold** | Remove the hold when the legal review period ends |

---

### 11. File Version Control & Revert

| Feature | Description |
|---|---|
| **Automatic Versioning** | Every file uploaded through a vault-linked client creates a version snapshot with hash and size |
| **Version History** | Browse all file versions in the admin panel with timestamps, sizes, and modifiers |
| **Content Viewer** | View the content of any past version directly in the admin panel |
| **Remote Revert** | Restore a previous version by pushing it back to connected clients via WebSocket |
| **Pending Reversions** | If a client is offline during a revert, the operation is queued and dispatched when the client reconnects |
| **Configurable Retention** | Set a `backup_retention_limit` to control how many versions are kept per file |

---

### 12. WebSocket Real-Time Communication

| Feature | Description |
|---|---|
| **Client Registration** | Desktop clients connect via WebSocket and register with their access token |
| **Token Revocation Alerts** | Instantly notify connected clients when their token is blocked or revoked |
| **Token Restoration Alerts** | Notify clients when a previously blocked token is reactivated |
| **File Revert Commands** | Push `write_file` commands to connected clients to restore file versions in real-time |
| **Connection Monitoring** | Admin panel shows active WebSocket connections with client metadata |
| **Force Disconnect** | Admins can force-disconnect specific client WebSocket sessions |

---

### 13. Compliance Posture Dashboard

| Feature | Description |
|---|---|
| **Encryption Posture** | Shows KEK rotation history, per-group KMS provider, and DEK version status ([compliance-checks.cjs](file:///d:/personalproj/filepilot/corporate-vault-integration/compliance-checks.cjs)) |
| **Access Control Posture** | Lists all users, roles, MFA status, active tokens with age and last-used timestamps |
| **Audit Integrity Posture** | Verifies the hash chain and reports if the audit trail is intact or broken |
| **Access Policy Posture** | Shows IP allowlist coverage per Vault Group |
| **Session Security Posture** | Reports session timeout settings, max sessions per user, and active session counts |

---

### 14. User Management

| Feature | Description |
|---|---|
| **Create / Delete Users** | Admin-managed user lifecycle with username, password, and role assignment |
| **Role Assignment** | Assign one of 4 RBAC roles (Admin, Manager, Operator, Auditor) per user |
| **MFA Enforcement** | Per-user MFA status tracking; admins can view which users have MFA enabled |
| **Session Visibility** | View and manage all active sessions across all users |

---

### 15. System Administration

| Feature | Description |
|---|---|
| **Database Reconfiguration** | Switch between SQLite, PostgreSQL, and MySQL at runtime from the admin panel |
| **SMTP Configuration** | Configure outbound email (host, port, username, password, sender) for notifications |
| **Backup Management** | Enable/disable automated backups, set retention limits, clear old backups |
| **Log Maintenance** | Clear archived logs, purge old audit entries with date-range filters |
| **Health Check** | `/healthz` endpoint returns database connectivity status and server uptime for monitoring |
| **Rate Limiting** | Built-in rate limiter on auth endpoints (5/10min) and sync endpoints (30/min) with IP-based tracking |

---

### 16. Admin Panel (Web UI)

| Feature | Description |
|---|---|
| **Full Dashboard** | Rich single-page admin interface with live metrics: active sockets, total versions, recent logs, database dialect ([index.html](file:///d:/personalproj/filepilot/corporate-vault-integration/admin/index.html) — 300 KB) |
| **Group Management** | Create, edit, delete Vault Groups; configure KMS and IP policies |
| **Profile Management** | Full CRUD for connection profiles within groups |
| **Token Management** | Issue, block, unblock, and revoke access tokens |
| **Audit Viewer** | Browse, filter, and export the tamper-evident audit trail |
| **Compliance Dashboard** | 5-panel compliance posture report (encryption, access, audit, policy, sessions) |
| **Version Browser** | Browse and restore file version snapshots |
| **System Settings** | Configure SIEM, SMTP, backups, database, and KEK rotation |

---

## 🐚 FilePilot Shell (Terminal Emulator)

> Built with **Tauri (Rust)** backend + **React/TypeScript** frontend. Lightweight and high-performance native terminal emulator.

---

### 17. Unified Sync Manager

| Feature | Description |
|---|---|
| **Sync Groups** | Group terminal split panes into Group A, Group B, or Group C for synchronous command dispatching |
| **Real-Time Broadcast** | Forward keyboard input data to multiple remote/local split terminals with low latency (<0.2ms) |
| **Color-Coded Status** | Interactive pane status indicators dynamically showing active sync group memberships |

---

### 18. Session Replay & Recording Logs

| Feature | Description |
|---|---|
| **One-Click Playback** | Replay terminal session stdout streams frame-by-frame using the inline playback panel |
| **Local Log Transcripts** | Write complete terminal interaction histories to local log files automatically |
| **PTY Session Capture** | High-performance, zero-overhead background stdout stream recording |

---

### 19. Startup Automation Macros

| Feature | Description |
|---|---|
| **Sandbox Macro Editor** | Inline JavaScript and Shell script editor to define automated connection commands |
| **Startup Trigger Hook** | Execute custom macros automatically on the `on_startup` connection event |
| **Profile Syncing** | Load personal aliases, environment variables, and directories automatically |

---

### 20. Connection Customizations

| Feature | Description |
|---|---|
| **Agent Forwarding** | Forward ssh-agent credentials securely across SSH jumps |
| **Skip Host Verification** | Skip host key verification to speed up connections in trusted subnets |
| **Proxy Routing** | Route terminal SSH sessions through SOCKS5 or HTTP proxies |
| **Keepalive Interval** | Maintain connection states with customizable keepalive packets |

---

### 21. Nerd Fonts & Ligature Rendering

| Feature | Description |
|---|---|
| **Nerd Fonts Bundle** | Built-in font stacks for JetBrains Mono Nerd Font and Fira Code Nerd Font |
| **Deferred Ligature Loading** | Renders programming ligatures on-mount for code clarity |

---

### 22. Terminal Security & Integrations

| Feature | Description |
|---|---|
| **Paste Protection** | Prevents accidental multi-line execution with paste confirmation alerts |
| **Enterprise Vault Sync** | Integrates with HashiCorp Vault to retrieve credentials dynamically via E2EE API |

---

> **All products are 100% free and open source under the MIT License.** No premium tiers, no telemetry, no ads.
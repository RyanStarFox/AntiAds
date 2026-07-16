# Anti-Ads

> Hide page ads and in-player ad UI on **YouTube** and **Bilibili**; auto-click YouTube skip buttons when available.
>
> 隐藏 **YouTube** 和 **Bilibili** 的页面广告与播放器内广告 UI；YouTube 出现跳过按钮时自动点击。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Companion script to [AntiRecommend](https://github.com/RyanStarFox/AntiRecommend) — install both for a fully cleaned video experience.

与 [AntiRecommend](https://github.com/RyanStarFox/AntiRecommend) 配套使用，同时安装可获得完整的去推荐 + 去广告体验。

---

## Features / 功能

| | English | 中文 |
|---|---|---|
| 🧹 | Hide YouTube page & in-player ad UI | 隐藏 YouTube 页面与播放器内广告 UI |
| ⏭️ | Auto-click YouTube skip buttons | 自动点击 YouTube 跳过广告按钮 |
| 🚫 | Hide Bilibili promoted cards & page ads | 隐藏 Bilibili 推广卡片与页面广告 |
| 📢 | Hide Bilibili in-player ad danmaku overlay | 隐藏 Bilibili 播放器内广告弹幕层 |
| ⚡ | Inject CSS at `document-start` — no flicker | 在页面加载前注入 CSS，无闪烁 |
| 👁️ | MutationObserver for SPA dynamic content | 监听 SPA 动态内容，持续生效 |

---

## Supported Sites / 支持站点

| Site / 站点 | Pages / 页面 | YouTube Ads | Bilibili Ads |
|---|---|---|---|
| YouTube (Desktop) | 首页、搜索、视频页 | ✅ | — |
| YouTube (Mobile) | 视频页 | ✅ | — |
| Bilibili | 首页、搜索、视频、番剧 | — | ✅ |

---

## Installation / 安装

### Step 1 — Userscript manager / 脚本管理器

| Browser / 浏览器 | Recommended / 推荐 |
|---|---|
| Chrome / Edge / Brave / Opera | [Tampermonkey](https://www.tampermonkey.net/) |
| Firefox | [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) or [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/) |
| Safari | [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) |

### Step 2 — Install / 安装

```bash
git clone https://github.com/RyanStarFox/AntiAds.git
```

1. Open your userscript manager dashboard
2. Create a new script and paste the full contents of `anti-ads.user.js`
3. Save and refresh YouTube / Bilibili

---

## Usage / 使用方法

No configuration needed — the script runs automatically on matching pages.

无需额外配置，脚本在匹配页面自动生效。

1. Confirm the script is **Enabled / 已启用** in your manager
2. Hard-refresh after install or update: `Cmd+Shift+R` / `Ctrl+Shift+R`
3. **YouTube**: ad overlays hidden; skip button clicked when shown
4. **Bilibili**: right-side promoted cards, page ads, and activity bars hidden

> Latest version / 当前版本: **v1.0.0**

---

## FAQ / 常见问题

**Q: Can it skip all YouTube video ads?**
**问：能跳过所有 YouTube 视频广告吗？**

The script uses a conservative approach: it hides ad UI and auto-clicks the official **Skip Ad** button when available. Non-skippable ads cannot be bypassed without riskier techniques that may break playback.

采用保守策略：隐藏广告 UI 并在出现官方「跳过广告」按钮时自动点击。不可跳过的广告无法用低风险方式绕过。

**Q: Do I still need AntiRecommend?**
**问：还需要安装 AntiRecommend 吗？**

AntiAds only handles ads. For hiding recommendations, disabling autoplay, and URL redirects, install [AntiRecommend](https://github.com/RyanStarFox/AntiRecommend) separately. Both scripts can run together without conflict.

AntiAds 只负责去广告。隐藏推荐、关闭连播、URL 重定向请单独安装 [AntiRecommend](https://github.com/RyanStarFox/AntiRecommend)。两个脚本可同时安装，互不冲突。

---

## License / 许可证

[MIT](LICENSE)

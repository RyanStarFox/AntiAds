# Douban Ad Blocking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the AntiAds userscript to hide Douban commercial ads on movie / book / music / www pages while preserving 口碑榜单 and 片单/书单推荐.

**Architecture:** Same pattern as YouTube/Bilibili — inject CSS at `document-start`, JS `hideSelector` fallback, MutationObserver + 2s interval. Douban uses attribute/class selectors (`[id^="dale_"]`, `div.gray_ad`, etc.), not per-slot ID enumeration.

**Tech Stack:** Tampermonkey/Violentmonkey userscript (`anti-ads.user.js`), plain CSS + vanilla JS, no build step.

**Spec:** `docs/superpowers/specs/2026-07-16-douban-ads-design.md`

## Global Constraints

- Hide only: `[id^="dale_"]`, `div[ad-status]`, `div.gray_ad`, `.subject-banner`, `.extra`
- Never hide `#subject-doulist`, `#db-doulist-section`, `#subject-others-interests`, `#collector`, or entire `.aside`
- Do not block network requests (CSS/DOM only)
- Bump version to `1.1.0`
- Follow existing Bilibili block style in the same file

## File Structure

| File | Role |
|---|---|
| `anti-ads.user.js` | Sole runtime: metadata, CSS, hide helpers, periodic tasks |
| `README.md` | Document Douban support for users |

No new files. No test harness exists; verification is grep + manual page checks.

---

### Task 1: Add Douban matches, CSS, and hide logic

**Files:**
- Modify: `anti-ads.user.js`

**Interfaces:**
- Consumes: existing `hideSelector(sel)`, `injectStyles()`, `periodicTasks()` structure
- Produces: `hideDoubanAds()`, Douban CSS section, `@match` for douban hosts, `periodicTasks` branch for `douban.com`

- [ ] **Step 1: Update userscript header metadata**

Replace the header block at the top of `anti-ads.user.js` with:

```javascript
// ==UserScript==
// @name         Anti-Ads — Block YouTube, Bilibili & Douban Ads
// @namespace    https://github.com/RyanStarFox/AntiAds
// @version      1.1.0
// @description  Hide page ads and in-player ad UI on YouTube, Bilibili, and Douban; auto-click YouTube skip buttons
// @author       ryanstarfox
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://search.bilibili.com/*
// @match        https://www.bilibili.com/*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/*
// @match        https://movie.douban.com/*
// @match        https://book.douban.com/*
// @match        https://music.douban.com/*
// @match        https://www.douban.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==
```

- [ ] **Step 2: Add Douban CSS section after the Bilibili block**

Inside the `CSS` template literal, after the Bilibili rules and before the closing backtick, insert:

```css
    /* ===== Douban ===== */
    [id^="dale_"],
    div[ad-status],
    div.gray_ad,
    .subject-banner,
    .extra {
      display: none !important;
    }
```

Do not add `#subject-doulist`, `#db-doulist-section`, `#footer`, or `.aside` rules.

- [ ] **Step 3: Add `hideDoubanAds()` after `hideBilibiliAds()`**

Insert this function immediately after `hideBilibiliAds`:

```javascript
  function hideDoubanAds() {
    hideSelector('[id^="dale_"]');
    hideSelector('div[ad-status]');
    hideSelector('div.gray_ad');
    hideSelector('.subject-banner');
    hideSelector('.extra');
  }
```

- [ ] **Step 4: Wire Douban into `periodicTasks()`**

Change the hostname branch from:

```javascript
    if (host.includes('youtube.com')) {
      hideYouTubeAds();
      clickYouTubeAdControls();
    } else if (host.includes('bilibili.com')) {
      hideBilibiliAds();
    }
```

to:

```javascript
    if (host.includes('youtube.com')) {
      hideYouTubeAds();
      clickYouTubeAdControls();
    } else if (host.includes('bilibili.com')) {
      hideBilibiliAds();
    } else if (host.includes('douban.com')) {
      hideDoubanAds();
    }
```

- [ ] **Step 5: Verify script structure with grep**

Run:

```bash
rg -n 'dale_|gray_ad|hideDoubanAds|movie\.douban|1\.1\.0|subject-doulist' anti-ads.user.js
```

Expected:
- Matches for `dale_`, `gray_ad`, `hideDoubanAds`, four douban `@match` lines, version `1.1.0`
- **No** match for `subject-doulist` (must not be a hide target)

- [ ] **Step 6: Commit**

```bash
git add anti-ads.user.js
git commit -m "$(cat <<'EOF'
Add Douban ad hiding via Dale slots and gray_ad.

EOF
)"
```

---

### Task 2: Update README for Douban support

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: Douban behavior shipped in Task 1 (`v1.1.0`, same selectors)
- Produces: User-facing docs listing Douban movie/book/music/www

- [ ] **Step 1: Update tagline (lines 3–5)**

Replace with:

```markdown
> Hide page ads and in-player ad UI on **YouTube**, **Bilibili**, and **Douban**; auto-click YouTube skip buttons when available.
>
> 隐藏 **YouTube**、**Bilibili** 和 **豆瓣** 的页面广告与播放器内广告 UI；YouTube 出现跳过按钮时自动点击。
```

- [ ] **Step 2: Add Douban feature rows in Features table**

After the Bilibili danmaku row, add:

```markdown
| 🎬 | Hide Douban Dale ad slots & gray promo blocks | 隐藏豆瓣 Dale 广告位与灰色推广块 |
```

- [ ] **Step 3: Expand Supported Sites table**

Replace the Supported Sites table with:

```markdown
| Site / 站点 | Pages / 页面 | Ads |
|---|---|---|
| YouTube (Desktop) | 首页、搜索、视频页 | ✅ |
| YouTube (Mobile) | 视频页 | ✅ |
| Bilibili | 首页、搜索、视频、番剧 | ✅ |
| Douban Movie | 首页、条目页 | ✅ |
| Douban Book | 首页、条目页 | ✅ |
| Douban Music | 条目页 | ✅ |
| Douban (www) | 共享广告位 | ✅ |
```

- [ ] **Step 4: Update install refresh note, Usage, and version**

- Install step 3: change to `Save and refresh YouTube / Bilibili / Douban`
- Usage: add bullet  
  `5. **Douban**: Dale slots, gray_ad buy/promo blocks, and subject banners hidden; 片单/书单/口碑榜 kept`
- Version line: `**v1.1.0**`

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
Document Douban ad blocking in README.

EOF
)"
```

---

### Task 3: Manual verification on Douban pages

**Files:**
- None (browser check only)

**Interfaces:**
- Consumes: installed `anti-ads.user.js` v1.1.0 from Tasks 1–2

- [ ] **Step 1: Install / update script in userscript manager**

Paste the full updated `anti-ads.user.js` into Tampermonkey/Violentmonkey and save. Confirm version shows `1.1.0` and matches include `*.douban.com`.

- [ ] **Step 2: Hard-refresh and check movie subject**

Open: `https://movie.douban.com/subject/1306939/`  
Hard-refresh: `Cmd+Shift+R`

Pass criteria:
- Right-side Dale ads (game/video promo with 「广告」 badge) are gone
- Mid-page / mid-right Dale slots gone
- 「以下片单推荐」 still visible
- 「谁在看这部电影」 still visible

- [ ] **Step 3: Check music subject**

Open: `https://music.douban.com/subject/1407700/`

Pass criteria:
- `#dale_music_*` / gray_ad buy block gone
- 「去豆瓣音乐收听」 promo gone if it was in an ad slot
- 「以下豆列推荐」 still visible
- Nav link 「豆瓣FM」 still present

- [ ] **Step 4: Check book subject + homes**

Open:
- `https://book.douban.com/subject/38503798/?icn=index-latestbook-subject`
- `https://book.douban.com/`
- `https://movie.douban.com/`

Pass criteria:
- Right-side ads / gray_ad 「当前版本有售」 gone on subject
- 「以下书单推荐」 remains
- Homepage 口碑榜 / 排行榜 modules remain; only Dale-style slots missing

- [ ] **Step 5: If “去豆瓣音乐收听” still visible**

Do **not** hide all links containing that text globally. Inspect the node; if it is outside Dale/gray_ad, add a tightly scoped follow-up selector in a new commit (only that container). Otherwise mark Task 3 complete.

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| `@match` movie/book/music/www | Task 1 Step 1 |
| CSS `[id^="dale_"]`, `div[ad-status]`, `div.gray_ad`, `.subject-banner`, `.extra` | Task 1 Step 2 |
| `hideDoubanAds()` + `periodicTasks` branch | Task 1 Steps 3–4 |
| Preserve doulist / collector / 口碑 | Task 1 Step 2 (omission) + Task 3 |
| README update | Task 2 |
| Manual verification URLs | Task 3 |
| Version 1.1.0 | Task 1 Step 1, Task 2 Step 4 |

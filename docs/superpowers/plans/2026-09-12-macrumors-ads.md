# MacRumors Ad Blocking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the AntiAds userscript to hide MacRumors AdThrive ad slots and Taboola widgets on `www.macrumors.com` while preserving articles, comments, forums, and CCPA privacy UI.

**Architecture:** Same pattern as Bilibili/Douban — inject CSS at `document-start`, JS `hideSelector` fallback, debounced MutationObserver + 2s interval. MacRumors uses class/id selectors (`.adthrive-ad`, `[id^="AdThrive_"]`, Taboola containers), not per-slot enumeration. Never use `[class*="adthrive"]` (would hide `<body>`).

**Tech Stack:** Tampermonkey/Violentmonkey userscript (`anti-ads.user.js`), plain CSS + vanilla JS, no build step.

**Spec:** `docs/superpowers/specs/2026-09-12-macrumors-ads-design.md`

## Global Constraints

- Hide only: `.adthrive-ad`, `[id^="AdThrive_"]`, `#taboola-skimlinks`, `.trc_related_container`, `.tbl-trecs-container`
- Never use `[class*="adthrive"]`; never hide `.adthrive-ccpa-*`
- Do not block network requests (CSS/DOM only)
- Bump version to `1.3.0`
- Follow existing Douban block style in the same file

## File Structure

| File | Role |
|---|---|
| `anti-ads.user.js` | Sole runtime: metadata, CSS, hide helpers, periodic tasks |
| `README.md` | Document MacRumors support for users |

No new files. No test harness exists; verification is grep + manual page checks.

---

### Task 1: Add MacRumors matches, CSS, and hide logic

**Files:**
- Modify: `anti-ads.user.js`

**Interfaces:**
- Consumes: existing `hideSelector(sel)`, `injectStyles()`, `hidePageAds()`, `periodicTasks()` structure
- Produces: `hideMacRumorsAds()`, MacRumors CSS section, `@match` for `www.macrumors.com`, `hidePageAds` branch for `macrumors.com`

- [ ] **Step 1: Update userscript header metadata**

Replace the header block at the top of `anti-ads.user.js` with:

```javascript
// ==UserScript==
// @name         Anti-Ads — Block Bilibili, Douban & MacRumors Ads
// @namespace    https://github.com/RyanStarFox/AntiAds
// @version      1.3.0
// @description  Hide page ads and in-player ad UI on Bilibili, Douban, and MacRumors
// @author       ryanstarfox
// @match        https://search.bilibili.com/*
// @match        https://www.bilibili.com/*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/*
// @match        https://movie.douban.com/*
// @match        https://book.douban.com/*
// @match        https://music.douban.com/*
// @match        https://www.douban.com/*
// @match        https://www.macrumors.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==
```

- [ ] **Step 2: Add MacRumors CSS section after the Douban block**

Inside the `CSS` template literal, after the Douban rules and before the closing backtick, insert:

```css
    /* ===== MacRumors ===== */
    .adthrive-ad,
    [id^="AdThrive_"],
    #taboola-skimlinks,
    .trc_related_container,
    .tbl-trecs-container {
      display: none !important;
    }
```

Do **not** add `[class*="adthrive"]`, `.adthrive-ccpa-modal`, or `.adthrive-ccpa-link`.

- [ ] **Step 3: Add `hideMacRumorsAds()` after `hideDoubanAds()`**

Insert this function immediately after `hideDoubanAds`:

```javascript
  function hideMacRumorsAds() {
    hideSelector('.adthrive-ad');
    hideSelector('[id^="AdThrive_"]');
    hideSelector('#taboola-skimlinks');
    hideSelector('.trc_related_container');
    hideSelector('.tbl-trecs-container');
  }
```

- [ ] **Step 4: Wire MacRumors into `hidePageAds()`**

Change the hostname branch from:

```javascript
  function hidePageAds() {
    const host = location.hostname;
    if (host.includes('bilibili.com')) {
      hideBilibiliAds();
    } else if (host.includes('douban.com')) {
      hideDoubanAds();
    }
  }
```

to:

```javascript
  function hidePageAds() {
    const host = location.hostname;
    if (host.includes('bilibili.com')) {
      hideBilibiliAds();
    } else if (host.includes('douban.com')) {
      hideDoubanAds();
    } else if (host.includes('macrumors.com')) {
      hideMacRumorsAds();
    }
  }
```

- [ ] **Step 5: Verify selectors are present**

Run:

```bash
rg -n 'AdThrive_|adthrive-ad|hideMacRumorsAds|macrumors\.com|1\.3\.0|taboola-skimlinks' anti-ads.user.js
```

Expected matches for: `adthrive-ad`, `AdThrive_`, `hideMacRumorsAds`, `@match` line with `macrumors.com`, version `1.3.0`, `taboola-skimlinks`. No match for `[class*="adthrive"]`.

- [ ] **Step 6: Commit**

```bash
git add anti-ads.user.js
git commit -m "$(cat <<'EOF'
Add MacRumors AdThrive and Taboola ad hiding.

EOF
)"
```

---

### Task 2: Update README for MacRumors support

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: v1.3.0 script from Task 1
- Produces: user-facing docs listing MacRumors

- [ ] **Step 1: Update the tagline**

Replace the bilingual tagline block with:

```markdown
> Hide page ads and in-player ad UI on **Bilibili**, **Douban**, and **MacRumors**.
>
> 隐藏 **Bilibili**、**豆瓣** 和 **MacRumors** 的页面广告与播放器内广告 UI。
```

- [ ] **Step 2: Add MacRumors feature row**

After the Douban feature row, add:

```markdown
| 📰 | Hide MacRumors AdThrive slots & Taboola widgets | 隐藏 MacRumors AdThrive 广告位与 Taboola 推荐块 |
```

- [ ] **Step 3: Add MacRumors to Supported Sites**

In the sites table, after the Douban (www) row, add:

```markdown
| MacRumors | 首页、文章、全站路径 | ✅ |
```

- [ ] **Step 4: Update install / usage / version**

- Install step 3: change to `Save and refresh Bilibili / Douban / MacRumors`
- Usage: add bullet
  `5. **MacRumors**: AdThrive header / in-content / sticky footer slots and Taboola widgets hidden; articles, comments, forums, CCPA privacy UI kept`
- Version line: `**v1.3.0**`

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
Document MacRumors ad blocking in README.

EOF
)"
```

---

### Task 3: Manual verification on live pages

**Files:**
- None (browser checks only)

**Interfaces:**
- Consumes: installed `anti-ads.user.js` v1.3.0 from Tasks 1–2

- [ ] **Step 1: Install updated script**

Paste the full updated `anti-ads.user.js` into Tampermonkey/Violentmonkey and save. Confirm version shows `1.3.0` and matches include `www.macrumors.com/*`.

- [ ] **Step 2: Verify homepage**

Open https://www.macrumors.com/

Expected:
- Header AdThrive bar gone
- In-feed content ad slots gone
- Sticky footer ad gone
- Story list / navigation remain
- `document.body` still visible (not `display: none`)

- [ ] **Step 3: Verify article page**

Open https://www.macrumors.com/2026/09/12/iphone-18-pro-available-to-pre-order/

Expected:
- Mid-article AdThrive slot(s) gone
- Sticky footer ad gone
- Article text, author, comments, Popular Stories remain

- [ ] **Step 4: Taboola / false-positive check**

- If `#taboola-skimlinks` or `.trc_related_container` populate, they must be hidden
- `.adthrive-ccpa-modal` / privacy controls must remain available if shown
- Do not hide podcast or YouTube embeds inside articles

If any ad remains with a stable class/id not in the hide list, add a tightly scoped follow-up selector in a new commit. Otherwise mark Task 3 complete (no commit required for pure verification).

---

## Spec coverage checklist

| Spec requirement | Plan location |
|---|---|
| `@match https://www.macrumors.com/*` | Task 1 Step 1 |
| CSS `.adthrive-ad`, `[id^="AdThrive_"]`, Taboola selectors | Task 1 Step 2 |
| Never `[class*="adthrive"]` / never CCPA hide | Task 1 Steps 2–5 |
| `hideMacRumorsAds()` + `hidePageAds` branch | Task 1 Steps 3–4 |
| Version `1.3.0` | Task 1 Step 1, Task 2 Step 4 |
| README update | Task 2 |
| Homepage + article verification | Task 3 |

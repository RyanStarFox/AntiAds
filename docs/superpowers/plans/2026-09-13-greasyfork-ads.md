# Greasy Fork Ad Blocking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the AntiAds userscript to hide Greasy Fork Google AdSense and EthicalAds widgets on `greasyfork.org` while preserving script lists, script detail pages, forums, and privacy UI.

**Architecture:** Same pattern as MacRumors/Douban — inject CSS at `document-start`, JS `hideSelector` fallback, debounced MutationObserver + 2s interval. Greasy Fork uses class/id selectors (`.ad.ad-ga`, `ins.adsbygoogle`, `.ethical-ads`, `.ad-entry`). Never use a bare `.ad` selector.

**Tech Stack:** Tampermonkey/Violentmonkey userscript (`anti-ads.user.js`), plain CSS + vanilla JS, no build step.

**Spec:** `docs/superpowers/specs/2026-09-13-greasyfork-ads-design.md`

## Global Constraints

- Hide only: `.ad.ad-ga`, `#home-ad`, `.ad-content`, `ins.adsbygoogle`, `.ethical-ads`, `.ad-entry`
- Never use bare `.ad` alone
- Do not block network requests (CSS/DOM only)
- Bump version to `1.4.0`
- Follow existing MacRumors block style in the same file

## File Structure

| File | Role |
|---|---|
| `anti-ads.user.js` | Sole runtime: metadata, CSS, hide helpers, periodic tasks |
| `README.md` | Document Greasy Fork support for users |

No new files. No test harness exists; verification is grep + manual/CDP page checks.

---

### Task 1: Add Greasy Fork matches, CSS, and hide logic

**Files:**
- Modify: `anti-ads.user.js`

**Interfaces:**
- Consumes: existing `hideSelector(sel)`, `injectStyles()`, `hidePageAds()`, `periodicTasks()` structure
- Produces: `hideGreasyForkAds()`, Greasy Fork CSS section, `@match` for `greasyfork.org`, `hidePageAds` branch for `greasyfork.org`

- [ ] **Step 1: Update userscript header metadata**

Replace the header block at the top of `anti-ads.user.js` with:

```javascript
// ==UserScript==
// @name         Anti-Ads — Block Bilibili, Douban, MacRumors & Greasy Fork Ads
// @namespace    https://github.com/RyanStarFox/AntiAds
// @version      1.4.0
// @description  Hide page ads and in-player ad UI on Bilibili, Douban, MacRumors, and Greasy Fork
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
// @match        https://greasyfork.org/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==
```

- [ ] **Step 2: Add Greasy Fork CSS section after the MacRumors block**

Inside the `CSS` template literal, after the MacRumors rules and before the closing backtick, insert:

```css
    /* ===== Greasy Fork ===== */
    .ad.ad-ga,
    #home-ad,
    .ad-content,
    ins.adsbygoogle,
    .ethical-ads,
    .ad-entry {
      display: none !important;
    }
```

Do **not** add a bare `.ad` rule.

- [ ] **Step 3: Add `hideGreasyForkAds()` after `hideMacRumorsAds()`**

Insert this function immediately after `hideMacRumorsAds`:

```javascript
  function hideGreasyForkAds() {
    hideSelector('.ad.ad-ga');
    hideSelector('#home-ad');
    hideSelector('.ad-content');
    hideSelector('ins.adsbygoogle');
    hideSelector('.ethical-ads');
    hideSelector('.ad-entry');
  }
```

- [ ] **Step 4: Wire Greasy Fork into `hidePageAds()`**

Change the hostname branch from:

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
    } else if (host.includes('greasyfork.org')) {
      hideGreasyForkAds();
    }
  }
```

- [ ] **Step 5: Verify selectors are present**

Run:

```bash
rg -n 'greasyfork\.org|hideGreasyForkAds|ad\.ad-ga|adsbygoogle|ethical-ads|ad-entry|1\.4\.0' anti-ads.user.js
```

Expected matches for: `@match` with `greasyfork.org`, version `1.4.0`, `hideGreasyForkAds`, `.ad.ad-ga`, `ins.adsbygoogle`, `.ethical-ads`, `.ad-entry`. Confirm there is no CSS rule that is only bare `.ad,` / `.ad {`.

- [ ] **Step 6: Commit**

```bash
git add anti-ads.user.js
git commit -m "$(cat <<'EOF'
Add Greasy Fork AdSense and EthicalAds hiding.

EOF
)"
```

---

### Task 2: Update README for Greasy Fork support

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: v1.4.0 script from Task 1
- Produces: user-facing docs listing Greasy Fork

- [ ] **Step 1: Update the tagline**

Replace the bilingual tagline block with:

```markdown
> Hide page ads and in-player ad UI on **Bilibili**, **Douban**, **MacRumors**, and **Greasy Fork**.
>
> 隐藏 **Bilibili**、**豆瓣**、**MacRumors** 和 **Greasy Fork** 的页面广告与播放器内广告 UI。
```

- [ ] **Step 2: Add Greasy Fork feature row**

After the MacRumors feature row, add:

```markdown
| 🛠️ | Hide Greasy Fork AdSense & EthicalAds | 隐藏 Greasy Fork AdSense 与 EthicalAds |
```

- [ ] **Step 3: Add Greasy Fork to Supported Sites**

In the sites table, after the MacRumors row, add:

```markdown
| Greasy Fork | 首页、脚本列表、详情、全站路径 | ✅ |
```

- [ ] **Step 4: Update install / usage / version**

- Install step 3: change to `Save and refresh Bilibili / Douban / MacRumors / Greasy Fork`
- Usage: add bullet
  `6. **Greasy Fork**: AdSense slots (incl. fixed overlay) and EthicalAds list widgets hidden; script lists, detail pages, forums, privacy UI kept`
- Version line: `**v1.4.0**`

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
Document Greasy Fork ad blocking in README.

EOF
)"
```

---

### Task 3: Manual verification on live pages

**Files:**
- None (browser checks only)

**Interfaces:**
- Consumes: installed `anti-ads.user.js` v1.4.0 from Tasks 1–2

- [ ] **Step 1: Install or inject updated selectors**

Prefer Tampermonkey paste of full `anti-ads.user.js` v1.4.0. If Tampermonkey is unavailable in the agent environment, inject the exact Greasy Fork CSS selectors via CDP (same approach as MacRumors Task 3).

- [ ] **Step 2: Verify homepage**

Open https://greasyfork.org/zh-CN

Expected:
- `#home-ad` / `.ad.ad-ga` / `ins.adsbygoogle` gone (including fixed top overlay if present)
- Welcome / install-manager content remains
- Privacy “Do Not Sell…” control still available if shown

- [ ] **Step 3: Verify script listing**

Open https://greasyfork.org/zh-CN/scripts/by-site/bilibili.com

Expected:
- EthicalAds row (`.ethical-ads` / `.ad-entry`) gone
- Normal script list entries remain and are clickable

- [ ] **Step 4: Verify a script detail page**

Open any script detail URL from the listing.

Expected:
- Install button and description remain
- Any page AdSense slots gone

If any ad remains with a stable class/id not in the hide list, add a tightly scoped follow-up selector in a new commit. Otherwise mark Task 3 complete (no commit required for pure verification).

---

## Spec coverage checklist

| Spec requirement | Plan location |
|---|---|
| `@match https://greasyfork.org/*` | Task 1 Step 1 |
| CSS AdSense + EthicalAds selectors | Task 1 Step 2 |
| Never bare `.ad` | Task 1 Steps 2–5 |
| `hideGreasyForkAds()` + `hidePageAds` branch | Task 1 Steps 3–4 |
| Version `1.4.0` | Task 1 Step 1, Task 2 Step 4 |
| README update | Task 2 |
| Homepage + listing + detail verification | Task 3 |

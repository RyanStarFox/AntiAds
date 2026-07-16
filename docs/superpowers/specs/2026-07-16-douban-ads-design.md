# Douban Ad Blocking — Design Spec

**Date:** 2026-07-16  
**Status:** Approved for implementation  
**Scope:** Extend AntiAds userscript to hide Douban page ads

## Goal

Hide commercial ads on Douban movie / book / music / www pages using the same CSS + MutationObserver pattern as YouTube and Bilibili. Preserve editorial content: 口碑榜单, 片单/书单推荐, reviews, and other non-ad modules.

## Sites

| Host | Coverage |
|---|---|
| `movie.douban.com` | Homepage + subject pages (highest ad density) |
| `book.douban.com` | Homepage + subject pages |
| `music.douban.com` | Subject pages (incl. “去豆瓣音乐收听” promo when in ad slots) |
| `www.douban.com` | Shared ad slots via the same selectors |

## Approach

**Attribute / class–based hiding (Approach A), including `.gray_ad`.**

Do not enumerate every `#dale_movie_*` ID. Do not hide entire `.aside` sidebars.

### Hide (ads)

| Selector | Why |
|---|---|
| `[id^="dale_"]` | Douban Dale ad slot containers (top-right, middle-right, banners, etc.) |
| `div[ad-status]` | Containers marked with Douban ad-status attribute |
| `div.gray_ad` | Gray promo blocks (e.g. “在哪儿买这张唱片”, “当前版本有售”) — confirmed as ads |
| `.subject-banner` | Subject-page promotional banners |
| `.extra` | Extra ad chrome often paired with Dale slots |

### Preserve (non-ads)

Do **not** target these (and do not use broad “hide all aside children” rules):

| Selector / content | Why keep |
|---|---|
| `#subject-doulist` | 以下片单推荐 |
| `#db-doulist-section` | 豆列 / 书单推荐 |
| `#subject-others-interests` / `#collector` | “谁在看 / 谁在听 / 谁在读” |
| Homepage 口碑榜 / 排行榜 modules | Editorial rankings, not Dale slots |

### “去豆瓣音乐收听”

Expected to live inside a Dale / gray_ad container and be removed by the rules above. If it still appears after verification, add a follow-up patch that only hides that CTA when it sits inside an already-identified ad container (or a tightly scoped text match). Do not hide normal “豆瓣FM” nav links.

## Implementation (single file)

File: `anti-ads.user.js`

1. **Metadata**
   - Bump version (e.g. `1.1.0`)
   - Update `@name` / `@description` to mention Douban
   - Add `@match` for:
     - `https://movie.douban.com/*`
     - `https://book.douban.com/*`
     - `https://music.douban.com/*`
     - `https://www.douban.com/*`

2. **CSS block** — add a `/* ===== Douban ===== */` section with the hide selectors and `display: none !important`.

3. **`hideDoubanAds()`** — mirror `hideBilibiliAds()`: call `hideSelector` for the same selectors as a JS fallback.

4. **`periodicTasks()`** — branch:
   ```js
   } else if (host.includes('douban.com')) {
     hideDoubanAds();
   }
   ```
   Existing `injectStyles`, MutationObserver, and 2s interval remain unchanged.

5. **README** — document Douban in features / supported sites / usage.

## Out of scope

- Network / request blocking (`erebor.douban.com`, etc.) — AntiAds is CSS/DOM only
- Removing non-ad sidebar content (reviews, doulists, collectors)
- Per-user toggles or settings UI
- Podcast / FM / group–specific rules beyond what the shared selectors already cover

## Verification

Manual hard-refresh after install:

1. [movie subject](https://movie.douban.com/subject/1306939/) — right-side ads gone; 片单推荐 remains
2. [music subject](https://music.douban.com/subject/1407700/) — Dale / gray_ad / “去豆瓣音乐收听” promo gone; 豆列推荐 remains
3. [book subject](https://book.douban.com/subject/38503798/) — right-side ads and buy gray_ad gone; 书单推荐 remains
4. [movie home](https://movie.douban.com/) / [book home](https://book.douban.com/) — ad slots gone; 口碑榜 / rankings remain

## Risks

| Risk | Mitigation |
|---|---|
| Future non-ad nodes reuse `ad-status` | Prefer `[id^="dale_"]` + `div.gray_ad`; treat `div[ad-status]` as secondary; verify after ship |
| New Dale slot IDs | Prefix selector covers new IDs without code changes |
| False positive on content | Never hide `#subject-doulist` / `#db-doulist-section` / chart headings via broad aside rules |

# MacRumors Ad Blocking — Design Spec

**Date:** 2026-09-12  
**Status:** Approved for implementation  
**Scope:** Extend AntiAds userscript to hide MacRumors page ads and Taboola widgets

## Goal

Hide commercial AdThrive ad slots and Taboola recommendation widgets on `www.macrumors.com` using the same CSS + MutationObserver pattern as Bilibili and Douban. Preserve editorial content: news articles, comments, forums, navigation, and site chrome.

## Sites

| Host | Coverage |
|---|---|
| `www.macrumors.com` | Full site: homepage, article pages, guides, forums, and other paths under this host |

Native MacRumors apps are out of scope (userscripts cannot modify native apps).

## Approach

**Class / id–based hiding (Approach A), plus Taboola containers.**

Do not enumerate every `AdThrive_Content_N` ID. Do not use `[class*="adthrive"]` — the document `<body>` carries classes such as `adthrive-device-phone` and would be hidden incorrectly.

### Hide (ads / sponsored widgets)

| Selector | Why |
|---|---|
| `.adthrive-ad` | Primary AdThrive slot wrapper (header, in-content, footer sticky) |
| `[id^="AdThrive_"]` | Slot id containers as a fallback when class markup varies |
| `#taboola-skimlinks` | Taboola / Skimlinks widget mount |
| `.trc_related_container` | Taboola related / spotlight container |
| `.tbl-trecs-container` | Taboola tRecs container |

Verified on homepage and article pages (e.g. `/2026/09/12/iphone-18-pro-available-to-pre-order/`): visible ads sit inside `.adthrive-ad` / `AdThrive_*` nodes; Taboola mounts as `#taboola-skimlinks` / `.trc_related_container`.

### Preserve (non-ads)

Do **not** target these:

| Selector / content | Why keep |
|---|---|
| Article body, headlines, author bylines | Editorial content |
| Comments, Popular Stories, Guides, Upcoming | Site content modules |
| Forums navigation and threads | Community content |
| `.adthrive-ccpa-*` / privacy modal | CCPA / privacy UI, not ads |
| `[class*="adthrive"]` broad match | Would hide `<body>` via `adthrive-device-phone` |

## Implementation (single file)

File: `anti-ads.user.js`

1. **Metadata**
   - Bump version to `1.3.0`
   - Update `@name` / `@description` to mention MacRumors
   - Add `@match`: `https://www.macrumors.com/*`

2. **CSS block** — add a `/* ===== MacRumors ===== */` section with the hide selectors and `display: none !important`.

3. **`hideMacRumorsAds()`** — mirror `hideDoubanAds()`: call `hideSelector` for the same selectors as a JS fallback.

4. **`hidePageAds()`** — branch:
   ```js
   } else if (host.includes('macrumors.com')) {
     hideMacRumorsAds();
   }
   ```
   Existing `injectStyles`, MutationObserver debounce, and 2s interval remain unchanged.

5. **README** — document MacRumors in features / supported sites / usage / version.

## Out of scope

- Network / request blocking (`ads.adthrive.com`, Google GPT iframes, etc.) — AntiAds is CSS/DOM only
- Hiding podcast embeds, YouTube embeds, or affiliate text links inside article copy
- Native iOS / Android MacRumors apps
- `forums.macrumors.com` on a separate host (only covered if it redirects under `www.macrumors.com`; add a follow-up `@match` if a separate forums host is confirmed later)

## Verification

After install / update:

1. [Homepage](https://www.macrumors.com/) — header / in-feed / sticky footer AdThrive slots gone; story list remains
2. [Article](https://www.macrumors.com/2026/09/12/iphone-18-pro-available-to-pre-order/) — mid-article and sticky ads gone; article text and comments remain
3. Confirm `<body>` is still visible (no accidental hide via broad `adthrive` class match)
4. If Taboola widgets appear filled-in later, confirm `#taboola-skimlinks` / `.trc_related_container` hide them

## Risks

| Risk | Mitigation |
|---|---|
| New AdThrive slots without `.adthrive-ad` | `[id^="AdThrive_"]` fallback; patch if CafeMedia renames |
| False positive on body / layout classes | Never use `[class*="adthrive"]` |
| Forums on a different subdomain | Verify host; add `@match` in a follow-up if needed |
| Sticky footer leaves empty gap | Hiding `.adthrive-ad.adthrive-sticky` should collapse; revisit if placeholder remains |

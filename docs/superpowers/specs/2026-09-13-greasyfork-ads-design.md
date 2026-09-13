# Greasy Fork Ad Blocking — Design Spec

**Date:** 2026-09-13  
**Status:** Approved for implementation  
**Scope:** Extend AntiAds userscript to hide Greasy Fork page ads (Google AdSense + EthicalAds)

## Goal

Hide commercial Google AdSense slots and EthicalAds widgets on `greasyfork.org` using the same CSS + MutationObserver pattern as Bilibili, Douban, and MacRumors. Preserve editorial content: script lists, script detail pages, forums, navigation, and site chrome.

## Sites

| Host | Coverage |
|---|---|
| `greasyfork.org` | Full site under all locale prefixes (e.g. `/`, `/zh-CN`, `/en`, script lists, script detail, forums) |

Locale paths are covered by a single `@match` of `https://greasyfork.org/*`.

## Approach

**Class / id–based hiding (Approach A).**

Hide both AdSense and EthicalAds. Do not enumerate per-locale EthicalAds IDs (e.g. `#script-list-ea_zh-CN`). Do not use a bare `.ad` selector — prefer `.ad.ad-ga` and EthicalAds-specific classes so ordinary list items are not hidden.

### Hide (ads)

| Selector | Why |
|---|---|
| `.ad.ad-ga` | Greasy Fork Google AdSense slot wrappers (e.g. `#home-ad`) |
| `#home-ad` | Homepage AdSense mount (id fallback) |
| `.ad-content` | Inner AdSense content wrapper |
| `ins.adsbygoogle` | AdSense `<ins>` units, including fixed top overlay |
| `.ethical-ads` | EthicalAds widget root |
| `.ad-entry` | Script-list list item that wraps EthicalAds (not a normal script entry) |

Verified on homepage (`/zh-CN`) and script listing (`/zh-CN/scripts/by-site/bilibili.com`): AdSense uses `.ad.ad-ga` / `ins.adsbygoogle`; EthicalAds uses `.ethical-ads` inside `LI.ad-entry`.

### Preserve (non-ads)

Do **not** target these:

| Selector / content | Why keep |
|---|---|
| Script list entries (non-`.ad-entry` items) | Catalog content |
| Script detail pages (title, install button, description, code) | Core product pages |
| Forums / help / navigation | Community and site chrome |
| Privacy / CCPA “Do Not Sell…” UI | Privacy controls, not ads |
| Bare `.ad` alone | Too broad; prefer `.ad.ad-ga` + EthicalAds selectors |

## Implementation (single file)

File: `anti-ads.user.js`

1. **Metadata**
   - Bump version to `1.4.0`
   - Update `@name` / `@description` to mention Greasy Fork
   - Add `@match`: `https://greasyfork.org/*`

2. **CSS block** — add a `/* ===== Greasy Fork ===== */` section with the hide selectors and `display: none !important`.

3. **`hideGreasyForkAds()`** — mirror `hideMacRumorsAds()`: call `hideSelector` for the same selectors as a JS fallback.

4. **`hidePageAds()`** — branch:
   ```js
   } else if (host.includes('greasyfork.org')) {
     hideGreasyForkAds();
   }
   ```
   Existing `injectStyles`, MutationObserver debounce, and 2s interval remain unchanged.

5. **README** — document Greasy Fork in features / supported sites / usage / version.

## Out of scope

- Network / request blocking (Google ad iframes, EthicalAds pixels, etc.) — AntiAds is CSS/DOM only
- Hiding affiliate text links inside script descriptions
- Sleazy Fork / other forks unless a separate `@match` is added later
- Native mobile apps

## Verification

After install / update:

1. [Homepage](https://greasyfork.org/zh-CN) — `#home-ad` / AdSense units and any fixed top `ins.adsbygoogle` gone; welcome content remains
2. [Script listing](https://greasyfork.org/zh-CN/scripts/by-site/bilibili.com) — EthicalAds row (`.ethical-ads` / `.ad-entry`) gone; normal script entries remain
3. Open any script detail page — install button and description remain; any page AdSense slots gone
4. Confirm privacy “Do Not Sell…” control still available if shown

## Risks

| Risk | Mitigation |
|---|---|
| New EthicalAds IDs per locale | Prefer `.ethical-ads` / `.ad-entry` over id enumeration |
| False positive on `.ad` | Never use bare `.ad`; require `.ad.ad-ga` or EthicalAds classes |
| Fixed overlay leaves empty gap | Hiding `ins.adsbygoogle` should collapse; revisit if placeholder remains |
| Sleazy Fork / alternate hosts | Out of scope; add `@match` in a follow-up if requested |

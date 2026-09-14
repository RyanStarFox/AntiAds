// ==UserScript==
// @name         Anti-Ads — Block Bilibili, Douban and other common websites
// @namespace    https://github.com/RyanStarFox/AntiAds
// @version      1.4.3
// @description  Hide page ads and in-player ad UI on Bilibili, Douban, and other common websites
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
// @match        https://forums.macrumors.com/*
// @match        https://greasyfork.org/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  const STYLE_ID = 'anti-ads-styles';

  const CSS = `
    /* ===== Bilibili ===== */
    .video-card-ad-small,
    .video-card-ad-small-inner,
    .ad-report,
    .ad-report-inner,
    .strip-ad,
    .left-banner,
    .right-bottom-banner,
    .ad-floor-exp,
    .ad-floor-cover,
    .slide-ad-exp,
    #slide_ad,
    .bpx-player-adv-dm-wrap,
    .activity-m-v1 {
      display: none !important;
    }

    /* ===== Douban ===== */
    [id^="dale_"],
    div[ad-status],
    div.gray_ad,
    .subject-banner,
    .extra {
      display: none !important;
    }

    /* ===== MacRumors ===== */
    .adthrive-ad,
    [id^="AdThrive_"],
    #taboola-skimlinks,
    .trc_related_container,
    .tbl-trecs-container,
    #tertiary:has(> .adthrive-ad) {
      display: none !important;
    }

    /* ===== Greasy Fork ===== */
    .ad.ad-ga,
    .ad.ad-ea,
    #home-ad,
    #script-show-info-ad,
    .ad-content,
    ins.adsbygoogle,
    .ethical-ads,
    .ad-entry {
      display: none !important;
    }
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function hideSelector(sel) {
    try {
      document.querySelectorAll(sel).forEach(el => {
        if (el.style.display === 'none') return;
        el.style.setProperty('display', 'none', 'important');
      });
    } catch (_) { /* ignore */ }
  }

  function hideBilibiliAds() {
    hideSelector('.video-card-ad-small');
    hideSelector('.video-card-ad-small-inner');
    hideSelector('.ad-report');
    hideSelector('.ad-report-inner');
    hideSelector('.strip-ad');
    hideSelector('.left-banner');
    hideSelector('.right-bottom-banner');
    hideSelector('.ad-floor-exp');
    hideSelector('.ad-floor-cover');
    hideSelector('.slide-ad-exp');
    hideSelector('#slide_ad');
    hideSelector('.bpx-player-adv-dm-wrap');
    hideSelector('.activity-m-v1');
  }

  function hideDoubanAds() {
    hideSelector('[id^="dale_"]');
    hideSelector('div[ad-status]');
    hideSelector('div.gray_ad');
    hideSelector('.subject-banner');
    hideSelector('.extra');
  }

  function hideMacRumorsAds() {
    hideSelector('.adthrive-ad');
    hideSelector('[id^="AdThrive_"]');
    hideSelector('#taboola-skimlinks');
    hideSelector('.trc_related_container');
    hideSelector('.tbl-trecs-container');
    hideSelector('#tertiary:has(> .adthrive-ad)');
  }

  function hideGreasyForkAds() {
    hideSelector('.ad.ad-ga');
    hideSelector('.ad.ad-ea');
    hideSelector('#home-ad');
    hideSelector('#script-show-info-ad');
    hideSelector('.ad-content');
    hideSelector('ins.adsbygoogle');
    hideSelector('.ethical-ads');
    hideSelector('.ad-entry');
  }

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

  const processedShadows = new WeakSet();

  function injectIntoNewShadowRoots(root) {
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.shadowRoot || processedShadows.has(node.shadowRoot)) continue;
        processedShadows.add(node.shadowRoot);
        if (!node.shadowRoot.getElementById(STYLE_ID)) {
          const style = document.createElement('style');
          style.id = STYLE_ID;
          style.textContent = CSS;
          node.shadowRoot.appendChild(style);
        }
        injectIntoNewShadowRoots(node.shadowRoot);
      }
    } catch (_) { /* ignore */ }
  }

  function hostNeedsShadowWalk() {
    const host = location.hostname;
    return host.includes('bilibili.com') || host.includes('douban.com');
  }

  let applying = false;

  function hideVisibleAds() {
    if (document.hidden) return;
    applying = true;
    try {
      injectStyles();
      hidePageAds();
    } finally {
      applying = false;
    }
  }

  function sweepShadows() {
    if (document.hidden || !hostNeedsShadowWalk()) return;
    applying = true;
    try {
      injectIntoNewShadowRoots(document);
    } finally {
      applying = false;
    }
  }

  hideVisibleAds();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      hideVisibleAds();
      sweepShadows();
    });
  } else {
    sweepShadows();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      hideVisibleAds();
      sweepShadows();
    }
  });

  let mutationTimer = 0;
  const observer = new MutationObserver(() => {
    if (applying || document.hidden || mutationTimer) return;
    mutationTimer = setTimeout(() => {
      mutationTimer = 0;
      hideVisibleAds();
    }, 400);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  setInterval(() => {
    hideVisibleAds();
    sweepShadows();
  }, 4000);
})();

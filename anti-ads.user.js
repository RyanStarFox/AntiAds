// ==UserScript==
// @name         Anti-Ads — Block Bilibili & Douban Ads
// @namespace    https://github.com/RyanStarFox/AntiAds
// @version      1.2.0
// @description  Hide page ads and in-player ad UI on Bilibili and Douban
// @author       ryanstarfox
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
  `;

  function injectStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
    }
    // Keep stylesheet last so later site CSS cannot override with equal specificity
    const parent = document.head || document.documentElement;
    if (style.parentNode !== parent || parent.lastChild !== style) {
      parent.appendChild(style);
    }
  }

  function injectIntoShadowRoots(root) {
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.shadowRoot) {
          if (!node.shadowRoot.getElementById(STYLE_ID)) {
            const style = document.createElement('style');
            style.id = STYLE_ID;
            style.textContent = CSS;
            node.shadowRoot.appendChild(style);
          }
          injectIntoShadowRoots(node.shadowRoot);
        }
      }
    } catch (_) { /* ignore */ }
  }

  function hideSelector(sel) {
    try {
      document.querySelectorAll(sel).forEach(el => {
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

  function hidePageAds() {
    const host = location.hostname;
    if (host.includes('bilibili.com')) {
      hideBilibiliAds();
    } else if (host.includes('douban.com')) {
      hideDoubanAds();
    }
  }

  function periodicTasks() {
    injectStyles();
    // Hide ads before the expensive shadow walk so a walker error cannot skip hiding
    hidePageAds();
    injectIntoShadowRoots(document);
  }

  injectStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', periodicTasks);
  } else {
    periodicTasks();
  }

  let mutationTimer = 0;
  const observer = new MutationObserver(() => {
    if (mutationTimer) return;
    mutationTimer = setTimeout(() => {
      mutationTimer = 0;
      periodicTasks();
    }, 200);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  setInterval(periodicTasks, 2000);
})();

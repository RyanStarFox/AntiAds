// ==UserScript==
// @name         Anti-Ads — Block YouTube, Bilibili & Douban Ads
// @namespace    https://github.com/RyanStarFox/AntiAds
// @version      1.1.1
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

(function () {
  'use strict';

  const STYLE_ID = 'anti-ads-styles';

  const CSS = `
    /* ===== YouTube ===== */
    ytd-ad-slot-renderer,
    ytd-display-ad-renderer,
    ytd-promoted-sparkles-web-renderer,
    ytd-promoted-video-renderer,
    ytd-in-feed-ad-layout-renderer,
    ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
    ytd-rich-item-renderer:has(ytd-display-ad-renderer),
    ytd-rich-item-renderer:has(ytd-promoted-sparkles-web-renderer),
    ytd-compact-promoted-video-renderer,
    ytd-action-companion-ad-renderer,
    ytd-companion-slot-renderer,
    ytd-player-legacy-desktop-watch-ads-renderer,
    .ytd-ad-slot-renderer,
    .ytp-ad-overlay-container,
    .ytp-ad-overlay-slot,
    .ytp-ad-player-overlay,
    .ytp-ad-text-overlay,
    .ytp-ad-image-overlay,
    .ytp-ad-action-interstitial,
    .ytp-ad-survey {
      display: none !important;
    }

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

  function hideYouTubeAds() {
    hideSelector('ytd-ad-slot-renderer');
    hideSelector('ytd-display-ad-renderer');
    hideSelector('ytd-promoted-sparkles-web-renderer');
    hideSelector('ytd-promoted-video-renderer');
    hideSelector('ytd-in-feed-ad-layout-renderer');
    hideSelector('ytd-compact-promoted-video-renderer');
    hideSelector('ytd-action-companion-ad-renderer');
    hideSelector('ytd-companion-slot-renderer');
    hideSelector('ytd-player-legacy-desktop-watch-ads-renderer');
    hideSelector('.ytp-ad-overlay-container');
    hideSelector('.ytp-ad-overlay-slot');
    hideSelector('.ytp-ad-player-overlay');
    hideSelector('.ytp-ad-text-overlay');
    hideSelector('.ytp-ad-image-overlay');
    hideSelector('.ytp-ad-action-interstitial');
    hideSelector('.ytp-ad-survey');
  }

  function clickYouTubeAdControls() {
    const selectors = [
      'button.ytp-ad-skip-button',
      'button.ytp-ad-skip-button-modern',
      'button.ytp-skip-ad-button',
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern',
      '.ytp-skip-ad-button',
      'button.ytp-ad-overlay-close-button',
      '.ytp-ad-overlay-close-button',
      '.ytp-ad-close-button',
      '.ytp-ad-close-button-modern'
    ];
    for (const sel of selectors) {
      try {
        document.querySelectorAll(sel).forEach(el => {
          if (!el.disabled) el.click();
        });
      } catch (_) { /* ignore */ }
    }
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
    if (host.includes('youtube.com')) {
      hideYouTubeAds();
      clickYouTubeAdControls();
    } else if (host.includes('bilibili.com')) {
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

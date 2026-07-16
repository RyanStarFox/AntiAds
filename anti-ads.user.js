// ==UserScript==
// @name         Anti-Ads — Block YouTube & Bilibili Ads
// @namespace    https://github.com/RyanStarFox/AntiAds
// @version      1.0.0
// @description  Hide page ads and in-player ad UI on YouTube and Bilibili; auto-click YouTube skip buttons
// @author       ryanstarfox
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://search.bilibili.com/*
// @match        https://www.bilibili.com/*
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/bangumi/*
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
    .right-container .video-card-ad-small,
    .video-card-ad-small,
    .right-container .ad-report,
    .right-container .ad-report-inner,
    .right-container .right-bottom-banner,
    .right-container .ad-floor-exp,
    .right-container .ad-floor-cover,
    .right-container .slide-ad-exp,
    .bpx-player-adv-dm-wrap,
    .left-container .activity-m-v1,
    .activity-m-v1 {
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

  function injectIntoShadowRoots(root) {
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
    hideSelector('.right-container .video-card-ad-small');
    hideSelector('.video-card-ad-small');
    hideSelector('.right-container .ad-report');
    hideSelector('.right-container .ad-report-inner');
    hideSelector('.right-container .right-bottom-banner');
    hideSelector('.right-container .ad-floor-exp');
    hideSelector('.right-container .ad-floor-cover');
    hideSelector('.right-container .slide-ad-exp');
    hideSelector('.bpx-player-adv-dm-wrap');
    hideSelector('.left-container .activity-m-v1');
    hideSelector('.activity-m-v1');
  }

  function periodicTasks() {
    injectStyles();
    injectIntoShadowRoots(document);

    const host = location.hostname;
    if (host.includes('youtube.com')) {
      hideYouTubeAds();
      clickYouTubeAdControls();
    } else if (host.includes('bilibili.com')) {
      hideBilibiliAds();
    }
  }

  injectStyles();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', periodicTasks);
  } else {
    periodicTasks();
  }

  const observer = new MutationObserver(() => periodicTasks());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  setInterval(periodicTasks, 2000);
})();

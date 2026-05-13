/**
 * Nyxora — security.js
 * Handles the "Hidden Portal" Easter Egg.
 * Clicking the logo (#secret-trigger) 5 times reveals the secret section.
 * Also provides bot-detection heuristics to keep the portal hidden.
 */

(function () {
    'use strict';

    'use strict';

    // ---- Configuration ----
    const CLICK_THRESHOLD = 5;         // number of clicks required
    const RESET_TIMEOUT   = 3000;      // ms — if clicks are too slow, counter resets
    const SECRET_VIEW_ID  = 'view-secret';

    // ---- State ----
    let clickCount   = 0;
    let resetTimer   = null;
    let isUnlocked   = false;

    // ---- DOM references (cached on first interaction) ----
    let triggerEl    = null;
    let secretView   = null;

    /**
     * Retrieve DOM references.
     */
    function getDOMElements() {
        if (!triggerEl) {
            triggerEl = document.getElementById('secret-trigger');
        }
        if (!secretView) {
            secretView = document.getElementById(SECRET_VIEW_ID);
        }
    }

    /**
     * ---- Bot / Scraper Detection ----
     * If the user agent or behavior suggests a bot, we NEVER unlock.
     * This keeps the hidden section invisible to crawlers.
     */
    function isLikelyBot() {
        // Check navigator flags that bots commonly lack or spoof
        const ua = (navigator.userAgent || '').toLowerCase();
        const botPatterns = [
            'bot', 'crawl', 'spider', 'scrap', 'headless',
            'python-requests', 'curl', 'wget', 'go-http-client',
            'phantomjs', 'puppeteer', 'selenium', 'playwright',
        ];

        for (const pattern of botPatterns) {
            if (ua.includes(pattern)) return true;
        }

        // No webdriver property? some bots lack it entirely — we check as extra heuristic
        if (navigator.webdriver === true) return true;

        // Check if basic DOM APIs are absent (some lightweight scrapers)
        if (typeof document?.getElementById !== 'function') return true;

        return false;
    }

    /**
     * ---- Unlock the Hidden Portal ----
     * Removes aria-hidden, allows the router to navigate to it.
     */
    function unlockPortal() {
        if (isUnlocked) return;  // already unlocked

        getDOMElements();

        if (!secretView) {
            console.warn('[Security] Secret view element not found.');
            return;
        }

        // Remove the hidden attribute so the router can show it
        secretView.setAttribute('aria-hidden', 'false');

        // Also remove from CSS display:none override by adding a data attribute
        // (main.css already targets [aria-hidden="true"] — this flips it)

        isUnlocked = true;

        console.log('[Security] 🗝 Hidden Portal UNLOCKED. Navigate to #secret to enter.');

        // Optionally auto-navigate — but let user click nav manually or we can inform
        // We'll dispatch a custom event for other modules
        window.dispatchEvent(new CustomEvent('nyxora-portal-unlocked', {
            detail: { timestamp: Date.now() },
        }));

        // Add a visual indicator (subtle) that something changed
        if (triggerEl) {
            triggerEl.style.transform = 'scale(1)';
            // Brief red glow
            triggerEl.style.transition = 'filter 0.5s';
            triggerEl.style.filter = 'drop-shadow(0 0 8px #FF0000)';
            setTimeout(() => {
                if (triggerEl) triggerEl.style.filter = '';
            }, 1500);
        }
    }

    /**
     * ---- Click Handler ----
     * Increments counter. Resets after RESET_TIMEOUT of inactivity.
     */
    function handleTriggerClick(e) {
        // Prevent default if it's an anchor
        if (e) e.preventDefault();

        // Never unlock for bots
        if (isLikelyBot()) {
            // Silently ignore — bots see nothing
            return;
        }

        clickCount++;

        // Reset timer on each click
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            clickCount = 0;
            debugLog('[Security] Click counter reset (timeout).');
        }, RESET_TIMEOUT);

        debugLog(`[Security] Logo click #${clickCount}/${CLICK_THRESHOLD}`);

        // Visual feedback for each click
        if (triggerEl) {
            triggerEl.style.transform = 'scale(0.92)';
            setTimeout(() => {
                if (triggerEl) triggerEl.style.transform = 'scale(1)';
            }, 100);
        }

        // Threshold reached?
        if (clickCount >= CLICK_THRESHOLD) {
            unlockPortal();
            clickCount = 0;  // reset
            if (resetTimer) clearTimeout(resetTimer);
        }
    }

    /**
     * Debug log — hidden behind a flag to avoid console noise in production.
     */
    const DEBUG = false;  // toggle for dev
    function debugLog(...args) {
        if (DEBUG) console.log(...args);
    }

    /**
     * ---- Expose programmatic unlock (for testing / other modules) ----
     * Not easily guessable — requires knowing the internal function name.
     */
    window.__nyxora_gate = {
        forceUnlock: unlockPortal,
        isUnlocked: () => isUnlocked,
    };

    /**
     * ---- Initialize ----
     */
    function init() {
        getDOMElements();

        if (!triggerEl) {
            console.warn('[Security] #secret-trigger not found. Hidden portal disabled.');
            return;
        }

        // Attach click listener
        triggerEl.addEventListener('click', handleTriggerClick);

        // Ensure secret view starts hidden from bots and users
        if (secretView) {
            secretView.setAttribute('aria-hidden', 'true');
            // Ensure it's not accidentally shown via CSS
            secretView.style.display = 'none';
            // Override when active-view class is applied (router checks aria-hidden first)
        }

        // Listen for router attempting to show secret view before unlock
        window.addEventListener('nyxora-route-change', function (e) {
            if (e.detail.view === SECRET_VIEW_ID && !isUnlocked) {
                // Router already handles this via aria-hidden check, but double-bolt
                console.warn('[Security] Blocked navigation to locked portal.');
            }
        });

        // If bot detected, we could also strip the trigger entirely
        if (isLikelyBot()) {
            if (triggerEl) {
                // Remove click capability completely
                triggerEl.style.pointerEvents = 'none';
                triggerEl.removeAttribute('role');
                triggerEl.removeAttribute('tabindex');
            }
            console.log('[Security] Bot detected — portal permanently sealed.');
        }

        console.log('[Security] Initialized. Portal sealed. Click logo', CLICK_THRESHOLD, 'times to unlock.');
    }

    // Boot on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

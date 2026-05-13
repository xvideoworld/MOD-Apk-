/**
 * Nyxora — router.js
 * SPA hash-based router. Switches views without page reload.
 * Listens for hashchange + intercepts nav clicks.
 */

(function () {
    'use strict';

    // ---- Route map: hash → view ID ----
    const ROUTES = {
        '#home':  'view-home',
        '#movies': 'view-movies',
        '#reels':  'view-reels',
        '#apps':   'view-apps',
        '#secret': 'view-secret',   // hidden — only activated via security.js
    };

    const DEFAULT_ROUTE = '#home';

    // Cached DOM references
    let currentView = null;
    const viewCache = new Map();
    const navItems   = document.querySelectorAll('.nav-item');
    const allViews   = document.querySelectorAll('.view');

    // Pre-populate view cache
    allViews.forEach(view => {
        viewCache.set(view.id, view);
    });

    /**
     * Show the view matching a given hash, hide all others.
     * @param {string} hash — e.g. '#movies'
     */
    function navigate(hash) {
        // Normalize: if empty or unknown, go home
        const route = ROUTES[hash] || ROUTES[DEFAULT_ROUTE];
        const targetId = route;

        // Guard: if secret view but hidden attribute still set, block
        if (targetId === 'view-secret') {
            const secretEl = viewCache.get('view-secret');
            if (secretEl && secretEl.getAttribute('aria-hidden') === 'true') {
                // Not unlocked — redirect to home
                window.location.hash = DEFAULT_ROUTE;
                return;
            }
        }

        // Hide all views
        allViews.forEach(view => {
            view.classList.remove('active-view');
        });

        // Show target
        const target = viewCache.get(targetId);
        if (target) {
            target.classList.add('active-view');
            currentView = targetId;
        } else {
            // Fallback to home
            const home = viewCache.get(ROUTES[DEFAULT_ROUTE]);
            if (home) home.classList.add('active-view');
            currentView = ROUTES[DEFAULT_ROUTE];
        }

        // Update nav active state
        navItems.forEach(item => {
            const routeAttr = item.getAttribute('data-route');
            const isActive = routeAttr && targetId === `view-${routeAttr}`;
            item.classList.toggle('active', !!isActive);
        });

        // Dispatch custom event so other modules can react
        window.dispatchEvent(new CustomEvent('nyxora-route-change', {
            detail: { view: targetId, hash: hash }
        }));
    }

    /**
     * Initialize router — bind hashchange and nav clicks.
     */
    function init() {
        // Listen for hash changes
        window.addEventListener('hashchange', function (e) {
            navigate(window.location.hash);
        });

        // Intercept nav-item clicks to ensure correct hash set
        navItems.forEach(item => {
            item.addEventListener('click', function (e) {
                const route = this.getAttribute('data-route');
                if (route) {
                    window.location.hash = '#' + route;
                    e.preventDefault();
                }
            });
        });

        // Handle direct URL entry / initial load
        if (!window.location.hash || !ROUTES[window.location.hash]) {
            window.location.hash = DEFAULT_ROUTE;
        } else {
            navigate(window.location.hash);
        }

        console.log('[Nyxora Router] Initialized — default route:', DEFAULT_ROUTE);
    }

    // Public API
    window.NyxoraRouter = {
        init,
        navigate,
        getCurrentView: () => currentView,
    };

    // Auto-init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

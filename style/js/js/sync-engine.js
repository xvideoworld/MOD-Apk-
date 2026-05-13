/**
 * Nyxora — sync-engine.js
 * Centralized data-fetching engine.
 * Uses async/await with placeholder comments for later API insertion.
 * Designed for TMDB (movies), YouTube IFrame (reels), F-Droid (apps).
 */

(function () {
    'use strict';

    /**
     * ----- CONFIGURATION -----
     * TODO: Insert your real API keys / endpoints below.
     */
    const CONFIG = {
        // TMDB (The Movie Database)
        tmdb: {
            baseUrl: 'https://api.themoviedb.org/3',
            // TODO: Insert your TMDB API Read Access Token (v4 auth) or API key (v3)
            // Example: apiKey: 'your_tmdb_api_key_here',
            apiKey: null,
            imageBase: 'https://image.tmdb.org/t/p/w342',
        },
        // YouTube (for Reels / Shorts)
        youtube: {
            // TODO: Insert your YouTube Data API v3 key
            apiKey: null,
            // TODO: Set your playlist ID for curated reels
            reelPlaylistId: null,
        },
        // F-Droid / APK repository
        fdroid: {
            // TODO: Insert F-Droid repo URL or custom APK endpoint
            repoUrl: null,
        },
    };

    /**
     * ----- GENERIC FETCH WRAPPER -----
     * Handles errors gracefully, returns null on failure.
     */
    async function fetchJSON(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    ...options.headers,
                },
                ...options,
            });
            if (!response.ok) {
                console.warn(`[SyncEngine] HTTP ${response.status} for ${url}`);
                return null;
            }
            return await response.json();
        } catch (err) {
            console.error('[SyncEngine] Fetch error:', err.message);
            return null;
        }
    }

    /**
     * ============================================================
     *  MOVIES — TMDB
     * ============================================================
     */

    /**
     * Fetch trending movies from TMDB.
     * TODO: Ensure CONFIG.tmdb.apiKey is set.
     * @param {string} timeWindow — 'day' or 'week'
     * @returns {Promise<Array>} Array of movie objects (or empty)
     */
    async function fetchTrendingMovies(timeWindow = 'day') {
        if (!CONFIG.tmdb.apiKey) {
            console.warn('[SyncEngine] TMDB API key not configured. Returning placeholder.');
            return getMoviePlaceholders();
        }

        // TODO: Uncomment when API key is ready
        // const url = `${CONFIG.tmdb.baseUrl}/trending/movie/${timeWindow}?api_key=${CONFIG.tmdb.apiKey}`;
        // const data = await fetchJSON(url);
        // if (data && data.results) return data.results;
        // return [];

        return getMoviePlaceholders();
    }

    /**
     * Search movies by query.
     * TODO: Same API key dependency.
     * @param {string} query
     * @returns {Promise<Array>}
     */
    async function searchMovies(query) {
        if (!CONFIG.tmdb.apiKey || !query) return [];

        // TODO: Uncomment
        // const url = `${CONFIG.tmdb.baseUrl}/search/movie?api_key=${CONFIG.tmdb.apiKey}&query=${encodeURIComponent(query)}`;
        // const data = await fetchJSON(url);
        // if (data && data.results) return data.results;
        // return [];

        return getMoviePlaceholders();
    }

    /**
     * Get full movie details (including videos/trailers).
     * @param {number} movieId
     * @returns {Promise<Object|null>}
     */
    async function getMovieDetails(movieId) {
        if (!CONFIG.tmdb.apiKey || !movieId) return null;

        // TODO: Uncomment
        // const url = `${CONFIG.tmdb.baseUrl}/movie/${movieId}?api_key=${CONFIG.tmdb.apiKey}&append_to_response=videos,credits`;
        // return await fetchJSON(url);

        return null;
    }

    /**
     * Placeholder movie data for development / offline mode.
     */
    function getMoviePlaceholders() {
        return [
            { id: 1, title: 'Blade Runner 2049',       vote_average: 8.0, poster_path: null, release_date: '2017' },
            { id: 2, title: 'Dune: Part Two',           vote_average: 8.8, poster_path: null, release_date: '2024' },
            { id: 3, title: 'The Dark Knight',          vote_average: 9.0, poster_path: null, release_date: '2008' },
            { id: 4, title: 'Mad Max: Fury Road',       vote_average: 8.1, poster_path: null, release_date: '2015' },
            { id: 5, title: 'Interstellar',             vote_average: 8.7, poster_path: null, release_date: '2014' },
            { id: 6, title: 'Sicario',                  vote_average: 7.7, poster_path: null, release_date: '2015' },
            { id: 7, title: 'John Wick: Chapter 4',     vote_average: 7.8, poster_path: null, release_date: '2023' },
            { id: 8, title: 'Everything Everywhere All…', vote_average: 7.8, poster_path: null, release_date: '2022' },
        ];
    }

    /**
     * ============================================================
     *  REELS — YouTube Shorts / Playlist
     * ============================================================
     */

    /**
     * Initialize YouTube IFrame Player for reels.
     * TODO: Set CONFIG.youtube.reelPlaylistId and apiKey.
     * @param {string} containerId — DOM element ID for the player
     */
    function initReelPlayer(containerId = 'reels-player') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('[SyncEngine] Reel container not found:', containerId);
            return;
        }

        // TODO: When you have a playlist ID, uncomment and use the YouTube IFrame API:
        //
        // if (typeof YT !== 'undefined' && YT.Player) {
        //     new YT.Player(containerId, {
        //         height: '100%',
        //         width: '100%',
        //         playerVars: {
        //             list: CONFIG.youtube.reelPlaylistId,
        //             listType: 'playlist',
        //             autoplay: 1,
        //             loop: 1,
        //             controls: 1,
        //             rel: 0,
        //             modestbranding: 1,
        //         },
        //     });
        // } else {
        //     // Fallback: load IFrame API then retry
        //     loadYouTubeAPI(() => initReelPlayer(containerId));
        // }

        // Placeholder: show message
        container.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;
                        background:#050505;color:rgba(255,255,255,0.4);font-size:0.9rem;
                        text-align:center;padding:20px;">
                <div>
                    <div style="font-size:2rem;margin-bottom:8px;">🎬</div>
                    <div>Reels Player</div>
                    <div style="font-size:0.75rem;color:rgba(255,0,0,0.4);margin-top:4px;">
                        [ Connect YouTube API in sync-engine.js ]
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Dynamically load YouTube IFrame API if not present.
     * @param {Function} callback
     */
    function loadYouTubeAPI(callback) {
        if (window.YT && window.YT.Player) {
            callback();
            return;
        }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.onload = () => {
            // YT API calls onYouTubeIframeAPIReady when ready
            window.onYouTubeIframeAPIReady = callback;
        };
        document.head.appendChild(tag);
    }

    /**
     * ============================================================
     *  APPS — F-Droid / APK Repository
     * ============================================================
     */

    /**
     * Fetch available apps from F-Droid or custom APK repo.
     * TODO: Set CONFIG.fdroid.repoUrl and implement actual fetching.
     * @returns {Promise<Array>}
     */
    async function fetchApps() {
        if (CONFIG.fdroid.repoUrl) {
            // TODO: Implement F-Droid API fetch
            // const url = `${CONFIG.fdroid.repoUrl}/api/v1/packages`;
            // const data = await fetchJSON(url);
            // if (data && data.packages) return data.packages;
        }
        return getAppPlaceholders();
    }

    /**
     * Placeholder apps for development.
     */
    function getAppPlaceholders() {
        return [
            { id: 'a1', name: 'NewPipe',       summary: 'YouTube without ads',       icon: null },
            { id: 'a2', name: 'KeePassDX',      summary: 'Password manager',          icon: null },
            { id: 'a3', name: 'Fennec Browser', summary: 'Firefox-based browser',     icon: null },
            { id: 'a4', name: 'Organic Maps',   summary: 'Offline navigation',        icon: null },
            { id: 'a5', name: 'Termux',         summary: 'Terminal emulator',         icon: null },
            { id: 'a6', name: 'VLC for Android',summary: 'Video player',             icon: null },
        ];
    }

    /**
     * ============================================================
     *  RENDER HELPERS
     * ============================================================
     */

    /**
     * Render movie cards into a grid container.
     * @param {Array} movies
     * @param {string} containerId
     */
    function renderMovies(movies, containerId = 'movies-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!movies || movies.length === 0) {
            container.innerHTML = `<p style="color:rgba(255,255,255,0.4);">No movies found.</p>`;
            return;
        }

        container.innerHTML = movies.map(m => {
            const imgSrc = m.poster_path
                ? `${CONFIG.tmdb.imageBase}${m.poster_path}`
                : `data:image/svg+xml,${encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
                        <rect fill="#1a1a1a" width="200" height="300"/>
                        <text fill="#FF0000" font-size="14" font-family="monospace" x="50%" y="50%" text-anchor="middle" dy=".3em">${m.title}</text>
                    </svg>`
                  )}`;

            return `
                <div class="movie-card" data-id="${m.id}" data-type="movie">
                    <img src="${imgSrc}" alt="${m.title}" loading="lazy" />
                    <div class="card-info">
                        <div class="card-title">${m.title}</div>
                        <div class="card-sub">${m.release_date || ''} · ⭐ ${(m.vote_average || '').toString().slice(0, 3)}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Lazy-load observer for images
        observeLazyImages(container);
    }

    /**
     * Render app cards into a grid container.
     * @param {Array} apps
     * @param {string} containerId
     */
    function renderApps(apps, containerId = 'apps-grid') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!apps || apps.length === 0) {
            container.innerHTML = `<p style="color:rgba(255,255,255,0.4);">No apps available.</p>`;
            return;
        }

        container.innerHTML = apps.map(a => {
            return `
                <div class="app-card" data-id="${a.id}" data-type="app">
                    <div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;
                                background:rgba(255,0,0,0.05);font-size:2.5rem;">
                        📦
                    </div>
                    <div class="card-info">
                        <div class="card-title">${a.name}</div>
                        <div class="card-sub">${a.summary || 'Android App'}</div>
                    </div>
                </div>
            `;
        }).join('');

        observeLazyImages(container);
    }

    /**
     * Intersection Observer for lazy-loading images.
     * @param {HTMLElement} parent
     */
    function observeLazyImages(parent) {
        const images = parent.querySelectorAll('img[loading="lazy"]');
        if (!images.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // If using data-src pattern in future, swap here
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '100px' });

        images.forEach(img => observer.observe(img));
    }

    /**
     * ============================================================
     *  BOOT — called on route change or manual trigger
     * ============================================================
     */

    /**
     * Load initial data for the current view.
     * Called by router on navigation.
     */
    async function loadDataForView(viewId) {
        switch (viewId) {
            case 'view-home':
                // Home aggregates a bit of everything
                const trendingMovies = await fetchTrendingMovies('day');
                renderMovies(trendingMovies.slice(0, 6), 'home-feed');
                break;

            case 'view-movies':
                const movies = await fetchTrendingMovies('week');
                renderMovies(movies, 'movies-grid');
                break;

            case 'view-reels':
                initReelPlayer('reels-player');
                break;

            case 'view-apps':
                const apps = await fetchApps();
                renderApps(apps, 'apps-grid');
                break;

            case 'view-secret':
                // Secret view — populated by security.js
                break;

            default:
                break;
        }
    }

    /**
     * Initialize the sync engine.
     */
    function init() {
        // Listen for route changes from router.js
        window.addEventListener('nyxora-route-change', function (e) {
            loadDataForView(e.detail.view);
        });

        // Also load for initial view if router already fired
        const initialHash = window.location.hash || '#home';
        const initialView = initialHash.replace('#', 'view-');
        if (initialView) {
            // Small delay to let router finish
            setTimeout(() => loadDataForView(initialView), 50);
        }

        console.log('[Nyxora SyncEngine] Initialized — API endpoints ready for connection.');
    }

    // --- Public API ---
    window.NyxoraSync = {
        init,
        loadDataForView,
        fetchTrendingMovies,
        searchMovies,
        getMovieDetails,
        fetchApps,
        renderMovies,
        renderApps,
        initReelPlayer,
        CONFIG,
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

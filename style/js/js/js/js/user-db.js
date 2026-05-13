/**
 * Nyxora — user-db.js
 * LocalStorage-based persistence for user watch history and download records.
 * All data is stored in the user's browser — no server needed.
 * Optimized for 4GB RAM devices (lightweight serialization).
 */

(function () {
    'use strict';

    // ---- Storage keys ----
    const STORAGE_KEYS = {
        WATCH_HISTORY: 'nyxora_watch_history',
        DOWNLOADS:     'nyxora_downloads',
        PREFERENCES:   'nyxora_preferences',
        BOOKMARKS:     'nyxora_bookmarks',
    };

    // ---- Limits to prevent bloat ----
    const MAX_HISTORY_ITEMS = 200;
    const MAX_DOWNLOADS     = 100;
    const MAX_BOOKMARKS     = 50;

    /**
     * Safely read from localStorage with error handling.
     * @param {string} key
     * @returns {*} Parsed value or default (null/array)
     */
    function read(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch (e) {
            console.warn('[UserDB] Read error for', key, e.message);
            return fallback;
        }
    }

    /**
     * Safely write to localStorage.
     * @param {string} key
     * @param {*} value
     * @returns {boolean} success
     */
    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            // Likely QuotaExceededError — clean up oldest entries
            console.warn('[UserDB] Write error (quota?) for', key, e.message);
            return false;
        }
    }

    /**
     * Remove a key from localStorage.
     */
    function remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) { /* silent */ }
    }

    /**
     * ============================================================
     *  WATCH HISTORY
     * ============================================================
     */

    /**
     * Get all watch history entries (newest first).
     * @returns {Array}
     */
    function getWatchHistory() {
        const history = read(STORAGE_KEYS.WATCH_HISTORY, []);
        return Array.isArray(history) ? history : [];
    }

    /**
     * Add an item to watch history.
     * @param {Object} item — { id, title, type: 'movie'|'reel', timestamp, thumbnail? }
     */
    function addToHistory(item) {
        if (!item || !item.id) return false;

        let history = getWatchHistory();

        // Remove duplicate if exists (same id + type)
        history = history.filter(
            h => !(h.id === item.id && h.type === (item.type || 'movie'))
        );

        // Add to front
        history.unshift({
            id: item.id,
            title: item.title || 'Unknown',
            type: item.type || 'movie',
            timestamp: item.timestamp || Date.now(),
            thumbnail: item.thumbnail || null,
        });

        // Trim to max
        if (history.length > MAX_HISTORY_ITEMS) {
            history = history.slice(0, MAX_HISTORY_ITEMS);
        }

        return write(STORAGE_KEYS.WATCH_HISTORY, history);
    }

    /**
     * Clear entire watch history.
     */
    function clearHistory() {
        remove(STORAGE_KEYS.WATCH_HISTORY);
    }

    /**
     * ============================================================
     *  DOWNLOADS (APK files or saved content)
     * ============================================================
     */

    /**
     * Get all download records.
     * @returns {Array}
     */
    function getDownloads() {
        const downloads = read(STORAGE_KEYS.DOWNLOADS, []);
        return Array.isArray(downloads) ? downloads : [];
    }

    /**
     * Add a download record.
     * @param {Object} item — { id, name, type: 'apk'|'video', url?, timestamp, size? }
     */
    function addDownload(item) {
        if (!item || !item.id) return false;

        let downloads = getDownloads();

        // Remove duplicate
        downloads = downloads.filter(d => !(d.id === item.id && d.type === (item.type || 'apk')));

        downloads.unshift({
            id: item.id,
            name: item.name || 'Unknown',
            type: item.type || 'apk',
            url: item.url || null,
            timestamp: item.timestamp || Date.now(),
            size: item.size || null,
        });

        if (downloads.length > MAX_DOWNLOADS) {
            downloads = downloads.slice(0, MAX_DOWNLOADS);
        }

        return write(STORAGE_KEYS.DOWNLOADS, downloads);
    }

    /**
     * Remove a download record by id.
     */
    function removeDownload(id) {
        if (!id) return false;
        let downloads = getDownloads();
        const filtered = downloads.filter(d => d.id !== id);
        if (filtered.length === downloads.length) return false;
        return write(STORAGE_KEYS.DOWNLOADS, filtered);
    }

    /**
     * ============================================================
     *  BOOKMARKS (favorited movies/apps)
     * ============================================================
     */

    /**
     * Get all bookmarks.
     */
    function getBookmarks() {
        const bookmarks = read(STORAGE_KEYS.BOOKMARKS, []);
        return Array.isArray(bookmarks) ? bookmarks : [];
    }

    /**
     * Toggle bookmark for an item.
     * @param {Object} item
     * @returns {boolean} true if now bookmarked, false if removed
     */
    function toggleBookmark(item) {
        if (!item || !item.id) return false;

        let bookmarks = getBookmarks();
        const exists = bookmarks.some(b => b.id === item.id && b.type === (item.type || 'movie'));

        if (exists) {
            bookmarks = bookmarks.filter(b => !(b.id === item.id && b.type === (item.type || 'movie')));
            write(STORAGE_KEYS.BOOKMARKS, bookmarks);
            return false; // removed
        } else {
            bookmarks.unshift({
                id: item.id,
                title: item.title || 'Unknown',
                type: item.type || 'movie',
                timestamp: Date.now(),
                thumbnail: item.thumbnail || null,
            });
            if (bookmarks.length > MAX_BOOKMARKS) {
                bookmarks = bookmarks.slice(0, MAX_BOOKMARKS);
            }
            write(STORAGE_KEYS.BOOKMARKS, bookmarks);
            return true; // added
        }
    }

    /**
     * Check if an item is bookmarked.
     */
    function isBookmarked(id, type = 'movie') {
        if (!id) return false;
        const bookmarks = getBookmarks();
        return bookmarks.some(b => b.id === id && b.type === type);
    }

    /**
     * ============================================================
     *  PREFERENCES
     * ============================================================
     */

    /**
     * Get a user preference value.
     * @param {string} key
     * @param {*} fallback
     */
    function getPreference(key, fallback = null) {
        if (!key) return fallback;
        const prefs = read(STORAGE_KEYS.PREFERENCES, {});
        return prefs[key] !== undefined ? prefs[key] : fallback;
    }

    /**
     * Set a user preference.
     */
    function setPreference(key, value) {
        if (!key) return false;
        const prefs = read(STORAGE_KEYS.PREFERENCES, {});
        prefs[key] = value;
        return write(STORAGE_KEYS.PREFERENCES, prefs);
    }

    /**
     * ============================================================
     *  UTILITY
     * ============================================================
     */

    /**
     * Get total localStorage usage estimate (in bytes).
     */
    function getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // UTF-16
            }
        }
        return total;
    }

    /**
     * Wipe all Nyxora data from localStorage.
     */
    function wipeAll() {
        Object.values(STORAGE_KEYS).forEach(key => remove(key));
    }

    // ---- Public API ----
    window.NyxoraDB = {
        // History
        getWatchHistory,
        addToHistory,
        clearHistory,

        // Downloads
        getDownloads,
        addDownload,
        removeDownload,

        // Bookmarks
        getBookmarks,
        toggleBookmark,
        isBookmarked,

        // Preferences
        getPreference,
        setPreference,

        // Utility
        getStorageUsage,
        wipeAll,
    };

    console.log('[NyxoraDB] Initialized — localStorage backend ready.');
})();

/**
 * Plugin: Decode S3 paths from base64 fileuri parameters
 *
 * When using cloud storage (S3, GCS, Azure), Label Studio generates resolve URLs
 * with base64-encoded file paths. This plugin decodes those paths to show
 * human-readable S3/GCS/Azure paths in Text tags.
 *
 * Example:
 *   Before: /tasks/123/resolve/?fileuri=czM6Ly9idWNrZXQvcGF0aC9maWxlLmpwZw==
 *   After:  s3://bucket/path/file.jpg
 */
(() => {
  // Cache for already processed elements (avoid re-processing)
  const processedElements = new WeakSet();

  // Debounce timer
  let debounceTimer = null;

  /**
   * Decode base64 fileuri to S3/GCS/Azure path
   * @param {string} text - Text containing fileuri parameter
   * @returns {string|null} - Decoded path or null
   */
  function decodeBase64Path(text) {
    const match = text.match(/fileuri=([A-Za-z0-9+/=_-]+)/);
    if (!match) return null;

    try {
      // Handle URL-safe base64 variants (replace - with + and _ with /)
      const b64 = match[1].replace(/-/g, "+").replace(/_/g, "/");
      return atob(b64);
    } catch (e) {
      console.warn("[S3 Path Decoder] Failed to decode:", e.message);
      return null;
    }
  }

  /**
   * Process text nodes and replace encoded paths with decoded ones
   */
  function processTextNodes() {
    // Target elements likely containing path text
    const candidates = document.querySelectorAll('[class*="text"], [class*="Text"], span, p, div');

    for (const el of candidates) {
      // Skip already processed elements
      if (processedElements.has(el)) continue;

      // Only process leaf text nodes (elements with single text child)
      if (el.childNodes.length !== 1 || el.childNodes[0].nodeType !== 3) continue;

      const text = el.textContent;
      if (!text || !text.includes("/resolve/?fileuri=")) continue;

      const decoded = decodeBase64Path(text);
      if (decoded) {
        el.textContent = text.replace(/\/tasks\/\d+\/resolve\/\?fileuri=[A-Za-z0-9+/=_-]+/, decoded);
        processedElements.add(el);
      }
    }
  }

  /**
   * Debounced processing to avoid excessive DOM operations
   */
  function debouncedProcess() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processTextNodes, 150);
  }

  /**
   * Initialize the plugin
   */
  function init() {
    // Initial processing with staggered retries for dynamic content
    processTextNodes();
    setTimeout(processTextNodes, 500);
    setTimeout(processTextNodes, 1500);

    // Watch for dynamic content changes (task navigation, etc.)
    const observer = new MutationObserver(debouncedProcess);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    });
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/**
 * "Countdown Timer" — Universal Label Studio Plugin
 *
 * Shows a progress bar in the labeling interface. When the countdown
 * reaches zero, behaviour depends on DISABLE_SUBMIT:
 *   true  → blocks submit via LSI.on("beforeSaveAnnotation") + overlay
 *   false → shows a red "TIME EXCEEDED" warning in the bar (submit still works)
 *
 * Timer state persists in localStorage per project+task so refreshing
 * the page or navigating away does not lose progress. Timer only ticks
 * while the user is actively on the task page.
 *
 * In label-stream mode the plugin detects task changes via LSI.task.id
 * and resets automatically.
 *
 * Mount strategy (universal — works with any labeling config)
 * -----------------------------------------------------------
 *   1. MIG pagination row (next to "1 of N" and copy-prev button)
 *   2. Annotation panel content area (left column, above image/controls)
 *   3. Fallback: top of document body
 *
 * Configuration
 * -------------
 *   DURATION_SEC    — total time in seconds (default 300 = 5 min)
 *   DISABLE_SUBMIT  — true: block submit when expired; false: warning only
 *
 * Persistence
 * -----------
 * localStorage key: cdt_{projectId}_{taskId}
 * Value: remaining seconds (integer).
 *
 * Installation
 * ------------
 * Enterprise: Project → Settings → Plugins → paste this script.
 */

async function initCountdownTimer() {
    await LSI;
  
    // ── Configuration ──────────────────────────────────────────────────────────
    var DURATION_SEC = 300;
    var DISABLE_SUBMIT = false;
  
    // ── Cleanup previous instance ──────────────────────────────────────────────
    if (window.__cdtInterval) clearInterval(window.__cdtInterval);
    if (window.__cdtTaskPoll) clearInterval(window.__cdtTaskPoll);
    if (window.__cdtInjectTimer) clearTimeout(window.__cdtInjectTimer);
    if (window.__cdtBar) { window.__cdtBar.remove(); window.__cdtBar = null; }
    if (window.__cdtOverlay) { window.__cdtOverlay.remove(); window.__cdtOverlay = null; }
  
    // ── Resolve current project & task IDs ─────────────────────────────────────
    function getProjectId() {
      var m = window.location.pathname.match(/projects\/(\d+)/);
      return m ? m[1] : "unknown";
    }
  
    function getTaskId() {
      // LSI.task.id is the most reliable source (works in label stream)
      if (LSI.task && LSI.task.id) return String(LSI.task.id);
      var params = new URLSearchParams(window.location.search);
      return params.get("task") || "unknown";
    }
  
    var projectId = getProjectId();
    var taskId = getTaskId();
    var storageKey = "cdt_" + projectId + "_" + taskId;
  
    // ── Restore or create remaining seconds ────────────────────────────────────
    var saved = localStorage.getItem(storageKey);
    var remaining = (saved !== null) ? Math.max(0, parseInt(saved, 10)) : DURATION_SEC;
    var BAR_ID = "cdt-timer-bar";
  
    // ── Progress bar DOM ───────────────────────────────────────────────────────
    var bar = document.createElement("div");
    bar.id = BAR_ID;
    bar.style.cssText =
      "position:relative;flex:1 1 auto;min-width:120px;height:26px;min-height:26px;" +
      "background:#e0e0e0;font-family:system-ui,sans-serif;border-radius:4px;" +
      "margin:0 8px;cursor:default;display:flex;align-items:center;justify-content:center;";
  
    var fill = document.createElement("div");
    fill.style.cssText =
      "position:absolute;left:0;top:0;height:100%;width:100%;" +
      "transition:width 1s linear,background .6s;" +
      "background:#43a047;border-radius:4px;";
  
    var label = document.createElement("span");
    label.style.cssText =
      "position:relative;z-index:1;font-size:12px;font-weight:700;" +
      "color:#fff;pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.4);";
  
    bar.appendChild(fill);
    bar.appendChild(label);
    window.__cdtBar = bar;
  
    // ── Inject bar — universal mount chain ───────────────────────────────────
    // Mounts INSIDE the annotation panel (left column), not across the full
    // page width. Tries anchors in order:
    //   1. MIG pagination row (before copy-prev btn or after pagination)
    //   2. Annotation panel content area (prepended as first child)
    //   3. Fallback: top of document body
    function injectBar() {
      var old = document.getElementById(BAR_ID);
      if (old && old !== bar) old.remove();
  
      // 1. MIG pagination row — insert before copy-prev button or after pagination
      var copyBtn = document.getElementById("cpf-copy-btn");
      if (copyBtn) { copyBtn.before(bar); return; }
  
      var pagination = document.querySelector(".lsf-pagination");
      if (pagination && pagination.parentElement) {
        pagination.parentElement.appendChild(bar);
        return;
      }
  
      // 2. Annotation panel — the left column that holds image + controls.
      //    These selectors target the annotation area only (not the side panel).
      var selectors = [
        ".lsf-main-view__annotation",
        "[class*='main-view__annotation']",
        ".lsf-main-content__task",
        "[class*='content__task']",
        ".lsf-panel__content",
      ];
      for (var i = 0; i < selectors.length; i++) {
        var panel = document.querySelector(selectors[i]);
        if (panel) {
          bar.style.flex = "none";
          bar.style.width = "100%";
          panel.insertBefore(bar, panel.firstChild);
          return;
        }
      }
  
      // 3. Last resort
      document.body.prepend(bar);
    }
  
    window.__cdtInjectTimer = setTimeout(injectBar, 600);
  
    // ── Helpers ────────────────────────────────────────────────────────────────
    function fmt(sec) {
      var m = Math.floor(sec / 60);
      var s = sec % 60;
      return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }
  
    function barColor(fraction) {
      if (fraction > 0.5) return "#43a047";
      if (fraction > 0.25) return "#fbc02d";
      if (fraction > 0.1) return "#f57c00";
      return "#d32f2f";
    }
  
    function updateTooltip() {
      if (remaining > 0) {
        var minLeft = Math.ceil(remaining / 60);
        bar.title = minLeft + " min remaining.\nThe Submit button will be blocked when time runs out.";
      } else {
        bar.title = "Time limit exceeded for this task.";
      }
    }
  
    // ── Submit blocking (only when DISABLE_SUBMIT = true) ──────────────────────
    var expired = remaining <= 0;
  
    if (DISABLE_SUBMIT) {
      LSI.on("beforeSaveAnnotation", function () {
        if (expired) {
          if (typeof Htx !== "undefined") {
            Htx.showModal("Time is up! You can no longer submit this task.", "error");
          }
          return false;
        }
        return true;
      });
    }
  
    // ── Task change detection (label stream) ───────────────────────────────────
    // Poll every 2s: if LSI.task.id changed, re-init the whole plugin.
    window.__cdtTaskPoll = setInterval(function () {
      var currentTaskId = getTaskId();
      if (currentTaskId !== taskId && currentTaskId !== "unknown") {
        console.log("[CountdownTimer] Task changed: " + taskId + " → " + currentTaskId + ". Re-initializing.");
        initCountdownTimer();
      }
    }, 2000);
  
    // ── Tick ────────────────────────────────────────────────────────────────────
    function tick() {
      remaining--;
      if (remaining < 0) remaining = 0;
      localStorage.setItem(storageKey, String(remaining));
  
      var fraction = remaining / DURATION_SEC;
      fill.style.width = (fraction * 100).toFixed(2) + "%";
      fill.style.background = barColor(fraction);
      label.textContent = fmt(remaining);
      updateTooltip();
  
      if (remaining <= 0 && !expired) {
        expired = true;
        clearInterval(window.__cdtInterval);
        window.__cdtInterval = null;
        onExpired();
      }
    }
  
    // ── Expired ────────────────────────────────────────────────────────────────
    function onExpired() {
      if (DISABLE_SUBMIT) {
        onExpiredBlocking();
      } else {
        onExpiredWarning();
      }
    }
  
    // Warning-only mode: red bar with exceeded message, submit still works
    function onExpiredWarning() {
      fill.style.width = "100%";
      fill.style.background = "#d32f2f";
      fill.style.transition = "none";
      label.textContent = "TIME EXCEEDED";
      label.style.fontSize = "11px";
      label.style.letterSpacing = "0.05em";
      bar.style.animation = "cdt-pulse 2s ease-in-out 3";
  
      var style = document.getElementById("cdt-pulse-style");
      if (!style) {
        style = document.createElement("style");
        style.id = "cdt-pulse-style";
        style.textContent = "@keyframes cdt-pulse{0%,100%{opacity:1}50%{opacity:.5}}";
        document.head.appendChild(style);
      }
  
      console.log("[CountdownTimer] Time exceeded — warning shown (submit NOT blocked).");
    }
  
    // Blocking mode: overlay + submit disabled
    function onExpiredBlocking() {
      bar.style.display = "none";
  
      var overlay = document.createElement("div");
      overlay.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;z-index:100000;" +
        "background:rgba(0,0,0,.55);display:flex;align-items:center;" +
        "justify-content:center;font-family:system-ui,sans-serif;";
  
      var box = document.createElement("div");
      box.style.cssText =
        "background:#fff;border-radius:12px;padding:32px 48px;text-align:center;" +
        "box-shadow:0 8px 32px rgba(0,0,0,.3);max-width:420px;";
  
      var icon = document.createElement("div");
      icon.textContent = "\u23F0";
      icon.style.cssText = "font-size:48px;margin-bottom:12px;";
  
      var title = document.createElement("div");
      title.textContent = "Time is up!";
      title.style.cssText = "font-size:22px;font-weight:800;color:#d32f2f;margin-bottom:8px;";
  
      var msg = document.createElement("div");
      msg.textContent = "Your time has expired. You can no longer submit this task.";
      msg.style.cssText = "font-size:14px;color:#555;line-height:1.5;margin-bottom:20px;";
  
      var okBtn = document.createElement("button");
      okBtn.textContent = "OK";
      okBtn.style.cssText =
        "background:#1890ff;color:#fff;border:none;border-radius:6px;" +
        "padding:8px 32px;font-size:14px;font-weight:600;cursor:pointer;" +
        "box-shadow:0 2px 6px rgba(0,0,0,.15);transition:background .15s;";
      okBtn.addEventListener("mouseenter", function () { okBtn.style.background = "#1070d0"; });
      okBtn.addEventListener("mouseleave", function () { okBtn.style.background = "#1890ff"; });
      okBtn.addEventListener("click", function () {
        overlay.remove();
        window.__cdtOverlay = null;
      });
  
      box.appendChild(icon);
      box.appendChild(title);
      box.appendChild(msg);
      box.appendChild(okBtn);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      window.__cdtOverlay = overlay;
  
      console.log("[CountdownTimer] Time expired — submit disabled.");
    }
  
    // ── Initial render ─────────────────────────────────────────────────────────
    if (expired) {
      fill.style.width = "0%";
      fill.style.background = barColor(0);
      label.textContent = "00:00";
      setTimeout(function () { onExpired(); }, 700);
    } else {
      var initFraction = remaining / DURATION_SEC;
      fill.style.width = (initFraction * 100).toFixed(2) + "%";
      fill.style.background = barColor(initFraction);
      label.textContent = fmt(remaining);
      updateTooltip();
      window.__cdtInterval = setInterval(tick, 1000);
    }
  
    console.log(
      "[CountdownTimer] Plugin loaded. Key=" + storageKey +
      ", remaining=" + fmt(remaining) +
      ", DISABLE_SUBMIT=" + DISABLE_SUBMIT +
      (expired ? " (EXPIRED)" : "") + "."
    );
  }
  
  initCountdownTimer();
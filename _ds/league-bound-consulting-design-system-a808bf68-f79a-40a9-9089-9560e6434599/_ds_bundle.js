/* @ds-bundle: {"format":3,"namespace":"LeagueBoundConsultingDesignSystem_a808bf","components":[],"sourceHashes":{"slides/deck-stage.js":"ad1c016a6256","ui_kits/newsletter/Components.jsx":"d1931e907c4f","ui_kits/website/Components.jsx":"cc2f0730132e","ui_kits/website/Sections.jsx":"b9f08268bdd0"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LeagueBoundConsultingDesignSystem_a808bf = window.LeagueBoundConsultingDesignSystem_a808bf || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// slides/deck-stage.js
try { (() => {
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const pad2 = n => String(n).padStart(2, '0');
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
    }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    /* Tap zones for mobile — back/forward thirds like Stories.
       Transparent, no visible UI, don't block the overlay. */
    .tapzones {
      position: fixed;
      inset: 0;
      display: flex;
      z-index: 2147482000;
      pointer-events: none;
    }
    .tapzone {
      flex: 1;
      pointer-events: auto;
      -webkit-tap-highlight-color: transparent;
    }
    /* Only activate tap zones on coarse pointers (touch devices). */
    @media (hover: hover) and (pointer: fine) {
      .tapzones { display: none; }
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      ::slotted(*:last-child) {
        break-after: auto;
        page-break-after: auto;
      }
      .overlay, .tapzones { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTapBack = this._onTapBack.bind(this);
      this._onTapForward = this._onTapForward.bind(this);
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      // Initial collection + layout happens via slotchange, which fires on mount.
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        this._fit();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Tap zones (mobile): left third = back, right third = forward.
      const tapzones = document.createElement('div');
      tapzones.className = 'tapzones export-hidden';
      tapzones.setAttribute('aria-hidden', 'true');
      tapzones.setAttribute('data-noncommentable', '');
      const tzBack = document.createElement('div');
      tzBack.className = 'tapzone tapzone--back';
      const tzMid = document.createElement('div');
      tzMid.className = 'tapzone tapzone--mid';
      tzMid.style.pointerEvents = 'none';
      const tzFwd = document.createElement('div');
      tzFwd.className = 'tapzone tapzone--fwd';
      tzBack.addEventListener('click', this._onTapBack);
      tzFwd.addEventListener('click', this._onTapForward);
      tapzones.append(tzBack, tzMid, tzFwd);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.setAttribute('data-noncommentable', '');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._go(this._index - 1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._go(this._index + 1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));
      this._root.append(style, stage, tapzones, overlay);
      this._canvas = canvas;
      this._slot = slot;
      this._overlay = overlay;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }
    _onSlotChange() {
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        // Determine a label for comment flow: prefer explicit data-label,
        // then an existing data-screen-label, then first heading, else "Slide".
        let label = slide.getAttribute('data-label');
        if (!label) {
          const existing = slide.getAttribute('data-screen-label');
          if (existing) {
            // Strip any leading number the author may have included.
            label = existing.replace(/^\s*\d+\s*/, '').trim() || existing;
          }
        }
        if (!label) {
          const h = slide.querySelector('h1, h2, h3, [data-title]');
          if (h) label = (h.textContent || '').trim().slice(0, 40);
        }
        if (!label) label = 'Slide';
        slide.setAttribute('data-screen-label', `${pad2(n)} ${label}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
    }
    _loadNotes() {
      const tag = document.getElementById('speaker-notes');
      if (!tag) {
        this._notes = [];
        return;
      }
      try {
        const parsed = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(parsed)) this._notes = parsed;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
        this._notes = [];
      }
    }
    _restoreIndex() {
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      if (!this._overlay) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _fit() {
      if (!this._canvas) return;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onTapBack(e) {
      e.preventDefault();
      this._go(this._index - 1, 'tap');
    }
    _onTapForward(e) {
      e.preventDefault();
      this._go(this._index + 1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._go(this._index + 1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._go(this._index - 1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._go(this._index + 1, 'api');
    }
    prev() {
      this._go(this._index - 1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/newsletter/Components.jsx
try { (() => {
const {
  useState
} = React;
function TopBar() {
  return /*#__PURE__*/React.createElement("div", {
    className: "nl-top"
  }, /*#__PURE__*/React.createElement("span", null, "The insider strategy for elite college admissions."), /*#__PURE__*/React.createElement("a", {
    href: "#subscribe"
  }, "Subscribe \u2192"));
}
function HeroCard() {
  return /*#__PURE__*/React.createElement("div", {
    className: "nl-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl-hero__masthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl-hero__over"
  }, "LEAGUE BOUND CONSULTING"), /*#__PURE__*/React.createElement("div", {
    className: "nl-hero__issue"
  }, "No. 014 \xB7 Spring '26")), /*#__PURE__*/React.createElement("h1", {
    className: "nl-hero__title"
  }, "The ", /*#__PURE__*/React.createElement("i", null, "Admissions"), " Edge"), /*#__PURE__*/React.createElement("p", {
    className: "nl-hero__dek"
  }, "The insider strategy for unforgettable college applications."), /*#__PURE__*/React.createElement("div", {
    className: "nl-hero__byline"
  }, "By ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Razi Hecker"), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }, "\xB7"), "League Bound Consulting", /*#__PURE__*/React.createElement("span", {
    className: "nl-hero__date"
  }, "April 23, 2026")));
}
function Contents() {
  const items = [{
    n: '01',
    body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "A letter from Bala Cynwyd."), " ", /*#__PURE__*/React.createElement("i", null, "What 15 families taught us in 90 minutes of questions."))
  }, {
    n: '02',
    body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "The essay nobody will write for you."), " ", /*#__PURE__*/React.createElement("i", null, "Why the topic you're avoiding is the one that works."))
  }, {
    n: '03',
    body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "The dossier."), " ", /*#__PURE__*/React.createElement("i", null, "Four numbers from this month's cohort."))
  }, {
    n: '04',
    body: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "Two slots for May."), " ", /*#__PURE__*/React.createElement("i", null, "If you want us in your community."))
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "nl-contents"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl-contents__label"
  }, "In this issue"), /*#__PURE__*/React.createElement("ul", {
    className: "nl-contents__list"
  }, items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it.n,
    className: "nl-contents__item"
  }, /*#__PURE__*/React.createElement("span", {
    className: "nl-contents__num"
  }, it.n), /*#__PURE__*/React.createElement("span", null, it.body)))));
}
function BodyCard() {
  return /*#__PURE__*/React.createElement("div", {
    className: "nl-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl-pullquote"
  }, "Yesterday evening, we ran our first live event: a talk called Rethinking the College Essay at the Bala Cynwyd Library. About 15 families in the room. Great conversation. If you're on the East Coast and want us to bring something like this to your community, shoot me an email. We're opening up two slots for May: ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:razihecker@leagueboundconsulting.com"
  }, "razihecker@leagueboundconsulting.com")), /*#__PURE__*/React.createElement("div", {
    className: "nl-prose"
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", {
    className: "nl-dropcap"
  }, "T"), "he talk itself was forty minutes, and the questions after were ninety. That tells you everything about where parents are right now. Nobody wants another checklist. Everyone wants to know what their kid's story actually is \u2014 and whether they're allowed to tell it."), /*#__PURE__*/React.createElement("p", null, "So here's what I told them, and what I'll tell you.")), /*#__PURE__*/React.createElement("div", {
    className: "nl-sectionhead"
  }, /*#__PURE__*/React.createElement("span", {
    className: "nl-sectionhead__num"
  }, "02"), /*#__PURE__*/React.createElement("h2", {
    className: "nl-sectionhead__title"
  }, "The essay ", /*#__PURE__*/React.createElement("i", null, "nobody"), " will write for you.")), /*#__PURE__*/React.createElement("div", {
    className: "nl-prose"
  }, /*#__PURE__*/React.createElement("p", null, "The essay your student is avoiding is almost always the one that works. Not because pain is a prerequisite \u2014 it isn't \u2014 but because ", /*#__PURE__*/React.createElement("em", null, "avoidance is a signal"), ". It's the part of the story that matters enough to feel expensive."), /*#__PURE__*/React.createElement("p", null, "If a sixteen-year-old can write something without flinching, an admissions officer can read it without noticing. Three hundred applicants had the same summer internship. Two wrote about the crying-in-the-car moment. Guess which files get remembered.")), /*#__PURE__*/React.createElement("div", {
    className: "nl-dossier"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl-dossier__kicker"
  }, "THE DOSSIER \xB7 APRIL"), /*#__PURE__*/React.createElement("h3", {
    className: "nl-dossier__title"
  }, "Four numbers from ", /*#__PURE__*/React.createElement("i", null, "this month's"), " cohort."), /*#__PURE__*/React.createElement("ul", {
    className: "nl-dossier__list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "Essays workshopped to final draft"), /*#__PURE__*/React.createElement("span", null, "47")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "Ivy+ acceptances confirmed (Class of '30)"), /*#__PURE__*/React.createElement("span", null, "11")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "Students starting sophomore year with us"), /*#__PURE__*/React.createElement("span", null, "18")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("span", null, "Families on the waitlist for May intake"), /*#__PURE__*/React.createElement("span", null, "6")))), /*#__PURE__*/React.createElement("div", {
    className: "nl-sig"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl-sig__off"
  }, "Until next month,"), /*#__PURE__*/React.createElement("div", {
    className: "nl-sig__name"
  }, "Razi"), /*#__PURE__*/React.createElement("div", {
    className: "nl-sig__role"
  }, "FOUNDER \xB7 LEAGUE BOUND CONSULTING")));
}
function ImageCard() {
  return /*#__PURE__*/React.createElement("div", {
    className: "nl-image"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl-image__box"
  }, "EVENT PHOTO \xB7 BALA CYNWYD LIBRARY"), /*#__PURE__*/React.createElement("div", {
    className: "nl-image__caption"
  }, /*#__PURE__*/React.createElement("span", null, "Rethinking the College Essay \u2014 Thu, April 16, 7:00 PM"), /*#__PURE__*/React.createElement("b", null, "PHOTO \xB7 LBC")));
}
function CTABand() {
  return /*#__PURE__*/React.createElement("div", {
    className: "nl-cta"
  }, /*#__PURE__*/React.createElement("p", {
    className: "nl-cta__copy"
  }, "Want us to bring this talk to ", /*#__PURE__*/React.createElement("i", null, "your"), " community?"), /*#__PURE__*/React.createElement("a", {
    className: "nl-cta__btn",
    href: "#"
  }, "Reserve a May slot \u2192"));
}
function Footer() {
  return /*#__PURE__*/React.createElement("div", {
    className: "nl-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nl-footer__rule"
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-lion-gold.png",
    alt: "League Bound"
  }), /*#__PURE__*/React.createElement("div", null, "You're receiving this because you subscribed to The Admissions Edge.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Forward to a friend"), " \xB7 ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "View online"), " \xB7 ", /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Unsubscribe")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontFamily: "'Playfair Display', Georgia, serif",
      fontStyle: 'italic'
    }
  }, "League Bound Consulting \xB7 Philadelphia, PA"));
}
Object.assign(window, {
  TopBar,
  HeroCard,
  Contents,
  BodyCard,
  ImageCard,
  CTABand,
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/newsletter/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Components.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Website UI Kit — React components for LBC marketing site
   Exports everything to window at the bottom so sibling files can use them. */

const {
  useState
} = React;

// ——— Nav ———
function Nav({
  active = 'team'
}) {
  const links = [{
    id: 'team',
    label: 'The Team'
  }, {
    id: 'results',
    label: 'Results'
  }, {
    id: 'essays',
    label: 'Essay Breakdowns'
  }, {
    id: 'about',
    label: 'About'
  }];
  return /*#__PURE__*/React.createElement("nav", {
    className: "lbc-nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-container lbc-nav__inner"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "lbc-nav__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-lion-gold.png",
    alt: "League Bound",
    style: {
      height: 48,
      width: 'auto'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "lbc-nav__links"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.id,
    href: `#${l.id}`,
    className: `lbc-nav__link ${active === l.id ? 'is-active' : ''}`
  }, l.label))), /*#__PURE__*/React.createElement("a", {
    href: "#consult",
    className: "lbc-btn lbc-btn--primary lbc-btn--sm",
    style: {
      marginLeft: 'auto'
    }
  }, "Free Consultation")));
}

// ——— Hero (full-bleed) ———
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    className: "lbc-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-hero__bg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lbc-hero__wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-container lbc-hero__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-hero__copy"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline lbc-overline--on-dark"
  }, "\u2014 ELITE COLLEGE CONSULTING"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
      fontSize: 68,
      lineHeight: 1.06,
      color: '#fff',
      margin: '18px 0 0',
      letterSpacing: '-0.01em',
      textShadow: '0 2px 24px rgba(0,0,0,0.35)'
    }
  }, "Your Story,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("i", {
    style: {
      fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      fontStyle: 'italic',
      fontWeight: 700,
      color: 'var(--lbc-gold)'
    }
  }, "Told Right."), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 40,
      fontWeight: 500,
      color: '#E8EAF0'
    }
  }, "For Elite Colleges.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 16,
      lineHeight: 1.55,
      color: '#C9D1E0',
      margin: '24px 0 36px',
      maxWidth: 480
    }
  }, "We help ambitious high-school students build standout profiles, master the SAT/ACT, craft compelling applications, and get accepted to the schools they've always dreamed of."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#consult",
    className: "lbc-btn lbc-btn--primary"
  }, "Schedule a Free Consultation"), /*#__PURE__*/React.createElement("a", {
    href: "#pub",
    className: "lbc-btn lbc-btn--ghost"
  }, "Our Publication"))), /*#__PURE__*/React.createElement("div", {
    className: "lbc-hero__tm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-hero__tm__rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lbc-hero__tm__head"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/stars-5-gold.svg",
    height: "16",
    alt: ""
  }), /*#__PURE__*/React.createElement("span", {
    className: "lbc-hero__tm__pill"
  }, "STANFORD")), /*#__PURE__*/React.createElement("p", {
    className: "lbc-hero__tm__quote"
  }, "\"Razi was an absolutely incredible college essay expert\u2026 ensured every minute was well spent, very efficient, and fun.\""), /*#__PURE__*/React.createElement("div", {
    className: "lbc-hero__tm__author"
  }, "Gabriel")))));
}

// ——— Stat Block (Our Impact) ———
function StatBlock() {
  const stats = [{
    n: '8×',
    l: 'Ivy+ Acceptance Rate',
    icon: 'M12 2 L14 9 L22 9 L15.5 13.5 L18 21 L12 16.5 L6 21 L8.5 13.5 L2 9 L10 9 Z'
  }, {
    n: '200+',
    l: 'Students Placed',
    icon: 'M12 11a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z'
  }, {
    n: '5.0',
    l: 'Average Rating',
    icon: 'M12 2 L14 9 L22 9 L15.5 13.5 L18 21 L12 16.5 L6 21 L8.5 13.5 L2 9 L10 9 Z'
  }, {
    n: '100%',
    l: 'Ivy+ Team',
    icon: 'M12 2 L3 7 L12 12 L21 7 L12 2 Z M3 12 L12 17 L21 12 M3 17 L12 22 L21 17'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "lbc-stats",
    style: {
      padding: '60px 0',
      background: 'var(--lbc-navy)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-container"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline",
    style: {
      color: 'var(--lbc-gold)'
    }
  }, "\u2014 OUR IMPACT \u2014"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontWeight: 700,
      fontSize: 36,
      lineHeight: 1.1,
      margin: '10px 0 0',
      letterSpacing: '-0.01em',
      color: '#fff'
    }
  }, "Five years, ", /*#__PURE__*/React.createElement("i", {
    style: {
      fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
      fontStyle: 'italic',
      fontWeight: 700,
      color: 'var(--lbc-gold)'
    }
  }, "measurable outcomes."))), /*#__PURE__*/React.createElement("div", {
    className: "lbc-stats__grid"
  }, stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "lbc-stat",
    style: {
      border: 'none',
      borderTop: '2px solid var(--lbc-gold)',
      padding: '18px 0 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "28",
    height: "28",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--lbc-gold)",
    strokeWidth: "1.5",
    style: {
      display: 'block',
      margin: '0 auto 12px'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: s.icon,
    strokeLinejoin: "round",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("div", {
    className: "lbc-stat__num",
    style: {
      color: '#fff',
      fontSize: 52
    }
  }, s.n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontStyle: 'italic',
      fontSize: 14,
      color: '#C9D1E0',
      marginTop: 6
    }
  }, s.l))))));
}

// ——— Team Section ———
function TeamCard({
  name,
  school,
  honor,
  bullets,
  photo
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "lbc-team"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-photo",
    style: {
      width: '100%',
      aspectRatio: '4/5',
      backgroundImage: `url(../../assets/${photo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      color: 'transparent'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "lbc-team__body"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 24,
      fontWeight: 700,
      margin: '0 0 10px',
      color: 'var(--lbc-navy)'
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    className: "lbc-team__pill",
    style: {
      display: 'inline-block',
      border: '1px solid #F0E5C8',
      background: '#FEFAF2',
      color: 'var(--lbc-gold-dark)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 600,
      fontSize: 11,
      letterSpacing: '0.04em',
      padding: '6px 12px',
      borderRadius: 20,
      marginBottom: 14
    }
  }, school, honor ? ` — ${honor}` : ''), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none'
    }
  }, bullets.map((b, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      position: 'relative',
      paddingLeft: 18,
      fontSize: 14,
      lineHeight: 1.5,
      color: 'var(--fg-2)',
      margin: '0 0 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 8,
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'var(--lbc-gold)'
    }
  }), b)))));
}
function Team() {
  const members = [{
    name: 'Razi Hecker',
    school: "Harvard '20",
    honor: 'Magna Cum Laude',
    photo: 'team-razi-hecker.png',
    bullets: ['Published in 50 Successful Harvard Application Essays', 'Top Rated Tutor on Wyzant', 'Former Harvard Alumni Interviewer']
  }, {
    name: 'Maayan Schoen',
    school: "Yale '23",
    honor: 'Magna Cum Laude',
    photo: 'team-maayan-schoen.png',
    bullets: ['Harvard Law School \'29', 'The Politic Managing Editor', 'Humanities & Narrative Expert']
  }, {
    name: 'Josh Weiner',
    school: "UPenn '23",
    honor: 'Summa Cum Laude',
    photo: 'team-josh-weiner.png',
    bullets: ['Penn-Certified Writing Tutor', 'Dept Critical Language Scholar', 'Strategic Essay Architect']
  }, {
    name: 'Amitai Abuzaglo',
    school: "Harvard '21",
    honor: 'Magna Cum Laude',
    photo: 'team-amitai-abuzaglo.png',
    bullets: ['10+ Years Management', 'International Student Expert', 'Global Profile Strategist']
  }, {
    name: 'Gabriel Nagel',
    school: "Stanford '27",
    honor: null,
    photo: 'team-gabriel-nagel.png',
    bullets: ['Coca-Cola Scholar', 'Boothe Prize Winner', 'High-School Valedictorian']
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "lbc-section",
    style: {
      background: 'var(--bg-warm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-section-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline"
  }, "MEET THE TEAM"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 44,
      fontWeight: 700,
      margin: '12px 0 0',
      letterSpacing: '-0.01em',
      color: 'var(--lbc-navy)'
    }
  }, "100% Ivy+ Consultants"), /*#__PURE__*/React.createElement("p", {
    className: "lbc-subhead",
    style: {
      marginTop: 14,
      maxWidth: 540
    }
  }, "Every coach on this page graduated from an Ivy+ school and has worked on the inside of college admissions.")), /*#__PURE__*/React.createElement("div", {
    className: "lbc-team__grid lbc-team__grid--5"
  }, members.map((m, i) => /*#__PURE__*/React.createElement(TeamCard, _extends({
    key: i
  }, m))))));
}

// ——— Testimonials (grid with photos) ———
function TestimonialCard({
  quote,
  name,
  role,
  school,
  photoLabel
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "lbc-testimonial"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-testimonial__photo lbc-photo"
  }, photoLabel || 'PHOTO'), /*#__PURE__*/React.createElement("div", {
    className: "lbc-testimonial__body"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/stars-5-gold.svg",
    height: "20",
    alt: ""
  }), /*#__PURE__*/React.createElement("blockquote", {
    className: "lbc-testimonial__quote"
  }, "\"", quote, "\""), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline"
  }, school), /*#__PURE__*/React.createElement("div", {
    className: "lbc-testimonial__name"
  }, name, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg-3)',
      fontWeight: 400,
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      marginLeft: 8
    }
  }, role)))));
}
function Testimonial() {
  const items = [{
    quote: "Razi knew exactly what to do with his story and shaped it into something truthful and impactful. My advice to other parents: don't hesitate.",
    name: 'Ji L.',
    role: '· Parent',
    school: "HARVARD '29",
    photoLabel: 'PARENT PHOTO'
  }, {
    quote: "I came in with a résumé and left with an essay. That's the difference. Gabriel's process made me write the thing I had been avoiding.",
    name: 'Gabriel N.',
    role: '· Student',
    school: "STANFORD '27",
    photoLabel: 'STUDENT PHOTO'
  }, {
    quote: "We talked to three consultants. LBC was the only one who asked about my daughter before asking about her scores.",
    name: 'Priya S.',
    role: '· Parent',
    school: "YALE '28",
    photoLabel: 'PARENT PHOTO'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "lbc-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-section-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline"
  }, "IN THEIR WORDS"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 40,
      fontWeight: 700,
      margin: '12px 0 0',
      letterSpacing: '-0.01em',
      color: 'var(--lbc-navy)'
    }
  }, "Students and parents who've done it.")), /*#__PURE__*/React.createElement("div", {
    className: "lbc-testimonial__grid"
  }, items.map((it, i) => /*#__PURE__*/React.createElement(TestimonialCard, _extends({
    key: i
  }, it))))));
}

// ——— Footer ———
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    className: "lbc-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-container lbc-footer__grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-lion-gold.png",
    alt: "League Bound Consulting",
    style: {
      height: 72,
      width: 'auto',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--fg-on-dark-2)',
      fontSize: 13,
      lineHeight: 1.6,
      marginTop: 20,
      maxWidth: 280
    }
  }, "Boutique admissions consulting for ambitious students who want more than a template essay.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline lbc-overline--on-dark"
  }, "Company"), /*#__PURE__*/React.createElement("ul", {
    className: "lbc-footer__list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "The Team")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Results")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "About")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline lbc-overline--on-dark"
  }, "Writing"), /*#__PURE__*/React.createElement("ul", {
    className: "lbc-footer__list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Essay Breakdowns")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Newsletter")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Book")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline lbc-overline--on-dark"
  }, "Contact"), /*#__PURE__*/React.createElement("ul", {
    className: "lbc-footer__list"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "mailto:hello@leagueboundconsulting.com"
  }, "hello@leagueboundconsulting.com")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "LinkedIn")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Substack"))))), /*#__PURE__*/React.createElement("div", {
    className: "lbc-container lbc-footer__bottom"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 League Bound Consulting"), /*#__PURE__*/React.createElement("span", null, "leagueboundconsulting.com")));
}

// ——— Consultation CTA band ———
function CTABand() {
  return /*#__PURE__*/React.createElement("section", {
    className: "lbc-cta-band",
    style: {
      padding: '28px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-container lbc-cta-band__inner"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 22,
      fontWeight: 600,
      color: '#fff',
      letterSpacing: '-0.005em'
    }
  }, "Ready to start? ", /*#__PURE__*/React.createElement("i", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: 'italic',
      color: 'var(--lbc-gold)'
    }
  }, "We'd love to meet you.")), /*#__PURE__*/React.createElement("a", {
    href: "#consult",
    className: "lbc-btn lbc-btn--primary"
  }, "Free Strategy Session")));
}
Object.assign(window, {
  Nav,
  Hero,
  StatBlock,
  Team,
  TeamCard,
  Testimonial,
  TestimonialCard,
  Footer,
  CTABand
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Sections.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* New website sections: school stats, testimonial carousel, video grid, founder bio */

function SchoolStatsStrip() {
  const schools = [{
    name: 'Stanford',
    initial: 'S',
    national: '3.8%',
    lb: '23%',
    logo: null
  }, {
    name: 'Harvard',
    initial: 'H',
    national: '3.6%',
    lb: '29%',
    logo: null
  }, {
    name: 'Yale',
    initial: 'Y',
    national: '4.5%',
    lb: '26%',
    logo: null
  }, {
    name: 'UPenn',
    initial: 'P',
    national: '5.4%',
    lb: '27%',
    logo: null
  }, {
    name: 'Columbia',
    initial: 'C',
    national: '3.9%',
    lb: '24%',
    logo: null
  }, {
    name: 'Princeton',
    initial: 'P',
    national: '4.5%',
    lb: '21%',
    logo: null
  }, {
    name: 'Cornell',
    initial: 'C',
    national: '8.4%',
    lb: '33%',
    logo: null
  }, {
    name: 'Northwestern',
    initial: 'N',
    national: '6.8%',
    lb: '35%',
    logo: null
  }, {
    name: 'Dartmouth',
    initial: 'D',
    national: '5.3%',
    lb: '28%',
    logo: null
  }, {
    name: 'Brown',
    initial: 'B',
    national: '5.1%',
    lb: '25%',
    logo: null
  }];
  // Duplicate for seamless marquee
  const loop = [...schools, ...schools];
  return /*#__PURE__*/React.createElement("section", {
    className: "lbc-schoolstrip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-schoolstrip__track"
  }, loop.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "lbc-schoolstrip__item"
  }, /*#__PURE__*/React.createElement("div", {
    className: `lbc-schoolstrip__logo ${s.logo ? 'has-img' : ''}`,
    style: s.logo ? {
      backgroundImage: `url(../../assets/${s.logo})`
    } : {}
  }, !s.logo && s.initial), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbc-schoolstrip__name"
  }, s.name), /*#__PURE__*/React.createElement("div", {
    className: "lbc-schoolstrip__stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-schoolstrip__national"
  }, "National ", /*#__PURE__*/React.createElement("b", null, s.national)), /*#__PURE__*/React.createElement("div", {
    className: "lbc-schoolstrip__lb"
  }, "League Bound ", /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, s.lb))))))));
}
function TmCard({
  quote,
  name,
  role,
  school,
  initial,
  photo
}) {
  const avatarStyle = photo ? {
    backgroundImage: `url(../../assets/${photo})`,
    color: 'transparent'
  } : {};
  return /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__stars"
  }, "\u2605\u2605\u2605\u2605\u2605"), /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__pill"
  }, school)), /*#__PURE__*/React.createElement("p", {
    className: "lbc-tmcard__quote"
  }, "\"", quote, "\""), /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__author"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__avatar",
    style: avatarStyle
  }, !photo && initial), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__name"
  }, name), /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__role"
  }, role))));
}
function TestimonialCarousel() {
  const items = [{
    quote: "Razi was an absolutely incredible college essay expert. I significantly struggled finding my 'voice' in these essays. I believe these essays were a significant part that led to my acceptance.",
    name: 'Gabriel N.',
    role: "Student · Stanford '27",
    school: "STANFORD '27",
    initial: 'G',
    photo: 'team-gabriel-nagel.png'
  }, {
    quote: "Razi is truly exceptional. He showed me how to convey my life through powerful anecdotes. Even when I thought my essays were good, they were nowhere near the level he pushed me to.",
    name: 'Zach K.',
    role: "Student · Columbia '30",
    school: "COLUMBIA '30",
    initial: 'Z'
  }, {
    quote: "Razi is truly a lifesaver for college essays. He is dedicated and HONEST — he is not afraid to give genuine feedback. With Razi's help, I was accepted into Penn.",
    name: 'Kate Y.',
    role: "Student · UPenn '29",
    school: "UPENN '29",
    initial: 'K'
  }, {
    quote: "Working with Razi completely reshaped my application. What I learned about essays should be taught in personal statements. His feedback was precise, kind, and changed how I write.",
    name: 'Shivank G.',
    role: "Student · Cornell '30",
    school: "CORNELL '30",
    initial: 'S'
  }, {
    quote: "My advice to other parents: don't hesitate. Razi knew exactly what to do with my son's story and shaped it into something truthful and impactful.",
    name: 'Ji L.',
    role: "Parent · Harvard '29",
    school: "HARVARD '29",
    initial: 'J'
  }];
  const loop = [...items, ...items];
  return /*#__PURE__*/React.createElement("section", {
    className: "lbc-tmcarousel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-container",
    style: {
      textAlign: 'center',
      marginBottom: 40
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline",
    style: {
      color: 'var(--lbc-gold-dark)'
    }
  }, "\u2014 OUR STUDENTS"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 40,
      fontWeight: 700,
      lineHeight: 1.08,
      margin: '12px 0 0',
      letterSpacing: '-0.01em',
      color: 'var(--lbc-navy)'
    }
  }, "In their ", /*#__PURE__*/React.createElement("i", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: 'italic',
      fontWeight: 700,
      color: 'var(--lbc-gold-dark)'
    }
  }, "own words."))), /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcarousel__track"
  }, loop.map((it, i) => /*#__PURE__*/React.createElement(TmCard, _extends({
    key: i
  }, it)))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#consult",
    className: "lbc-btn lbc-btn--primary"
  }, "Schedule a Free Consultation"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32,
      fontFamily: 'var(--font-sans)',
      fontWeight: 700,
      fontSize: 11,
      letterSpacing: '0.28em',
      color: 'var(--lbc-gold-dark)'
    }
  }, "\u2014 REAL RESULTS, REAL FAMILIES \u2014")));
}
function VideoTestimonialGrid() {
  const items = [{
    type: 'text',
    pill: "HARVARD CLASS OF '29",
    quote: "My Son Got Into Four Ivies — Harvard, Yale, Dartmouth, and Cornell. From the very first session, Chris knew Razi was the right counselor. Razi knew exactly what to do with it and how to shape it into something truthful and impactful. My advice to other parents: don't hesitate.",
    name: 'Ji L.',
    role: "Parent of Chris · Harvard '29",
    initial: 'J'
  }, {
    type: 'video',
    videoId: null,
    title: "Building an Authentic Narrative: How I Got Into UPenn"
  }, {
    type: 'text',
    pill: "NYU CLASS OF '30",
    quote: "Amitai from League Bound helped me completely transform my application and get into NYU. I had strong ideas but they were fragmented. Amitai was extraordinarily thorough, empathetic, and honestly a brilliant college guidance counselor. Getting in is unreal.",
    name: 'Keith',
    role: "International Student · NYU '30",
    initial: 'K'
  }, {
    type: 'text',
    pill: "CORNELL CLASS OF '30",
    quote: "When I read the personal statement, I was blown away. It was simple, elegant, and you could see his entire personality in it. Razi has a rare ability to take a student's raw story and help them find the version of it that is only theirs.",
    name: 'Parent',
    role: "Parent · Cornell '30",
    initial: 'P'
  }, {
    type: 'video',
    videoId: null,
    title: "How My Son Got Into 4 Ivy League Schools: Harvard and Yale"
  }, {
    type: 'text',
    pill: "UPENN CLASS OF '30",
    quote: "Razi showed her that the strength of her story was often found in her vulnerability and openness — qualities she carried through to her interviews. We came in uncertain about the process. We left knowing we had done everything right.",
    name: 'Parent',
    role: "Parent · UPenn '30",
    initial: 'P'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "lbc-videogrid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-videogrid__label"
  }, "\u2014 REAL RESULTS, REAL FAMILIES \u2014"), /*#__PURE__*/React.createElement("div", {
    className: "lbc-container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-videogrid__grid"
  }, items.map((it, i) => it.type === 'video' ? /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "lbc-videogrid__video"
  }, it.videoId ? /*#__PURE__*/React.createElement("iframe", {
    src: `https://www.youtube.com/embed/${it.videoId}`,
    title: it.title,
    frameBorder: "0",
    allowFullScreen: true
  }) : /*#__PURE__*/React.createElement("div", {
    className: "lbc-videogrid__placeholder"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-videogrid__playicon"
  }, "\u25B6"), /*#__PURE__*/React.createElement("div", null, it.title))) : /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "lbc-videogrid__card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-videogrid__pill"
  }, it.pill), /*#__PURE__*/React.createElement("p", {
    className: "lbc-videogrid__quote"
  }, "\"", it.quote, "\""), /*#__PURE__*/React.createElement("div", {
    className: "lbc-videogrid__author"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__avatar"
  }, it.initial), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__name"
  }, it.name), /*#__PURE__*/React.createElement("div", {
    className: "lbc-tmcard__role"
  }, it.role))))))));
}
function FounderBio() {
  const creds = ["Harvard '20, Magna Cum Laude", "50 Successful Harvard Essays", "Former Harvard Interviewer", "5.0 on Wyzant"];
  return /*#__PURE__*/React.createElement("section", {
    className: "lbc-founder"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-container lbc-founder__grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-founder__prose"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-overline",
    style: {
      color: 'var(--lbc-gold-dark)'
    }
  }, "\u2014 WHY LEAGUE BOUND"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 40,
      fontWeight: 700,
      lineHeight: 1.08,
      margin: '14px 0 24px',
      letterSpacing: '-0.01em',
      color: 'var(--lbc-navy)'
    }
  }, "We ", /*#__PURE__*/React.createElement("i", {
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontStyle: 'italic',
      fontWeight: 700,
      color: 'var(--lbc-gold-dark)'
    }
  }, "show you"), " the work."), /*#__PURE__*/React.createElement("p", null, "Most public-school counselors manage hundreds of students. Private-school ratios are better but still begin too late. ", /*#__PURE__*/React.createElement("b", null, "At League Bound, every student works one-on-one with a dedicated consultant from 9th grade through decision day.")), /*#__PURE__*/React.createElement("p", null, "Our job is to help students find what is authentic to them \u2014 and make it come through in their course selection, extracurriculars, summer programs, awards, and finally their writing."), /*#__PURE__*/React.createElement("div", {
    className: "lbc-founder__credentials"
  }, creds.map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    className: "lbc-founder__cred"
  }, c)))), /*#__PURE__*/React.createElement("div", {
    className: "lbc-founder__media"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbc-founder__photo",
    style: {
      backgroundImage: 'url(../../assets/team-razi-hecker.png)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "lbc-founder__book lbc-founder__book--below"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/book-more-than-personal-statement.jpg",
    alt: "More Than a Personal Statement",
    style: {
      width: 110,
      display: 'block',
      borderRadius: 4,
      boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "lbc-founder__booktitle"
  }, "More Than a Personal Statement"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: 12,
      color: 'var(--fg-2)',
      marginTop: 4,
      fontStyle: 'italic'
    }
  }, "Real essays. Real breakdowns."), /*#__PURE__*/React.createElement("a", {
    href: "#book",
    className: "lbc-btn lbc-btn--primary lbc-btn--sm",
    style: {
      marginTop: 12,
      display: 'inline-block'
    }
  }, "Get a Free Copy \u2192"))))));
}
Object.assign(window, {
  SchoolStatsStrip,
  TestimonialCarousel,
  VideoTestimonialGrid,
  FounderBio
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Sections.jsx", error: String((e && e.message) || e) }); }

})();

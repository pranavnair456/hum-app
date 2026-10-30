// The landing page's paintings (the user, 2026-10-29: "all images on screen will bounce around like a pong game or a tv
// logo that moves across screen and bounces back at the edges and corners. the text will stay in place. when an image
// goes over a text, that text will be white and if there is no image it will be black ... even small portions of a
// single letter change colors"). Each painting carries a white copy of the words, the stage's size, moved against the
// painting so it lies exactly over the black words: the painting's frame clips it to its own shape, so whatever part of
// a letter it covers is white. Each painting goes in a straight line at its own speed. Its touches of the screen's edges
// are counted (the user: "first time touching a boarder, the image bounces back, second time touching a boarder, it wraps
// around. that logic loops forever for odd and even touches"): an odd one turns it back; an even one lets it through, out
// past that edge and, once wholly gone, in from the opposite one. A corner's two edges are one touch. The app's icon travels
// too, above everything (the user: "always bouncing on touches, never wrapping ... no matter what, on this screen the logo
// will always be the main star"), still while a pointer is on it, so it can be pressed. Its aura leaves a trail (the user,
// 2026-10-30: "a faint trail behind it to model propulsion"): soft gold glows where its centre was a moment ago, each a lag
// further back, smaller and fainter, so the trail bends round a bounce and draws back into it while it is held.
"use strict";
(() => {
  const stage = document.querySelector(".stage");
  const words = stage && stage.querySelector(".words");
  if (!words) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SLOW = 0.6; // a phone's share of the speeds: a smaller screen crossed as calmly
  const items = [...stage.querySelectorAll(".art")].map((frame) => {
    const ink = words.cloneNode(true);
    ink.classList.add("ink");
    ink.setAttribute("aria-hidden", "true");
    for (const a of ink.querySelectorAll("a")) a.tabIndex = -1;
    frame.append(ink);
    const d = frame.dataset;
    return { frame, ink, fx: +d.x, fy: +d.y, px: +d.px, py: +d.py, vx: +d.vx, vy: +d.vy, x: 0, y: 0, w: 0, h: 0, placed: false, touches: 0, passX: 0, passY: 0 };
  });
  const star = stage.querySelector(".star");
  const TRAIL = 16; // glows behind the star
  const LAG = 0.5; // seconds between them: at its calm speed, a trail of a couple of its own widths
  const glows = [];
  const past = []; // the star's centre, {t, x, y}, a sample every 40 ms back over the trail's seconds
  let clock = 0;
  let lead = null;
  if (star) {
    const d = star.dataset;
    const icon = star.querySelector(".icon");
    const it = { frame: star, ink: null, bounces: true, held: false, fx: +d.x, fy: +d.y, px: +d.px, py: +d.py, vx: +d.vx, vy: +d.vy, x: 0, y: 0, w: 0, h: 0, placed: false, touches: 0, passX: 0, passY: 0 };
    const hold = (on) => () => (it.held = on);
    for (const [e, on] of [["pointerenter", true], ["pointerleave", false], ["focus", true], ["blur", false]]) icon.addEventListener(e, hold(on));
    items.push(it);
    lead = it;
    const trail = document.createElement("div");
    trail.className = "trail";
    trail.setAttribute("aria-hidden", "true");
    for (let k = 1; k <= TRAIL; k++) {
      const el = document.createElement("i");
      el.style.opacity = (0.55 * (1 - k / (TRAIL + 1)) ** 1.3).toFixed(3);
      trail.append(el);
      glows.push({ el, k, d: 0 });
    }
    stage.insertBefore(trail, star);
  }
  let W = 0;
  let H = 0;

  const put = (it) => {
    it.frame.style.transform = `translate3d(${it.x}px, ${it.y}px, 0)`;
    if (it.ink) it.ink.style.transform = `translate3d(${-it.x}px, ${-it.y}px, 0)`;
  };

  function size() {
    // the stage's size for every copy; a painting placed where the drawing has it, then always kept inside
    W = stage.clientWidth;
    H = stage.clientHeight;
    for (const it of items) {
      if (it.ink) [it.ink.style.width, it.ink.style.height] = [`${W}px`, `${H}px`];
      it.w = it.frame.offsetWidth;
      it.h = it.frame.offsetHeight;
      const phone = W <= 760 && Number.isFinite(it.px); // a tall screen: the paintings start spread down it
      if (!it.placed) [it.x, it.y, it.placed] = [(phone ? it.px : it.fx) * W, (phone ? it.py : it.fy) * H, true];
      if (!it.passX) it.x = Math.min(Math.max(0, it.x), Math.max(0, W - it.w)); // one passing through goes on its way
      if (!it.passY) it.y = Math.min(Math.max(0, it.y), Math.max(0, H - it.h));
      put(it);
    }
    for (const g of glows) {
      g.d = lead.w * (1.25 - (0.85 * g.k) / TRAIL); // the nearest a little wider than the icon, the last under half its width
      [g.el.style.width, g.el.style.height] = [`${g.d}px`, `${g.d}px`];
    }
    if (lead) trace(0);
  }

  function trace(dt) {
    // the star's centre now; each glow where the centre was its lags ago (until then, where it began)
    clock += dt;
    const [x, y] = [lead.x + lead.w / 2, lead.y + lead.h / 2];
    if (!past.length || clock - past[past.length - 1].t >= 0.04) past.push({ t: clock, x, y });
    while (past.length > 2 && past[1].t < clock - TRAIL * LAG) past.shift();
    let j = past.length - 1;
    for (const g of glows) {
      const t = clock - g.k * LAG;
      while (j > 0 && past[j].t > t) j--;
      g.el.style.transform = `translate3d(${past[j].x - g.d / 2}px, ${past[j].y - g.d / 2}px, 0)`;
    }
  }

  // a painting at p (its length s, its speed v) at the edge of a stage L long that it is heading for
  const edge = (p, v, s, L) => (v < 0 && p <= 0) || (v > 0 && p >= L - s);
  // turned back, on the edge it touched
  const bounce = (p, v, s, L) => (v < 0 ? [0, -v] : [Math.max(0, L - s), -v]);
  // passing through: 1 going out past the far edge, then (wholly gone) 2 coming in from the near one, 0 once wholly back
  // inside, when an edge counts again
  function pass(p, v, s, L, phase) {
    if (phase === 1 && (v > 0 ? p >= L : p <= -s)) return [v > 0 ? p - L - s : p + L + s, 2];
    if (phase === 2 && p >= 0 && p <= L - s) return [p, 0];
    return [p, phase];
  }

  let last = 0;
  let running = false;
  function step(t) {
    if (still.matches) return void (running = false);
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; // a frame's seconds, never a jump after the tab slept
    last = t;
    const k = W <= 760 ? SLOW : 1;
    for (const it of items) {
      if (it.held) continue; // the icon under a pointer or the keyboard: still, to be pressed
      it.x += it.vx * k * dt;
      it.y += it.vy * k * dt;
      const hx = !it.passX && edge(it.x, it.vx, it.w, W);
      const hy = !it.passY && edge(it.y, it.vy, it.h, H);
      if (hx || hy) {
        const through = !it.bounces && ++it.touches % 2 === 0; // odd: back; even: through; the icon always back
        if (hx) through ? (it.passX = 1) : ([it.x, it.vx] = bounce(it.x, it.vx, it.w, W));
        if (hy) through ? (it.passY = 1) : ([it.y, it.vy] = bounce(it.y, it.vy, it.h, H));
      }
      [it.x, it.passX] = pass(it.x, it.vx, it.w, W, it.passX);
      [it.y, it.passY] = pass(it.y, it.vy, it.h, H, it.passY);
      put(it);
    }
    if (lead) trace(dt);
    requestAnimationFrame(step);
  }
  function go() {
    if (running || still.matches) return;
    running = true;
    last = 0;
    requestAnimationFrame(step);
  }

  size();
  window.addEventListener("resize", size);
  for (const img of stage.querySelectorAll(".art img")) if (!img.complete) img.addEventListener("load", size, { once: true });
  if (document.fonts) document.fonts.ready.then(size);
  still.addEventListener("change", go);
  go();
})();

// Every page's one script.
// The Google Play badge (the user, 2026-11-05: "include a google play store icon too but rerout it to say coming
// soon"): a tap shows "Coming soon" under it for a moment instead of going anywhere. Decision 609 (row C6; the
// Android spec's "The site"): on the production release day PLAY_OPEN goes on, with tools/build_static.py's own and
// tools/publish_site.sh, and each badge becomes a link to HUM's listing (DOWNLOAD_URL_PLAY there), its image as it is
const PLAY_OPEN = false;
const PLAY_URL = "https://play.google.com/store/apps/details?id=app.hummusic.hum";
for (const b of document.querySelectorAll(".play")) {
  if (PLAY_OPEN) {
    const a = document.createElement("a");
    a.className = b.className;
    a.href = PLAY_URL;
    a.append(b.querySelector("img"));
    b.replaceWith(a);
    continue;
  }
  let t = 0;
  b.addEventListener("click", () => {
    b.classList.add("say");
    clearTimeout(t);
    t = setTimeout(() => b.classList.remove("say"), 2400);
  });
}
// Home's "What does HUM include?": a tap on a card shows its screen on the phone and lights its dot (the cards are
// buttons; without this script the first card's screen shows).
(() => {
  const box = document.querySelector(".include");
  if (!box) return;
  const cards = [...box.querySelectorAll(".card")];
  const shots = [...box.querySelectorAll(".phone img")];
  const dots = [...box.querySelectorAll(".dots i")];
  const pick = (i) => {
    cards.forEach((c, j) => c.setAttribute("aria-pressed", String(i === j)));
    shots.forEach((s, j) => s.classList.toggle("on", i === j));
    dots.forEach((d, j) => d.classList.toggle("on", i === j));
  };
  cards.forEach((c, i) => c.addEventListener("click", () => pick(i)));
})();

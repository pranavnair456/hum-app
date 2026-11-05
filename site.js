// Every page's one script.
// The Google Play badge (the user, 2026-11-05: "include a google play store icon too but rerout it to say coming
// soon"): a tap shows "Coming soon" under it for a moment instead of going anywhere.
for (const b of document.querySelectorAll(".play")) {
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

const endpoint = "https://api.2r.ru/v1/integrations/mentors/reviews/325531224";
const sliders = Array.from(document.querySelectorAll("#carousel_1227326241, #carousel_1227326251"));

function createDialog() {
  const dialog = document.createElement("dialog");
  dialog.className = "reviews-dialog";
  dialog.setAttribute("aria-labelledby", "review-dialog-title");
  dialog.innerHTML = `
    <form method="dialog" class="reviews-dialog__header">
      <h2 id="review-dialog-title">Отзыв</h2>
      <button aria-label="Закрыть отзыв" autofocus>×</button>
    </form>
    <div class="reviews-dialog__body">
      <p class="reviews-dialog__author"></p>
      <p class="reviews-dialog__message"></p>
    </div>
  `;
  document.body.append(dialog);

  const body = dialog.querySelector(".reviews-dialog__body");
  const author = dialog.querySelector(".reviews-dialog__author");
  const message = dialog.querySelector(".reviews-dialog__message");
  let trigger;
  dialog.addEventListener("close", () => trigger?.focus({ preventScroll: true }));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    }
  });

  return (review, button) => {
    trigger = button;
    author.textContent = review.author;
    message.textContent = review.message;
    dialog.showModal();
    body.scrollTop = 0;
  };
}

function createSlide(review, index, count, openReview) {
  const slide = document.createElement("article");
  slide.className = "t1148__item reviews-card";
  slide.setAttribute("role", "group");
  slide.setAttribute("aria-roledescription", "слайд");
  slide.setAttribute("aria-label", `${index + 1} из ${count}`);
  slide.setAttribute("aria-current", String(index === 0));

  const excerpt = document.createElement("p");
  excerpt.className = "reviews-card__excerpt";
  excerpt.textContent = review.message;

  const footer = document.createElement("footer");
  footer.className = "reviews-card__footer";
  const author = document.createElement("span");
  author.className = "reviews-card__author";
  author.textContent = review.author;
  author.title = review.author;

  const more = document.createElement("button");
  more.type = "button";
  more.className = "reviews-card__more";
  more.textContent = "Читать полностью";
  more.setAttribute("aria-haspopup", "dialog");
  more.hidden = true;
  more.addEventListener("click", () => openReview(review, more));

  footer.append(author, more);
  slide.append(excerpt, footer);
  return { slide, excerpt, more };
}

function createSkeleton() {
  const slide = document.createElement("div");
  slide.className = "t1148__item reviews-card reviews-card--skeleton";
  slide.setAttribute("aria-hidden", "true");
  slide.innerHTML = `
    <div class="reviews-card__skeleton-lines">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
    <span class="reviews-card__skeleton-author"></span>
  `;
  return slide;
}

async function loadReviews() {
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`2R HTTP ${response.status}`);
  const { result } = await response.json();
  if (!Array.isArray(result?.items)) return [];

  return result.items
    .filter((item) => item?.status === "verified" && typeof item.message === "string" && item.message.trim())
    .map((item) => {
      const username = typeof item.author?.username === "string" ? item.author.username.trim() : "";
      return {
        author: username ? `Автор: @${username.replace(/^@/, "")}` : "Автор: ученик",
        message: item.message.trim(),
      };
    });
}

async function init() {
  if (!sliders.length || typeof HTMLDialogElement === "undefined" || typeof ResizeObserver === "undefined") return;

  for (const slider of sliders) {
    slider.classList.add("reviews-loading");
    slider.setAttribute("aria-busy", "true");
    slider.append(createSkeleton(), createSkeleton());
  }

  let reviews;
  try {
    reviews = await loadReviews();
  } finally {
    for (const slider of sliders) {
      slider.querySelectorAll(".reviews-card--skeleton").forEach((slide) => slide.remove());
      slider.classList.remove("reviews-loading");
      slider.removeAttribute("aria-busy");
    }
  }
  if (!reviews.length) return;

  const openReview = createDialog();
  const buttons = new WeakMap();
  const observer = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      if (target.clientHeight) {
        buttons.get(target).hidden = target.scrollHeight <= target.clientHeight + 1;
      }
    }
  });

  for (const slider of sliders) {
    const cards = reviews.map((review, index) => createSlide(review, index, reviews.length, openReview));
    slider.replaceChildren(...cards.map(({ slide }) => slide));
    slider.scrollLeft = 0;
    for (const { excerpt, more } of cards) {
      buttons.set(excerpt, more);
      observer.observe(excerpt);
    }
  }
}

// Keep the original slides as a fallback when 2R is unavailable.
init().catch(() => {});

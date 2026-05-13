const CART_KEY = "harbor-goods-cart-v1";

/** @returns {Record<string, number>} */
function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** @param {Record<string, number>} cart */
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function cartItemCount(cart) {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function updateHeaderCount() {
  const el = document.getElementById("header-cart-count");
  if (el) el.textContent = String(cartItemCount(readCart()));
}

function renderProductGrid() {
  const grid = document.getElementById("product-grid");
  if (!grid || !window.DEMO_PRODUCTS) return;

  for (const p of window.DEMO_PRODUCTS) {
    const article = document.createElement("article");
    article.className = "card";
    article.innerHTML = `
      <div class="card-image" aria-hidden="true">${p.emoji}</div>
      <div class="card-body">
        <h2 class="card-title">${escapeHtml(p.title)}</h2>
        <p class="card-desc">${escapeHtml(p.description)}</p>
        <div class="card-footer">
          <span class="price">${formatPrice(p.priceCents)}</span>
          <button type="button" class="btn" data-add="${escapeAttr(p.id)}">Add to cart</button>
        </div>
      </div>
    `;
    grid.appendChild(article);
  }

  grid.addEventListener("click", (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    const id = t.closest("[data-add]")?.getAttribute("data-add");
    if (!id) return;
    const cart = readCart();
    cart[id] = (cart[id] ?? 0) + 1;
    writeCart(cart);
    updateHeaderCount();
    t.textContent = "Added ✓";
    setTimeout(() => {
      t.textContent = "Add to cart";
    }, 900);
  });
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return s.replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderCount();
  renderProductGrid();
});

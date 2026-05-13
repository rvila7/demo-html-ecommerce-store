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

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render() {
  const root = document.getElementById("cart-root");
  if (!root || !window.DEMO_PRODUCTS) return;

  const cart = readCart();
  const byId = new Map(window.DEMO_PRODUCTS.map((p) => [p.id, p]));
  const lines = Object.entries(cart).filter(([, qty]) => qty > 0);

  updateHeaderCount();

  if (lines.length === 0) {
    root.innerHTML =
      '<p class="cart-empty">Your cart is empty. <a href="index.html">Browse products</a>.</p>';
    return;
  }

  let subtotal = 0;
  const itemsHtml = lines
    .map(([id, qty]) => {
      const p = byId.get(id);
      if (!p) return "";
      subtotal += p.priceCents * qty;
      return `
      <li class="cart-row" data-id="${escapeHtml(id)}">
        <div class="cart-row-info">
          <div class="cart-row-thumb" aria-hidden="true">${p.emoji}</div>
          <div>
            <div class="cart-row-title">${escapeHtml(p.title)}</div>
            <div class="cart-row-meta">${formatPrice(p.priceCents)} each</div>
          </div>
        </div>
        <div class="qty-controls">
          <button type="button" data-dec="${escapeHtml(id)}" aria-label="Decrease quantity">−</button>
          <span>${qty}</span>
          <button type="button" data-inc="${escapeHtml(id)}" aria-label="Increase quantity">+</button>
        </div>
        <div class="price">${formatPrice(p.priceCents * qty)}</div>
      </li>`;
    })
    .join("");

  root.innerHTML = `
    <ul class="cart-list">${itemsHtml}</ul>
    <div class="cart-total">
      <span>Subtotal</span>
      <span>${formatPrice(subtotal)}</span>
    </div>
    <p class="link-muted" style="margin-top:1rem">Checkout is not implemented — this is a static demo.</p>
  `;

  root.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-inc");
      if (!id) return;
      const c = readCart();
      c[id] = (c[id] ?? 0) + 1;
      writeCart(c);
      render();
    });
  });
  root.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-dec");
      if (!id) return;
      const c = readCart();
      const next = (c[id] ?? 0) - 1;
      if (next <= 0) delete c[id];
      else c[id] = next;
      writeCart(c);
      render();
    });
  });
}

document.addEventListener("DOMContentLoaded", render);

const products = [
  {
    id: 1,
    name: "제주 산지 직송 감귤 3kg",
    store: "오름농장",
    category: "fresh",
    price: 24900,
    discount: 18,
    rating: 4.8,
    reviews: 1241,
    badge: "오늘특가",
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 2,
    name: "무소음 우드 탁상 시계",
    store: "하우스모먼트",
    category: "living",
    price: 31800,
    discount: 12,
    rating: 4.7,
    reviews: 532,
    badge: "무료배송",
    image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    name: "데일리 코튼 오버핏 셔츠",
    store: "스튜디오온",
    category: "fashion",
    price: 42900,
    discount: 24,
    rating: 4.6,
    reviews: 876,
    badge: "쿠폰",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 4,
    name: "휴대용 블루투스 스피커",
    store: "테크링크",
    category: "digital",
    price: 68900,
    discount: 31,
    rating: 4.9,
    reviews: 2214,
    badge: "랭킹",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 5,
    name: "저자극 수분 진정 세럼",
    store: "블룸랩",
    category: "beauty",
    price: 27900,
    discount: 15,
    rating: 4.8,
    reviews: 943,
    badge: "재구매",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 6,
    name: "프리미엄 원두 커피 500g",
    store: "빈브라운",
    category: "fresh",
    price: 36900,
    discount: 9,
    rating: 4.7,
    reviews: 661,
    badge: "신상",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 7,
    name: "모듈형 수납 바스켓 4종",
    store: "정리생활",
    category: "living",
    price: 19900,
    discount: 7,
    rating: 4.5,
    reviews: 394,
    badge: "실속",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 8,
    name: "초경량 무선 키보드",
    store: "키랩",
    category: "digital",
    price: 84200,
    discount: 22,
    rating: 4.9,
    reviews: 1518,
    badge: "베스트",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
  },
];

const DISQUS_SHORTNAME = "productbuilder-epvzedoqnl";

const state = {
  category: "all",
  query: "",
  price: "all",
  sort: "popular",
  wishlist: new Set(),
  cart: new Map(),
};

const productGrid = document.querySelector("#productGrid");
const resultCount = document.querySelector("#resultCount");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const cartPanel = document.querySelector("#cartPanel");
const backdrop = document.querySelector("#backdrop");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartSubtotal = document.querySelector("#cartSubtotal");
const shippingFee = document.querySelector("#shippingFee");
const cartTotal = document.querySelector("#cartTotal");

const formatWon = (value) => `${value.toLocaleString("ko-KR")}원`;

function getFilteredProducts() {
  return products
    .filter((product) => state.category === "all" || product.category === state.category)
    .filter((product) => {
      const haystack = `${product.name} ${product.store}`.toLowerCase();
      return haystack.includes(state.query.toLowerCase());
    })
    .filter((product) => {
      if (state.price === "under30000") return product.price <= 30000;
      if (state.price === "under70000") return product.price <= 70000;
      if (state.price === "over70000") return product.price >= 70000;
      return true;
    })
    .sort((a, b) => {
      if (state.sort === "low") return a.price - b.price;
      if (state.sort === "high") return b.price - a.price;
      if (state.sort === "rating") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });
}

function renderProducts() {
  const visibleProducts = getFilteredProducts();
  resultCount.textContent = `${visibleProducts.length}개`;
  emptyState.hidden = visibleProducts.length > 0;

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy" />
            <span class="badge">${product.badge}</span>
          </div>
          <div class="product-info">
            <span class="store-name">${product.store}</span>
            <h3>${product.name}</h3>
            <div class="meta">
              <span>★ ${product.rating}</span>
              <span>리뷰 ${product.reviews.toLocaleString("ko-KR")}</span>
            </div>
            <div class="price-row">
              <strong class="price">${formatWon(product.price)}</strong>
              <span class="discount">${product.discount}%</span>
            </div>
            <div class="card-actions">
              <button class="wish ${state.wishlist.has(product.id) ? "active" : ""}" type="button" data-wish="${product.id}" aria-label="찜하기">♡</button>
              <button class="add-cart" type="button" data-cart="${product.id}">담기</button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCart() {
  const entries = [...state.cart.entries()];
  const subtotal = entries.reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return sum + product.price * quantity;
  }, 0);
  const shipping = subtotal === 0 || subtotal >= 30000 ? 0 : 3000;
  const itemCount = entries.reduce((sum, [, quantity]) => sum + quantity, 0);

  cartCount.textContent = itemCount;
  cartSubtotal.textContent = formatWon(subtotal);
  shippingFee.textContent = formatWon(shipping);
  cartTotal.textContent = formatWon(subtotal + shipping);

  cartItems.innerHTML =
    entries.length === 0
      ? `<p class="empty-state">장바구니가 비어 있습니다.</p>`
      : entries
          .map(([id, quantity]) => {
            const product = products.find((item) => item.id === id);
            return `
              <article class="cart-item">
                <img src="${product.image}" alt="" />
                <div>
                  <h3>${product.name}</h3>
                  <strong>${formatWon(product.price)}</strong>
                </div>
                <div class="quantity" aria-label="${product.name} 수량">
                  <button type="button" data-decrease="${id}">−</button>
                  <span>${quantity}</span>
                  <button type="button" data-increase="${id}">+</button>
                </div>
              </article>
            `;
          })
          .join("");
}

function openCart() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
}

function loadDisqusComments() {
  if (!document.querySelector("#disqus_thread")) return;
  if (!DISQUS_SHORTNAME || DISQUS_SHORTNAME === "presson-demo") {
    document.querySelector("#disqus_thread").innerHTML =
      '<p class="empty-state">Disqus shortname을 설정하면 댓글이 표시됩니다.</p>';
    return;
  }

  window.disqus_config = function () {
    this.page.url = window.location.href;
    this.page.identifier = "presson-home";
  };

  const script = document.createElement("script");
  script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
  script.setAttribute("data-timestamp", String(Date.now()));
  document.body.appendChild(script);
}

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".category.active").classList.remove("active");
    button.classList.add("active");
    state.category = button.dataset.category;
    renderProducts();
  });
});

document.querySelector("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.query = searchInput.value.trim();
  renderProducts();
});

searchInput.addEventListener("input", () => {
  state.query = searchInput.value.trim();
  renderProducts();
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  renderProducts();
});

document.querySelectorAll('input[name="price"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    state.price = radio.value;
    renderProducts();
  });
});

productGrid.addEventListener("click", (event) => {
  const wishId = Number(event.target.dataset.wish);
  const cartId = Number(event.target.dataset.cart);

  if (wishId) {
    if (state.wishlist.has(wishId)) state.wishlist.delete(wishId);
    else state.wishlist.add(wishId);
    renderProducts();
  }

  if (cartId) {
    state.cart.set(cartId, (state.cart.get(cartId) || 0) + 1);
    renderCart();
    openCart();
  }
});

cartItems.addEventListener("click", (event) => {
  const increaseId = Number(event.target.dataset.increase);
  const decreaseId = Number(event.target.dataset.decrease);

  if (increaseId) {
    state.cart.set(increaseId, state.cart.get(increaseId) + 1);
  }

  if (decreaseId) {
    const nextQuantity = state.cart.get(decreaseId) - 1;
    if (nextQuantity <= 0) state.cart.delete(decreaseId);
    else state.cart.set(decreaseId, nextQuantity);
  }

  renderCart();
});

document.querySelector("#cartToggle").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

renderProducts();
renderCart();
loadDisqusComments();

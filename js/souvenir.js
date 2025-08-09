document.addEventListener('DOMContentLoaded', () => {
  // storage key
  const CART_KEY = 'cart';

  // read cart safely
  const getCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  };

  // write cart
  const setCart = (arr) => localStorage.setItem(CART_KEY, JSON.stringify(arr || []));

  // show total items on badges
  const updateBadges = () => {
    const total = getCart().reduce((sum, item) => sum + (item.qty || 0), 0);
    document.querySelectorAll('.cart-badge').forEach(badge => { badge.textContent = total; });
  };

  // read $ price from card
  const parsePriceFromCard = (card) => {
    const priceEl = card.querySelector('.price');
    if (!priceEl) return 0;
    const m = priceEl.textContent.match(/\$[\d,]+(?:\.\d{2})?/);
    return m ? parseFloat(m[0].replace(/[$,]/g, '')) : 0;
  };

  // read qty from input (default 1)
  const getQtyFromCard = (card) => {
    const input = card.querySelector('.qty-input');
    const val = parseInt(input?.value, 10);
    return Number.isFinite(val) && val > 0 ? val : 1;
  };

  // add or bump item in cart
  function addItemByCard(card, explicitQty) {
    if (!card) return null;
    const id    = card.dataset.id || 'unknown';
    const title = (card.querySelector('h3')?.textContent || id).trim();
    const price = parsePriceFromCard(card);
    const qty   = explicitQty ?? getQtyFromCard(card);

    const cart = getCart();
    const existing = cart.find(x => x.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ id, title, price, qty });

    setCart(cart);
    updateBadges();
    return { id, title, price, qty };
  }

  // global helper for inline onclick
  window.addToCart = function (id) {
    const card = document.querySelector(`.card[data-id="${id}"], .souvenir-item[data-id="${id}"]`);
    const info = addItemByCard(card);
    if (info) alert('Added ' + info.id + ' to cart');
  };

  // attach click handlers to add buttons (no inline)
  document.querySelectorAll('.card .btn, .souvenir-item .btn, .souvenir-item button').forEach(btn => {
    if (btn.hasAttribute('onclick')) return;
    btn.addEventListener('click', () => {
      const card = btn.closest('.card, .souvenir-item');
      const info = addItemByCard(card);
      if (info) alert(`Added ${info.qty} × "${info.title}" to cart.`);
    });
  });

  // image click -> modal open
  document.querySelectorAll('.card img, .souvenir-item img').forEach(img => {
    if (img.hasAttribute('onclick')) return;
    img.addEventListener('click', () => {
      if (typeof window.openModal === 'function') {
        window.openModal(img);
      } else {
        const modal    = document.getElementById('modal');
        const modalImg = document.getElementById('modal-img') || document.getElementById('modal-image');
        if (modal && modalImg) {
          modalImg.src = img.src;
          modalImg.alt = img.alt || '';
          modal.style.display = 'flex';
        }
      }
    });
  });

  // click outside to close modal
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (modal && e.target === modal) {
      if (typeof window.closeModal === 'function') window.closeModal();
      else modal.style.display = 'none';
    }
  });

  // initial badge sync
  updateBadges();
});
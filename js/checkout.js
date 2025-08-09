// checkout.js
document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'cart';
  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY)) || [];
  const setCart = arr => localStorage.setItem(CART_KEY, JSON.stringify(arr || []));

  // show total qty on badges
  const updateBadges = () => {
    const total = getCart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(b => (b.textContent = total));
  };

  // copy items before clearing
  const snapshot = getCart();

  // targets
  const tbody = document.getElementById('checkout-body');
  const totalDisplay = document.getElementById('checkout-total');
  const thankYouMsg = document.getElementById('thank-you-message');
  const orderTime = document.getElementById('order-time');

  if (!snapshot.length) {
    // empty state
    tbody.innerHTML = '<tr><td colspan="4">Your cart is empty.</td></tr>';
    totalDisplay.textContent = '$0.00';
    thankYouMsg.textContent = 'No items to display.';
    orderTime.textContent = '';
  } else {
    // build receipt rows
    let sum = 0;
    tbody.innerHTML = '';
    snapshot.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.title}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>${item.qty}</td>
        <td>$${(item.price * item.qty).toFixed(2)}</td>
      `;
      tbody.appendChild(row);
      sum += item.price * item.qty;
    });

    // totals + meta
    totalDisplay.textContent = `$${sum.toFixed(2)}`;
    thankYouMsg.textContent = 'Thank you for shopping at the East Asian History Museum!';
    orderTime.textContent = 'Order placed on: ' + new Date().toLocaleString();
  }

  // clear stored cart and reset badges
  setCart([]);
  updateBadges();
});

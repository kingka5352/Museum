document.addEventListener('DOMContentLoaded', () => {
  const CART_KEY = 'cart';
  const getCart = () => JSON.parse(localStorage.getItem(CART_KEY)) || [];

  // update badges with total qty
  const updateBadges = () => {
    const total = getCart().reduce((sum, i) => sum + i.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(b => (b.textContent = total));
  };
  updateBadges();

  // render table + grand total
  const cart = getCart();
  const tbody = document.getElementById('cart-body');
  const totalDisp = document.getElementById('grand-total');

  tbody.innerHTML = '';
  if (!cart.length) {
    // empty state
    tbody.innerHTML = '<tr><td colspan="5">Your cart is empty.</td></tr>';
    totalDisp.textContent = '$0.00';
  } else {
    // build rows
    let sum = 0;
    cart.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.title}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>${item.qty}</td>
        <td>$${(item.price * item.qty).toFixed(2)}</td>
        <td><button class="remove-btn" data-id="${item.id}">Remove</button></td>
      `;
      tbody.appendChild(row);
      sum += item.price * item.qty;
    });
    // show total
    totalDisp.textContent = `$${sum.toFixed(2)}`;
  }

  // remove item
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = getCart().filter(i => i.id !== btn.dataset.id);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      location.reload();
    });
  });

  // nav: back to shop
  document.getElementById('keep-shopping')?.addEventListener('click', () => {
    location.href = 'souvenir.html';
  });

  // nav: go to checkout
  document.getElementById('checkout')?.addEventListener('click', () => {
    location.href = 'checkout.html';
  });
});


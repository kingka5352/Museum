

(function(){
  'use strict';

  const CART_KEY = 'museumCartV1';

  function readCart(){

try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch(e){ return []; }
  }

  function writeCart(arr){
    try{

localStorage.setItem(CART_KEY, JSON.stringify(arr || []));

      localStorage.setItem('cart_ts', String(Date.now()));
    }catch(e){}
  }

  try {
if (sessionStorage.getItem('justCheckedOut') === '1') {

localStorage.setItem(CART_KEY, '[]');

      localStorage.setItem('cart_ts', String(Date.now()));

      sessionStorage.removeItem('justCheckedOut');

      const nodes = document.querySelectorAll('.cart-badge, #cart-count');

      nodes.forEach(n => { n.textContent = '0'; });
    }
  } catch(e){}

  function toHashPayload(arr){
    try {
      const obj = { items: arr, ts: Date.now() };

      const json = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(json)));
    } catch(e){ return ''; }
  }

  function refreshCartLink(){

    const a = document.querySelector('a.cart-link');
    if (!a) return;
    const arr = readCart();
    const hash = toHashPayload(arr);

    if (hash) a.href = 'cart.html#cart=' + hash;
  }

  function setCartBadgeCount(total){

    const nodes = document.querySelectorAll('.cart-badge, #cart-count');

    nodes.forEach(n => { n.textContent = String(total); });
  }

  window.addToCart = function(btn){
    const id = btn?.dataset?.id;
    const name = btn?.dataset?.name;
    const unitPrice = Number(btn?.dataset?.price || 0);
    const image = btn?.dataset?.image || '';

    let qty = 1;
    try {
      const card = btn.closest('.souvenir-item');
      const qtyInput = card?.querySelector('.qty-input');
      if (qtyInput) qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    } catch(e){}

    const cart = readCart();

    const idx = cart.findIndex(it => it && it.id === id);
    if (idx >= 0){

      cart[idx].qty = (parseInt(cart[idx].qty, 10) || 0) + qty;

      cart[idx].name = cart[idx].name || name;

      cart[idx].unitPrice = Number(cart[idx].unitPrice || unitPrice || 0);

      cart[idx].image = cart[idx].image || image;
    } else {

      cart.push({ id, name, unitPrice, qty, image });
    }

    writeCart(cart);

    try {
      const card = btn.closest('.souvenir-item');
      if (card){
        const badge = card.querySelector('.qty-badge');
        if (badge){

          const item = cart.find(it => it.id === id);

          badge.textContent = item ? `Qty: ${item.qty}` : '';
        }
      }
    } catch(e){}

    try {

      const total = cart.reduce((s,x)=> s + (parseInt(x.qty,10)||0), 0);

      setCartBadgeCount(total);
    } catch(e){}

    try { if (typeof window.showCartToast === 'function'){ window.showCartToast('Added ' + (name||'Item') + ' to cart'); } } catch(e){}

    try { refreshCartLink(); } catch(e){}
  };

  if (document.readyState === 'loading'){

    document.addEventListener('DOMContentLoaded', refreshCartLink, { once: true });
  } else {
    refreshCartLink();
  }
})();

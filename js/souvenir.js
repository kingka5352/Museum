

'use strict';

let __cart = [];
try { __cart = (typeof window.readCart==='function' ? window.readCart() :

  JSON.parse(

  localStorage.getItem('museumCartV1')) || []); } catch(e){ __cart = []; }
let __count = 0;
for (let i=0; i<__cart.length; i++){ __count += (__cart[i].qty || 0); }

let __badges = document.getElementsByClassName('cart-badge');

for (let b=0; b<__badges.length; b++){ __badges[b].textContent = __count; }

let __cards = document.getElementsByClassName('souvenir-item');
for (let c=0; c<__cards.length; c++){
  let card = __cards[c];
  let id = card.getAttribute('data-id') || '';
  let priceEl = card.querySelector('.price');
  if (!priceEl) continue;

  let badge = priceEl.querySelector('.qty-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'qty-badge';
    badge.setAttribute('aria-live','polite');
    priceEl.appendChild(badge);
  }
badge.setAttribute('data-item-id', id);

let q = 0;
for (let k=0; k<__cart.length; k++){ if (((__cart[k].id)||'') === id){ q = (__cart[k].qty||0); break; } }

badge.textContent = q>0 ? ('Qty: '+q) : '';
}

let minPx = 10;

let buttons = document.querySelectorAll('button[onclick*="addToCart"]');
for (let bi=0; bi<buttons.length; bi++){
  let btn = buttons[bi];
  try { btn.style.whiteSpace = 'nowrap'; } catch(e){}
  let style = window.getComputedStyle(btn);
  let base = parseFloat(style.fontSize) || 16;
  btn.style.fontSize = base + 'px';
  let guard = 20;
  while (btn.scrollWidth > btn.clientWidth && base > minPx && guard-- > 0){
    base -= 1;
    btn.style.fontSize = base + 'px';
  }
}

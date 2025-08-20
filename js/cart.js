

(function(){
  'use strict';

  const CART_KEY = 'museumCartV1';

  const TAX_RATE = 0.102;

  const SHIPPING_RATE = 25.00;

  const FREE_SHIP_THRESHOLD = 100.00;
  const MEMBER_DISCOUNT_RATE = 0.15;
  const VOLUME_DISCOUNT_TIERS = [
    { min: 200, rate: 0.15 },
    { min: 100, rate: 0.10 },
    { min:  50, rate: 0.05 },
    { min:   0, rate: 0.00 },
  ];
;
  const IMAGE_MAP = {
    'item001': '../images/souvenir/souvenir1.png',
    'item002': '../images/souvenir/souvenir2.png',
    'item003': '../images/souvenir/souvenir3.png',
    'item004': '../images/souvenir/souvenir4.png',
    'item005': '../images/souvenir/souvenir5.png',
    'item006': '../images/souvenir/souvenir6.png'
  };

  function money(n){
    const v = Number(n || 0);
    const abs = Math.abs(v).toFixed(2);
    return v < 0 ? `($${abs})` : `$${abs}`;
  }

  function readCart(){
    try{

const s = localStorage.getItem(CART_KEY) || '[]';

      return JSON.parse(s) || [];
    }catch(e){ return []; }
  }

  function writeCart(arr){
    try{

localStorage.setItem(CART_KEY, JSON.stringify(arr || []));

      localStorage.setItem('cart_ts', String(Date.now()));
    }catch(e){}
  }

  function volumeRate(subtotal){
    for (const t of VOLUME_DISCOUNT_TIERS) {

      if (subtotal >= t.min) return t.rate;
    }
    return 0.00;
  }

  function normalizedItems(raw){
    return (raw || []).filter(Boolean).map((it) => {
      const out = Object.assign({}, it);
      out.name = out.name || out.title || out.id || 'Item';
      out.id = out.id || out.name;
      let up = out.unitPrice != null ? out.unitPrice : out.price;
      if (typeof up === 'string'){
        const m = up.replace(/,/g,'').match(/\$?(\d+(?:\.\d{1,2})?)/);
        up = m ? parseFloat(m[1]) : 0;
      }
      out.unitPrice = Number(up) || 0;
      out.image = out.image || out.img || (IMAGE_MAP[out.id] || '');
      out.qty = Math.max(0, parseInt(out.qty, 10) || 0);
      return out;
    }).filter(x => x.unitPrice > 0 && x.qty > 0);
  }

  function setKeepShoppingHref(){
    const ks = document.getElementById('keep-shopping') || document.getElementById('keepShopping');
    if (ks && !ks.getAttribute('href')) ks.setAttribute('href', 'shop.html');
  }

  function updateFreeShip(discountedSubtotal){
    if (typeof window.updateFreeShipBadge === 'function'){
      window.updateFreeShipBadge(discountedSubtotal);
    } else {
      const badge = document.getElementById('free-ship-badge');
      if (badge){

        const TH = FREE_SHIP_THRESHOLD;
        if (discountedSubtotal >= TH){

          badge.textContent = 'Free shipping applied.';
        } else {
          const remain = Math.max(0, TH - discountedSubtotal);

          badge.textContent = 'Spend $' + remain.toFixed(2) + ' more for free shipping.';
        }
      }
    }
  }

  function render(){

    const tbody = document.getElementById('cart-body');
    const emptyMsg = document.getElementById('empty-msg');
    const memberBox = document.getElementById('member-toggle') || document.getElementById('memberToggle');
    const summaryBody = document.getElementById('summary-body');
    const summaryText = document.getElementById('summary');

    let items = normalizedItems(readCart());

    if (tbody) tbody.innerHTML = '';

    if (!items.length){
      if (emptyMsg) emptyMsg.hidden = false;
      if (summaryBody){

        summaryBody.innerHTML = '';
        [
          ['Subtotal of ItemTotals', 0],
          ['Volume Discount', 0],
          ['Member Discount', 0],
          ['Shipping', 0],
          ['Subtotal (Taxable amount)', 0],

          ['Tax Rate %', (TAX_RATE * 100).toFixed(1) + '%'],
          ['Tax Amount', 0],
          ['Invoice Total', 0],
].forEach(([label, val]) => {
          const tr = document.createElement('tr');
const tdThumb = document.createElement('td'); tdThumb.className='thumb';
        let src = it.image || (IMAGE_MAP[it.id] || '');
        if (src){
          const img = document.createElement('img');
          img.src = src; img.alt = it.name || 'Item';
          img.width = 48; img.height = 48;
          tdThumb.appendChild(img);
        }
        tr.appendChild(tdThumb);

          const tdL = document.createElement('td'); tdL.textContent = label;
          const tdR = document.createElement('td');

          tdR.className = 'num'; tdR.textContent = (typeof val === 'string') ? val : money(val);
          tdR.style.textAlign = 'right';
          tr.appendChild(tdL); tr.appendChild(tdR);
          summaryBody.appendChild(tr);
        });
      } else if (summaryText){
        const L = [
          ['Subtotal of ItemTotals', 0],
          ['Volume Discount', 0],
          ['Member Discount', 0],
          ['Shipping', 0],
          ['Subtotal (Taxable amount)', 0],

          ['Tax Rate %', (TAX_RATE * 100).toFixed(1) + '%'],
          ['Tax Amount', 0],
          ['Invoice Total', 0],
        ];

        summaryText.textContent = L.map(([label,val]) => `${label}: ${typeof val==='string'?val:money(val)}`).join('\n');
        summaryText.hidden = false;
      }
      updateFreeShip(0);
      setCartBadgeCount(0);
      if (typeof window.updateCartBadges === 'function') window.updateCartBadges();
      return;
    }

    if (emptyMsg) emptyMsg.hidden = true;

    if (tbody){
      items.forEach((it) => {

        const tr = document.createElement('tr');

        const tdThumb = document.createElement('td'); tdThumb.className = 'thumb';
        let _src = it.image || (IMAGE_MAP[it.id] || '');
        if (_src){
          const _img = document.createElement('img');
          _img.src = _src; _img.alt = it.name || 'Item';
          _img.width = 48; _img.height = 48;
          _img.className = 'thumb';
          tdThumb.appendChild(_img);
        }
        tr.appendChild(tdThumb);
const tdName = document.createElement('td');

        const nm = document.createElement('div'); nm.textContent = it.name; nm.className = 'item-name';
        tdName.appendChild(nm);

        tr.appendChild(tdName);

        const tdUnit = document.createElement('td');

        tdUnit.textContent = money(it.unitPrice);
        tdUnit.style.textAlign = 'right';
        tr.appendChild(tdUnit);

        const tdQty = document.createElement('td');
        tdQty.style.textAlign = 'right';
        const wrap = document.createElement('div'); wrap.className = 'qty-control';

        const btnMinus = document.createElement('button'); btnMinus.type='button'; btnMinus.textContent = '−';

        const inp = document.createElement('input'); inp.type='number'; inp.min='1'; inp.value = String(it.qty); inp.className='cart-qty-input';

        const btnPlus = document.createElement('button'); btnPlus.type='button'; btnPlus.textContent = '+';

        function commitQty(v){
          let q = parseInt(v, 10); if (!isFinite(q) || q < 1) q = 1;
          const arr = readCart().map(x => (x && x.id === it.id) ? Object.assign({}, x, { qty: q }) : x);
          writeCart(arr); render();
        }

btnMinus.addEventListener('click', () => commitQty(it.qty - 1));

        btnPlus.addEventListener('click',  () => commitQty(it.qty + 1));

        inp.addEventListener('change',     () => commitQty(inp.value));

        wrap.appendChild(btnMinus); wrap.appendChild(inp); wrap.appendChild(btnPlus);
        tdQty.appendChild(wrap);
        tr.appendChild(tdQty);

        const tdLine = document.createElement('td');

        tdLine.textContent = money(it.unitPrice * it.qty);
        tdLine.style.textAlign = 'right';
        tr.appendChild(tdLine);

        const tdAct = document.createElement('td');
        tdAct.style.textAlign = 'right';

        const btn = document.createElement('button'); btn.type='button'; btn.textContent = 'Remove';

        btn.addEventListener('click', () => {
          const arr = readCart().filter(x => x && x.id !== it.id);
          writeCart(arr); render();
        });
        tdAct.appendChild(btn);
        tr.appendChild(tdAct);

        tbody.appendChild(tr);
      });
    }

    const totalQty = items.reduce((s,x)=> s + x.qty, 0);
    setCartBadgeCount(totalQty);

    const itemTotal = items.reduce((s,x)=> s + x.unitPrice * x.qty, 0);
    const memCandidate = (memberBox && memberBox.checked) ? itemTotal * MEMBER_DISCOUNT_RATE : 0;
    const volCandidate = itemTotal * volumeRate(itemTotal);

    let choice = null; try { choice = localStorage.getItem('discount_choice'); } catch(e){}
    let memberDiscount = 0, volumeDiscount = 0;
    if (choice === 'member') {
      memberDiscount = memCandidate; volumeDiscount = 0;
    } else if (choice === 'volume') {
      memberDiscount = 0; volumeDiscount = volCandidate;
    } else {
      if (memberBox && memberBox.checked) { memberDiscount = memCandidate; choice = 'member'; }
      else { volumeDiscount = volCandidate; choice = 'volume'; }

try { localStorage.setItem('discount_choice', choice); } catch(e){}
    }
    const discounted = itemTotal - (memberDiscount + volumeDiscount);

    const shippingCharge = discounted >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_RATE;
    updateFreeShip(discounted);

    const taxableSubtotal = discounted + shippingCharge;

    const taxAmount = taxableSubtotal * TAX_RATE;
    const invoiceTotal = taxableSubtotal + taxAmount;

    const rows = [
      ['Subtotal of ItemTotals', itemTotal],
      ['Volume Discount', -volumeDiscount],
      ['Member Discount', -memberDiscount],
      ['Shipping', shippingCharge],
      ['Subtotal (Taxable amount)', taxableSubtotal],

      ['Tax Rate %', (TAX_RATE * 100).toFixed(1) + '%'],
      ['Tax Amount', taxAmount],
      ['Invoice Total', invoiceTotal],
    ];

    if (summaryBody){

      summaryBody.innerHTML = '';
      rows.forEach(([label, val]) => {
        const tr = document.createElement('tr');

        const tdL = document.createElement('td'); tdL.textContent = label;
        const tdR = document.createElement('td');

        tdR.className = 'num'; if (typeof val === 'string'){ tdR.textContent = val; }

        else { tdR.textContent = money(val); tdR.style.textAlign = 'right'; }
        tr.appendChild(tdL); tr.appendChild(tdR);
        summaryBody.appendChild(tr);
      });
    } else if (summaryText){

      summaryText.textContent = rows.map(([label,val]) => `${label}: ${typeof val==='string'?val:money(val)}`).join('\n');
      summaryText.hidden = false;
    }

    if (typeof window.updateCartBadges === 'function') window.updateCartBadges();
  }

  document.addEventListener('DOMContentLoaded', function(){
    setKeepShoppingHref();

    const clearBtn = document.getElementById('clear-cart') || document.getElementById('clearBtn') || document.getElementById('clear-btn');
    if (clearBtn){

clearBtn.addEventListener('click', function(){
        writeCart([]);
        setCartBadgeCount(0);

        try{ localStorage.removeItem('discount_choice'); }catch(e){}; try{ sessionStorage.removeItem('discountChoice'); }catch(e){};
        render();
      });
    }
    const memberBox = document.getElementById('member-toggle') || document.getElementById('memberToggle');
    if (memberBox) {
      try {

let dc = localStorage.getItem('discount_choice');
        memberBox.checked = (dc === 'member');
      } catch(e){}

      memberBox.addEventListener('change', function(){
      if (this.checked) {

        let ans = (prompt("Only one discount may be applied. Type 'M' for Member or 'V' for Volume:") || '').trim().toUpperCase();
        if (ans === 'M') {

          try { localStorage.setItem('discount_choice','member'); } catch(e){}
          this.checked = true;
        } else if (ans === 'V') {

          try { localStorage.setItem('discount_choice','volume'); } catch(e){}
          this.checked = false;
        } else {

let prev = null; try{ prev = localStorage.getItem('discount_choice'); }catch(e){}
          if (prev === 'volume') { this.checked = false; }

          else { this.checked = true; try{ localStorage.setItem('discount_choice','member'); }catch(e){} }
        }
      } else {

        try { localStorage.setItem('discount_choice','volume'); } catch(e){}
      }
      render();
    });
}

    render();
  });

  window.__cart_render = render;
})();

  function setCartBadgeCount(n){

    let badge = document.getElementById('cart-count');

    if (badge){ badge.textContent = String(n); }
    if (typeof window.updateCartBadges === 'function'){ try{ window.updateCartBadges(); }catch(e){} }
  }

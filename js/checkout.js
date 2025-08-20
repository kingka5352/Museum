

document.addEventListener('DOMContentLoaded', function(){
  'use strict';

  let CART_KEY = 'museumCartV1';

  let TAX_RATE = 0.102;
  let SHIPPING_RATE = 25.00;

  let FREE_SHIP_THRESHOLD = 100.00;
  let MEMBER_DISCOUNT_RATE = 0.15;

  function volumeRate(itemTotal){
    if (itemTotal >= 200) return 0.15;
    if (itemTotal >= 100) return 0.10;
    if (itemTotal >= 50)  return 0.05;
    return 0.0;
  }

  function readCart(){

try { let raw = localStorage.getItem(CART_KEY); let arr = raw? JSON.parse(raw): []; return Array.isArray(arr)? arr: []; } catch(e){ return []; }
  }

  function setBadges(n){

    try { (document.querySelectorAll('.cart-badge, #cart-count')||[]).forEach(function(el){ el.textContent = String(n); }); } catch(e){}
  }

  function render(){
    let items = (readCart()||[]).filter(Boolean).map(function(it){
      let out = Object.assign({}, it);
      let up = out.unitPrice != null ? out.unitPrice : out.price;
      if (typeof up === 'string') { let m = up.replace(/,/g,'').match(/\$?(\d+(?:\.\d{1,2})?)/); up = m ? parseFloat(m[1]) : 0; }
      out.unitPrice = Number(up)||0;
      let q = out.qty != null ? out.qty : out.quantity; q = Number(q); if (!isFinite(q) || q <= 0) q = 1;
      out.qty = q;
      out.name = out.name || out.id || 'Item';
      out.id = out.id || out.name;
      out.image = out.image || out.img || '';
      return out;
    }).filter(function(x){ return x.unitPrice > 0 && x.qty > 0; });

    let totalQty = items.reduce(function(s,x){ return s + (x.qty||0); }, 0);
    setBadges(totalQty);
    if (!items.length) {
      let tbody = document.getElementById('checkout-body');

      if (tbody) tbody.innerHTML = '';
      let em = document.getElementById('empty-msg');
      if (!em) {
        try {
          em = document.createElement('div');
          em.id = 'empty-msg';
          em.className = 'empty-msg';

          em.textContent = 'Your cart is empty.';
          let container = document.querySelector('.container') || document.body;
          if (container.firstChild) container.insertBefore(em, container.firstChild);
          else container.appendChild(em);
        } catch(e){}
      } else { em.style.display = ''; }
      let sbody = document.getElementById('summary-body');
      let summaryText = document.getElementById('summary');
      let L = [
        ['Subtotal of Items', 0],
        ['Volume Discount', 0],
        ['Member Discount', 0],
        ['Shipping', 0],
        ['Subtotal (Taxable)', 0],

        ['Tax Rate', (TAX_RATE*100).toFixed(1) + '%'],
        ['Tax Amount', 0],
        ['Invoice Total', 0]
      ];
      if (sbody){

        sbody.innerHTML = '';
        L.forEach(function(pair){
          let tr = document.createElement('tr');

          let tdL = document.createElement('td'); tdL.textContent = pair[0];
          let tdR = document.createElement('td');
          let val = pair[1];

          if (typeof val === 'string'){ tdR.textContent = val; }

          else { let n = Number(val)||0; tdR.textContent = (n<0?'(':'') + '$' + Math.abs(n).toFixed(2) + (n<0?')':''); tdR.style.textAlign='right'; }
          tr.appendChild(tdL); tr.appendChild(tdR); sbody.appendChild(tr);
        });
      } else if (summaryText){
        let txt2 = L.map(function(pair){ let val = pair[1]; return (typeof val==='string') ? (pair[0]+': '+val) : (pair[0]+': $'+Number(val||0).toFixed(2)); }).join('\n');

        summaryText.textContent = txt2;
      }

      let ot = document.getElementById('order-time'); if (ot){ try{ ot.textContent = new Date().toLocaleString(); }catch(e){} }
      return;
    }

    let tbody = document.getElementById('checkout-body');
    if (tbody){

      tbody.innerHTML = '';
      items.forEach(function(it){
        let tr = document.createElement('tr');

        let tdThumb = document.createElement('td');
        if (it.image){ let img = document.createElement('img'); img.src = it.image; img.alt = it.name; img.width = 48; img.height = 48; tdThumb.appendChild(img); }
        tr.appendChild(tdThumb);

        let tdName = document.createElement('td'); tdName.textContent = it.name; tr.appendChild(tdName);

        let tdUnit = document.createElement('td'); tdUnit.textContent = '$' + it.unitPrice.toFixed(2); tdUnit.style.textAlign='right'; tr.appendChild(tdUnit);

        let tdQty = document.createElement('td'); tdQty.textContent = String(it.qty); tdQty.style.textAlign='right'; tr.appendChild(tdQty);

        let tdLine = document.createElement('td'); tdLine.textContent = '$' + (it.unitPrice*it.qty).toFixed(2); tdLine.style.textAlign='right'; tr.appendChild(tdLine);

        tbody.appendChild(tr);
      });
    }

    let itemTotal = items.reduce(function(s,x){ return s + x.unitPrice * x.qty; }, 0);
    let vol = volumeRate(itemTotal);

    let memberChoice = null; try { memberChoice = localStorage.getItem('discount_choice'); } catch(e){}
    let volDiscount = 0, memberDiscount = 0;
    if (memberChoice === 'member') {
      memberDiscount = itemTotal * MEMBER_DISCOUNT_RATE;
      volDiscount = 0;
    } else {
      volDiscount = itemTotal * vol;
      memberDiscount = 0;

      try { localStorage.setItem('discount_choice', 'volume'); } catch(e) {}
    }

    let discounted = itemTotal - volDiscount - memberDiscount;

    let shipping = (discounted >= FREE_SHIP_THRESHOLD) ? 0 : SHIPPING_RATE;
    let taxable = discounted + shipping;

    let taxAmt = taxable * TAX_RATE;
    let invoiceTotal = taxable + taxAmt;

    let sbody = document.getElementById('summary-body');
    let summaryText = document.getElementById('summary');
    let L = [
      ['Subtotal of Items', itemTotal],
      ['Volume Discount', -volDiscount],
      ['Member Discount', -memberDiscount],
      ['Shipping', shipping],
      ['Subtotal (Taxable)', taxable],

      ['Tax Rate', (TAX_RATE*100).toFixed(1) + '%'],
      ['Tax Amount', taxAmt],
      ['Invoice Total', invoiceTotal]
    ];
    if (sbody){

      sbody.innerHTML = '';
      L.forEach(function(pair){
        let tr = document.createElement('tr');

        let tdL = document.createElement('td'); tdL.textContent = pair[0];
        let tdR = document.createElement('td');
        let val = pair[1];

        if (typeof val === 'string'){ tdR.textContent = val; }

        else { let n = Number(val)||0; tdR.textContent = (n<0?'(':'')+'$'+Math.abs(n).toFixed(2)+(n<0?')':''); tdR.style.textAlign='right'; }
        tr.appendChild(tdL); tr.appendChild(tdR); sbody.appendChild(tr);
      });
    } else if (summaryText){
      let txt = L.map(function(pair){ let val = pair[1]; return typeof val === 'string' ? (pair[0]+': '+val) : (pair[0]+': $'+Number(val||0).toFixed(2)); }).join('\n');

      summaryText.textContent = txt;
    }

    let ot = document.getElementById('order-time'); if (ot){ try { ot.textContent = new Date().toLocaleString(); } catch(e){} }
  }

  function clearForShop(){
    try {

localStorage.setItem(CART_KEY, '[]');

      localStorage.setItem('cart_ts', String(Date.now()));

      localStorage.removeItem('discount_choice');

      sessionStorage.setItem('justCheckedOut', '1');
    } catch(e){}
    setBadges(0);
  }

  let back = document.getElementById('back-to-shop');

  if (back){ back.addEventListener('click', function(){ clearForShop(); }); }

document.addEventListener('click', function(e){
    let a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    let href = (a.getAttribute('href')||'')+'';
    if (/shop\.html(\?|#|$)/i.test(href)){ clearForShop(); }
  }, true);

  let printBtn = document.getElementById('print-invoice');

  if (printBtn){ printBtn.addEventListener('click', function(ev){ ev.preventDefault(); try{ window.print(); }catch(e){} }); }

  render();
});

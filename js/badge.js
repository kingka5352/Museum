

(function(){
  'use strict';

  function readArr(){
    try {

let raw = localStorage.getItem('museumCartV1');

      let arr = JSON.parse(raw || '[]');
      if (!Array.isArray(arr)) return [];
      return arr.filter(Boolean);
    } catch(e){ return []; }
  }

  function count(arr){
    let n=0; for (let i=0;i<arr.length;i++){ n += (arr[i] && arr[i].qty? Number(arr[i].qty) : 0); }
    return n || 0;
  }

  function setBadges(n){

    let nodes = document.querySelectorAll('.cart-badge, #cart-count');

    for (let i=0;i<nodes.length;i++){ nodes[i].textContent = String(n); }
  }
  try { setBadges(count(readArr())); } catch(e){ setBadges(0); }
})();

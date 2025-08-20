

(function(){

  const modal = document.getElementById('img-modal');

  if (!modal) return;

  const modalImg  = document.getElementById('img-modal-img');

  const captionEl = document.getElementById('img-modal-caption');
  let lastTrigger = null;

  function getCaptionFrom(el){
    if (!el) return '';
    return el.getAttribute('data-caption') || el.getAttribute('title') || el.getAttribute('alt') || '';
  }

  window.openImgModal = function(imgEl){
    if (!imgEl || !modalImg) return;
    modalImg.src = imgEl.src;
    modalImg.alt = imgEl.alt || '';
    const txt = getCaptionFrom(imgEl);
    if (captionEl){
      let decoded = txt
  .replaceAll('&amp;','&')
  .replaceAll('&lt;','<')
  .replaceAll('&gt;','>');
decoded = decoded.replace(/(<strong>\s*Function\s*<\/strong>)/i, '<br>$1');
decoded = decoded.replace(/\r?\n/g, '<br>');

captionEl.innerHTML = decoded;
      captionEl.style.display = txt ? '' : 'none';
    }

    modal.style.display = 'block';

    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    lastTrigger = imgEl;
  };

  window.closeImgModal = function(){

    modal.style.display = 'none';

    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';

    if (captionEl) captionEl.textContent = '';
    if (modalImg) { modalImg.src = ''; modalImg.alt = ''; }

    try { if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus(); } catch(e){}
    lastTrigger = null;
  };

  modal.addEventListener('click', function(e){

    if (e.target === modal || (e.target.classList && e.target.classList.contains('close'))) {
      window.closeImgModal();
    }
  });

  document.addEventListener('keydown', function(e){

    if (e.key === 'Escape' && modal.style.display === 'block') window.closeImgModal();
  });

  let cls = document.body && document.body.classList;
  let shouldOverride = cls && (cls.contains('staff-page') || cls.contains('souvenir-page') || cls.contains('exhibition-page'));
  if (shouldOverride) {
    window.openModal = window.openImgModal;
    window.closeModal = window.closeImgModal;
  }

  if (typeof window.openModal !== 'function') window.openModal = window.openImgModal;
  if (typeof window.closeModal !== 'function') window.closeModal = window.closeImgModal;
})();

// grab modal parts
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const captionEl = document.getElementById('modal-caption');

// open it
window.openModal = (img) => {
  modalImg.src = img.src;
  captionEl.textContent = img.title || img.alt;
  modal.style.display = 'flex';
};

// close it
window.closeModal = () => {
  modal.style.display = 'none';
};

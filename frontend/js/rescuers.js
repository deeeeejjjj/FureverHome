function filterRescuers(loc, btn) {
  document.querySelectorAll('.rf-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.rescuer-item').forEach(function(item) {
    item.style.display = (loc === 'all' || item.dataset.loc === loc) ? '' : 'none';
  });
}

function submitRescuer(e) {
  e.preventDefault();
  var toast = document.getElementById('toast');
  var msg   = document.getElementById('toastMsg');
  if (msg) msg.textContent = '🐾 Application submitted! We will review it within 3 business days.';
  if (toast) {
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, 4000);
  }
  e.target.reset();
}
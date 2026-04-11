/* ── Inline critical functions (guaranteed to load) ── */
function selectAmount(btn, amount) {
  document.querySelectorAll('.btn-amount').forEach(function(b){ b.classList.remove('active-amt'); });
  btn.classList.add('active-amt');
  var el = document.getElementById('donationAmt');
  if (el) el.textContent = amount.toLocaleString('en-PH');
  var ci = document.getElementById('customAmt');
  if (ci) ci.value = '';
}
function applyCustomAmount(val) {
  var n = parseInt(val, 10);
  document.querySelectorAll('.btn-amount').forEach(function(b){ b.classList.remove('active-amt'); });
  var el = document.getElementById('donationAmt');
  if (el) el.textContent = (!isNaN(n) && n > 0) ? n.toLocaleString('en-PH') : '0';
}
function confirmCustomAmount() {
  var input = document.getElementById('customAmt');
  var val = parseInt(input ? input.value : '', 10);
  if (!val || val < 1) { alert('Please enter a valid amount.'); return; }
  document.querySelectorAll('.btn-amount').forEach(function(b){ b.classList.remove('active-amt'); });
  var el = document.getElementById('donationAmt');
  if (el) el.textContent = val.toLocaleString('en-PH');
  var toast = document.getElementById('toast');
  var msg = document.getElementById('toastMsg');
  if (toast && msg) { msg.textContent = 'Amount set to ₱' + val.toLocaleString('en-PH') + ' ✓'; toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); }, 3000); }
}
function toggleFav(btn) {
  var card = btn.closest('.pet-card') || btn.closest('.pcard');
  var nameEl = card && (card.querySelector('.pcard-name') || card.querySelector('.pet-name'));
  var petName = nameEl ? nameEl.textContent.trim() : 'Pet';
  var icon = btn.querySelector('i');
  var isActive = btn.classList.toggle('active');
  icon.className = isActive ? 'bi bi-heart-fill' : 'bi bi-heart';
  var toast = document.getElementById('toast');
  var msg = document.getElementById('toastMsg');
  if (toast && msg) { msg.textContent = isActive ? '❤️ ' + petName + ' saved!' : 'Removed from favorites.'; toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); }, 3000); }
}
function activateCat(e, id) {
  document.querySelectorAll('.category-card').forEach(function(c){ c.classList.remove('active-cat'); });
  var card = document.getElementById(id);
  if (card) card.classList.add('active-cat');
}
/* ── Testimonial hover switching ── */
function highlightTesti(hoveredCard) {
  var all = document.querySelectorAll('#testiRow .testi-card');
  all.forEach(function(card) {
    if (card === hoveredCard) {
      // Promote to gold
      card.classList.add('featured-testi');
      card.classList.remove('testi-dimmed');
    } else {
      // Remove gold, dim the rest
      card.classList.remove('featured-testi');
      card.classList.add('testi-dimmed');
    }
  });
}

function resetTesti() {
  var all = document.querySelectorAll('#testiRow .testi-card');
  // Restore original: middle card (index 1) gets gold, others normal
  all.forEach(function(card, i) {
    card.classList.remove('testi-dimmed');
    if (i === 1) {
      card.classList.add('featured-testi');
    } else {
      card.classList.remove('featured-testi');
    }
  });
}

/* ── Step card hover switching ── */
function highlightStep(hoveredCard) {
  var all = document.querySelectorAll('#stepsRow .step-v2-card');
  all.forEach(function(card) {
    if (card === hoveredCard) {
      // Remove all variants, apply active highlight
      card.classList.remove('sv2-dimmed');
      // If it's not already the dark card, promote it
      if (!card.classList.contains('sv2-dark')) {
        card.classList.add('sv2-accent');
      }
    } else {
      card.classList.remove('sv2-accent');
      card.classList.add('sv2-dimmed');
    }
  });
}

function resetStep() {
  var all = document.querySelectorAll('#stepsRow .step-v2-card');
  all.forEach(function(card, i) {
    card.classList.remove('sv2-dimmed');
    // Restore original state: only step 2 (index 1) gets sv2-accent by default
    if (i === 1) {
      card.classList.add('sv2-accent');
    } else if (!card.classList.contains('sv2-dark')) {
      card.classList.remove('sv2-accent');
    }
  });
}

/* ── Step card hover — move dark green highlight ── */
function highlightStep(hoveredCard) {
  var all = document.querySelectorAll('#stepsRow .step-v2-card');
  all.forEach(function(card) {
    card.classList.remove('sv2-dark');
  });
  hoveredCard.classList.add('sv2-dark');
}

function resetStep() {
  var all = document.querySelectorAll('#stepsRow .step-v2-card');
  all.forEach(function(card) {
    card.classList.remove('sv2-dark');
  });
  // No default — all cards rest with the green glow outline
}

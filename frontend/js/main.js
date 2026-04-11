/* ============================================================
   FUREVER HOME — Main JavaScript v2
   Marinduque Pet Adoption Platform
   ============================================================ */

// ===== FAVORITES =====
function toggleFav(btn) {
  const card = btn.closest('.pet-card') || btn.closest('.pcard');
  const petName = card?.querySelector('.pet-name, .pcard-name')?.textContent?.trim() || 'Pet';
  const icon = btn.querySelector('i');
  const isActive = btn.classList.toggle('active');
  icon.className = isActive ? 'bi bi-heart-fill' : 'bi bi-heart';
  showToast(isActive ? `❤️ ${petName} saved to favorites!` : `Removed from favorites.`);
}

// ===== TOAST =====
function showToast(message, type = 'default') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMsg');
  if (!toast || !msg) return;
  msg.textContent = message;
  toast.style.background = type === 'error' ? '#c53030' : 'var(--dark-green)';
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ===== DONATION =====
function selectAmount(btn, amount) {
  // Remove active class from ALL preset buttons first
  document.querySelectorAll('.btn-amount').forEach(b => {
    b.classList.remove('active-amt');
    b.removeAttribute('style'); // clear any inline style overrides
  });
  // Apply active to clicked button
  btn.classList.add('active-amt');
  // Update display total
  const el = document.getElementById('donationAmt');
  if (el) el.textContent = amount.toLocaleString();
  // Clear custom input so it doesn't override
  const customInput = document.getElementById('customAmt');
  if (customInput) customInput.value = '';
}

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.fh-navbar');
  if (nav) nav.style.boxShadow = window.scrollY > 20 ? '0 4px 30px rgba(0,0,0,0.25)' : '0 2px 20px rgba(0,0,0,0.15)';
}, { passive: true });

// ===== SCROLL ANIMATIONS =====
const animObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 80);
      animObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

// ===== IMAGE PREVIEW =====
function initImagePreviews() {
  document.querySelectorAll('input[type="file"][accept*="image"]').forEach(input => {
    input.addEventListener('change', function () {
      const file = this.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        let preview = this.parentElement.querySelector('.upload-preview');
        if (!preview) {
          preview = document.createElement('img');
          preview.className = 'upload-preview mt-2';
          preview.style.cssText = 'width:80px;height:80px;object-fit:cover;border:2px solid var(--gold);border-radius:8px;display:block';
          this.insertAdjacentElement('afterend', preview);
        }
        preview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  });
}

// ===== IMAGE FALLBACKS =====
function initImageFallbacks() {
  document.querySelectorAll('.pet-img').forEach(img => {
    img.addEventListener('error', function () {
      this.src = 'https://via.placeholder.com/500x320/e8f2ef/1a3c34?text=' + encodeURIComponent(this.alt || 'Pet');
    });
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Animate cards
  document.querySelectorAll('.pet-card,.step-card,.tip-card,.testi-card,.stat-box,.shelter-card,.category-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    animObs.observe(el);
  });
  initImagePreviews();
  initImageFallbacks();
});

// ===== CATEGORY CARD TOGGLE =====
function activateCat(e, id) {
  // Don't prevent navigation — just update visual state instantly
  document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active-cat'));
  const card = document.getElementById(id);
  if (card) card.classList.add('active-cat');
}

// ===== CUSTOM DONATION AMOUNT =====
function applyCustomAmount(val) {
  const n = parseInt(val);
  if (!isNaN(n) && n > 0) {
    // Deactivate all preset buttons when typing custom
    document.querySelectorAll('.btn-amount').forEach(b => {
      b.classList.remove('active-amt');
      b.removeAttribute('style');
    });
    const el = document.getElementById('donationAmt');
    if (el) el.textContent = n.toLocaleString();
  } else if (val === '' || val === '0') {
    // If cleared, revert display to 0
    const el = document.getElementById('donationAmt');
    if (el) el.textContent = '0';
  }
}

function confirmCustomAmount() {
  const input = document.getElementById('customAmt');
  const val = parseInt(input?.value);
  if (!val || val < 1) { showToast('Please enter a valid amount.', 'error'); return; }
  document.querySelectorAll('.btn-amount').forEach(b => {
    b.classList.remove('active-amt');
    b.removeAttribute('style');
  });
  const el = document.getElementById('donationAmt');
  if (el) el.textContent = val.toLocaleString();
  showToast('Amount set to ₱' + val.toLocaleString() + ' ✓');
}

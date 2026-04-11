function submitContact(e) {
  e.preventDefault();
  var name    = document.getElementById('cName').value.trim();
  var email   = document.getElementById('cEmail').value.trim();
  var topic   = document.getElementById('cTopic').value;
  var message = document.getElementById('cMessage').value.trim();
  var consent = document.getElementById('cConsent').checked;

  if (!name || !email || !topic || !message || !consent) {
    var toast = document.getElementById('toast');
    var msg   = document.getElementById('toastMsg');
    msg.textContent = 'Please fill in all required fields.';
    toast.style.background = '#c53030';
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); toast.style.background=''; }, 3500);
    return;
  }
  var toast = document.getElementById('toast');
  var msg   = document.getElementById('toastMsg');
  msg.textContent = '✅ Message sent! We will get back to you soon.';
  toast.style.background = '';
  toast.classList.add('show');
  setTimeout(function(){ toast.classList.remove('show'); }, 3500);
  e.target.reset();
}

function subscribeNewsletter() {
  var input = document.querySelector('.newsletter-input');
  if (!input || !input.value.includes('@')) {
    if (typeof showToast === 'function') showToast('Please enter a valid email address.', 'error');
    return;
  }
  if (typeof showToast === 'function') showToast('🎉 Subscribed! Watch your inbox for updates.');
  input.value = '';
}
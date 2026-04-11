/* ═══════════════════════════════════════════════
   register.js — Furever Home Registration
   DB Integration: replace API_BASE with your
   actual C# ASP.NET Core API URL
   ═══════════════════════════════════════════════ */

const API_BASE_REG = '/api';

// ── HELPERS ─────────────────────────────────────
function showRegAlert(message, type) {
  var el = document.getElementById('regAlert');
  if (!el) return;
  el.textContent = message;
  el.className = 'auth-alert ' + (type || 'error');
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideRegAlert() {
  var el = document.getElementById('regAlert');
  if (el) el.style.display = 'none';
}
function setErr(id, msg) {
  var el = document.getElementById(id);
  if (el) el.textContent = msg || '';
}
function clearErrs() {
  document.querySelectorAll('.fauth-error').forEach(function(el) { el.textContent = ''; });
}

// ── TOGGLE PASSWORD ──────────────────────────────
function togglePw(id, iconId) {
  var i  = document.getElementById(id);
  var ic = document.getElementById(iconId);
  if (!i) return;
  i.type = i.type === 'password' ? 'text' : 'password';
  if (ic) ic.className = i.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
}

// ── SOCIAL LOGIN ─────────────────────────────────
function handleSocialLogin(provider) {
  showRegAlert(provider.charAt(0).toUpperCase() + provider.slice(1) + ' signup requires backend setup.', 'error');
}

// ── PASSWORD STRENGTH ────────────────────────────
function checkStrength(val) {
  var fill  = document.getElementById('strengthFill');
  var label = document.getElementById('strengthLabel');
  if (!fill || !label) return;
  var score = 0;
  if (val.length >= 8)           score++;
  if (/[A-Z]/.test(val))         score++;
  if (/[0-9]/.test(val))         score++;
  if (/[^A-Za-z0-9]/.test(val))  score++;
  var levels = [
    { pct:'0%',   color:'',         text:'Enter a password',   textColor:'var(--text-light)' },
    { pct:'25%',  color:'#e53e3e',  text:'Weak',               textColor:'#e53e3e' },
    { pct:'50%',  color:'#dd6b20',  text:'Fair',               textColor:'#dd6b20' },
    { pct:'75%',  color:'#d69e2e',  text:'Good',               textColor:'#d69e2e' },
    { pct:'100%', color:'#38a169',  text:'Strong ✓',           textColor:'#38a169' }
  ];
  fill.style.width      = levels[score].pct;
  fill.style.background = levels[score].color;
  label.textContent     = levels[score].text;
  label.style.color     = levels[score].textColor;
}

// ── STEP NAVIGATION ──────────────────────────────
function setStep(from, to) {
  var fromEl = document.getElementById('regStep' + from);
  var toEl   = document.getElementById('regStep' + to);
  var si     = document.getElementById('si' + from);
  var siTo   = document.getElementById('si' + to);
  var line   = document.getElementById('rl' + Math.min(from, to));

  if (fromEl) fromEl.style.display = 'none';
  if (toEl)   toEl.style.display   = 'block';

  if (to > from) {
    // Moving forward — mark previous as done
    if (si) {
      si.classList.remove('active');
      si.classList.add('done');
      var circle = si.querySelector('.rs-circle');
      if (circle) circle.innerHTML = '<i class="bi bi-check"></i>';
    }
    if (line) line.classList.add('done');
    if (siTo) siTo.classList.add('active');
  } else {
    // Moving back — unmark
    if (si) {
      si.classList.remove('done', 'active');
      var circle = si.querySelector('.rs-circle');
      if (circle) circle.textContent = from;
    }
    if (line) line.classList.remove('done');
    if (siTo) {
      siTo.classList.add('active');
      siTo.classList.remove('done');
    }
  }
}

function goStep2() {
  clearErrs();
  var fn = document.getElementById('firstName').value.trim();
  var ln = document.getElementById('lastName').value.trim();
  var ph = document.getElementById('phone').value.trim();
  var ag = document.getElementById('age').value;
  var mu = document.getElementById('municipality').value;

  var hasErr = false;
  if (!fn) { setErr('firstNameErr', 'First name is required'); hasErr = true; }
  if (!ln) { setErr('lastNameErr', 'Last name is required'); hasErr = true; }
  if (!ph) { setErr('phoneErr', 'Phone number is required'); hasErr = true; }
  else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(ph)) { setErr('phoneErr', 'Enter a valid phone number'); hasErr = true; }
  if (!ag || ag < 18) { setErr('ageErr', 'You must be at least 18 years old'); hasErr = true; }
  if (!mu) { setErr('muniErr', 'Please select your municipality'); hasErr = true; }
  if (hasErr) return;

  setStep(1, 2);
}

function goStep1() {
  setStep(2, 1);
  // Re-activate step 1
  var si1 = document.getElementById('si1');
  if (si1) {
    si1.classList.add('active');
    si1.classList.remove('done');
    var c = si1.querySelector('.rs-circle');
    if (c) c.textContent = '1';
  }
}

// ── REGISTER ─────────────────────────────────────
function handleRegister() {
  hideRegAlert();
  clearErrs();

  var email  = document.getElementById('regEmail').value.trim();
  var pw     = document.getElementById('regPw').value;
  var pwc    = document.getElementById('regPwConfirm').value;
  var terms  = document.getElementById('termsCheck').checked;

  var hasErr = false;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('regEmailErr', 'Enter a valid email address'); hasErr = true; }
  if (pw.length < 8) { setErr('regPwErr', 'Password must be at least 8 characters'); hasErr = true; }
  if (pw !== pwc)    { setErr('regPwConfirmErr', 'Passwords do not match'); hasErr = true; }
  if (!terms)        { showRegAlert('You must accept the Terms of Service to continue.', 'error'); hasErr = true; }
  if (hasErr) return;

  var btnText = document.getElementById('regBtnText');
  var btnLoad = document.getElementById('regBtnLoader');
  var btn     = document.getElementById('regBtn');
  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoad) btnLoad.style.display = 'inline-flex';

  // Collect all form data
  var formData = {
    firstName:    document.getElementById('firstName').value.trim(),
    lastName:     document.getElementById('lastName').value.trim(),
    phone:        document.getElementById('phone').value.trim(),
    age:          parseInt(document.getElementById('age').value),
    municipality: document.getElementById('municipality').value,
    email:        email,
    password:     pw
  };

  /*
   * ═══════════════════════════════════════════════
   * DB INTEGRATION — Replace fetch below
   * -----------------------------------------------
   * POST /api/auth/register
   * Headers: Content-Type: application/json
   * Body: formData (see above)
   *
   * Success 200/201:
   *   { token: "JWT_TOKEN", user: { id, name, role } }
   *   → localStorage.setItem('fh_token', token)
   *   → localStorage.setItem('fh_user', JSON.stringify(user))
   *   → Show Step 3 success screen
   *
   * Error 409: { message: "Email already registered" }
   * Error 422: { errors: { field: "message" } }
   * Error 500: { message: "Server error" }
   * ═══════════════════════════════════════════════
   *
   * EXAMPLE IMPLEMENTATION:
   *
   * fetch(API_BASE_REG + '/auth/register', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify(formData)
   * })
   * .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, status: res.status, data }; }); })
   * .then(function(result) {
   *   if (btn) btn.disabled = false;
   *   if (btnText) btnText.style.display = 'inline-flex';
   *   if (btnLoad) btnLoad.style.display = 'none';
   *
   *   if (result.ok) {
   *     localStorage.setItem('fh_token', result.data.token);
   *     localStorage.setItem('fh_user', JSON.stringify(result.data.user));
   *     setStep(2, 3);
   *     var si3 = document.getElementById('si3');
   *     if (si3) { si3.classList.add('done'); si3.querySelector('.rs-circle').innerHTML = '<i class="bi bi-check"></i>'; }
   *   } else if (result.status === 409) {
   *     showRegAlert('This email is already registered. Try signing in instead.', 'error');
   *   } else if (result.status === 422 && result.data.errors) {
   *     Object.keys(result.data.errors).forEach(function(field) {
   *       setErr(field + 'Err', result.data.errors[field]);
   *     });
   *   } else {
   *     showRegAlert(result.data.message || 'Registration failed. Please try again.', 'error');
   *   }
   * })
   * .catch(function() {
   *   if (btn) btn.disabled = false;
   *   if (btnText) btnText.style.display = 'inline-flex';
   *   if (btnLoad) btnLoad.style.display = 'none';
   *   showRegAlert('Network error. Please check your connection.', 'error');
   * });
   */

  // ── DEMO SIMULATION (remove when backend is ready) ──
  setTimeout(function() {
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline-flex';
    if (btnLoad) btnLoad.style.display = 'none';

    localStorage.setItem('fh_user', JSON.stringify({
      id: 'demo-' + Date.now(),
      name: formData.firstName + ' ' + formData.lastName,
      email: formData.email,
      municipality: formData.municipality,
      role: 'user'
    }));

    setStep(2, 3);
    var si3 = document.getElementById('si3');
    if (si3) {
      si3.classList.add('done');
      var c = si3.querySelector('.rs-circle');
      if (c) c.innerHTML = '<i class="bi bi-check"></i>';
    }
  }, 1800);
}

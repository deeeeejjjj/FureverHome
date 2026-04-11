/* ═══════════════════════════════════════════════
   login.js — Furever Home Auth
   DB Integration: replace API_BASE with your
   actual C# ASP.NET Core API URL
   ═══════════════════════════════════════════════ */

// ── CONFIG ──────────────────────────────────────
const API_BASE = '/api'; // Change to your API base URL e.g. 'https://api.fureverhome.ph'

// ── HELPERS ─────────────────────────────────────
function showAuthAlert(message, type) {
  var el = document.getElementById('authAlert');
  if (!el) return;
  el.textContent = message;
  el.className = 'auth-alert ' + (type || 'error');
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideAuthAlert() {
  var el = document.getElementById('authAlert');
  if (el) el.style.display = 'none';
}
function setFieldError(fieldId, message) {
  var el = document.getElementById(fieldId);
  if (el) el.textContent = message || '';
}
function clearFieldErrors() {
  document.querySelectorAll('.fauth-error').forEach(function(el) { el.textContent = ''; });
  document.querySelectorAll('.fauth-input').forEach(function(el) { el.style.borderColor = ''; });
}
function setLoading(btnId, textId, loaderId, isLoading) {
  var btn  = document.getElementById(btnId);
  var text = document.getElementById(textId);
  var load = document.getElementById(loaderId);
  if (!btn) return;
  btn.disabled = isLoading;
  if (text) text.style.display = isLoading ? 'none' : 'inline-flex';
  if (load) load.style.display = isLoading ? 'inline-flex' : 'none';
}

// ── PASSWORD TOGGLE ──────────────────────────────
function togglePw(inputId, iconId) {
  var input = document.getElementById(inputId);
  var icon  = document.getElementById(iconId);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  if (icon) icon.className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
}

// ── FORGOT PASSWORD ──────────────────────────────
function handleForgotPassword(e) {
  e.preventDefault();
  var email = document.getElementById('loginEmail').value.trim();
  if (!email) {
    showAuthAlert('Enter your email address first, then click Forgot password.', 'error');
    return;
  }
  /*
   * ═══ DB INTEGRATION ═══
   * POST /api/auth/forgot-password
   * Body: { email }
   * 200: { message: "Reset link sent" }
   * 404: { message: "Email not found" }
   */
  showAuthAlert('Password reset link sent to ' + email + ' (demo only)', 'success');
}

// ── SOCIAL LOGIN ─────────────────────────────────
function handleSocialLogin(provider) {
  /*
   * ═══ DB INTEGRATION ═══
   * Redirect to OAuth endpoint:
   *   Google:   GET /api/auth/google
   *   Facebook: GET /api/auth/facebook
   * These endpoints return a JWT token on callback.
   */
  showAuthAlert(provider.charAt(0).toUpperCase() + provider.slice(1) + ' login requires backend setup.', 'error');
}

// ── MAIN LOGIN ───────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  hideAuthAlert();
  clearFieldErrors();

  var email = document.getElementById('loginEmail').value.trim();
  var pw    = document.getElementById('loginPw').value;
  var remember = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;

  // Client-side validation
  var hasError = false;
  if (!email) { setFieldError('emailError', 'Email is required'); hasError = true; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('emailError', 'Enter a valid email address'); hasError = true; }
  if (!pw)    { setFieldError('pwError', 'Password is required'); hasError = true; }
  if (hasError) return;

  setLoading('loginBtn', 'loginBtnText', 'loginBtnLoader', true);

  /*
   * ═══════════════════════════════════════════════
   * DB INTEGRATION — Replace fetch below
   * -----------------------------------------------
   * POST /api/auth/login
   * Headers: Content-Type: application/json
   * Body: { email, password, rememberMe }
   *
   * Success 200:
   *   { token: "JWT_TOKEN", user: { id, name, role } }
   *   → localStorage.setItem('fh_token', token)
   *   → localStorage.setItem('fh_user', JSON.stringify(user))
   *   → if role === 'admin' → admin-dashboard.html
   *   → else → user-dashboard.html
   *
   * Error 401: { message: "Invalid email or password" }
   * Error 422: { errors: { email: "msg", password: "msg" } }
   * Error 500: { message: "Server error" }
   * ═══════════════════════════════════════════════
   *
   * EXAMPLE IMPLEMENTATION:
   *
   * fetch(API_BASE + '/auth/login', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ email, password: pw, rememberMe: remember })
   * })
   * .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, status: res.status, data }; }); })
   * .then(function(result) {
   *   setLoading('loginBtn', 'loginBtnText', 'loginBtnLoader', false);
   *   if (result.ok) {
   *     localStorage.setItem('fh_token', result.data.token);
   *     localStorage.setItem('fh_user', JSON.stringify(result.data.user));
   *     window.location.href = result.data.user.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
   *   } else if (result.status === 422 && result.data.errors) {
   *     Object.keys(result.data.errors).forEach(function(field) {
   *       setFieldError(field + 'Error', result.data.errors[field]);
   *     });
   *   } else {
   *     showAuthAlert(result.data.message || 'Login failed. Please try again.', 'error');
   *   }
   * })
   * .catch(function() {
   *   setLoading('loginBtn', 'loginBtnText', 'loginBtnLoader', false);
   *   showAuthAlert('Network error. Please check your connection.', 'error');
   * });
   */

  // ── DEMO SIMULATION (remove when backend is ready) ──
  setTimeout(function() {
    setLoading('loginBtn', 'loginBtnText', 'loginBtnLoader', false);
    if (email === 'admin@fureverhome.ph') {
      showAuthAlert('Redirecting to Admin Panel...', 'success');
      setTimeout(function(){ window.location.href = 'admin-dashboard.html'; }, 1000);
    } else {
      showAuthAlert('Welcome back! Redirecting...', 'success');
      setTimeout(function(){ window.location.href = 'user-dashboard.html'; }, 1000);
    }
  }, 1500);
}

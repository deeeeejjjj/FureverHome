/* ═══════════════════════════════════════════════════
   api.js  —  Furever Home API Client
   All pages import this file to talk to the backend.
   Base URL: change to your deployed API domain.
   ═══════════════════════════════════════════════════ */

// PHP backend entry point (relative from frontend/pages/*.html)
// Adjust this path if your server layout differs.
const API_PHP = '../../backend-php/api.php';

/**
 * Translates a REST-style path to PHP query-param URL.
 * /pets         → ?route=pets
 * /pets/5       → ?route=pets&id=5
 * /pets/featured → ?route=pets&action=featured
 * /adoptions/3/review → ?route=adoptions&id=3&action=review
 * /admin/stats  → ?route=admin&action=stats
 */
function phpUrl(path) {
  const [pathOnly, qs] = path.split('?');
  const parts = pathOnly.replace(/^\//, '').split('/').filter(Boolean);
  const p = new URLSearchParams();
  if (parts[0]) p.set('route', parts[0]);
  if (parts.length === 2) {
    /^\d+$/.test(parts[1]) ? p.set('id', parts[1]) : p.set('action', parts[1]);
  } else if (parts.length >= 3) {
    p.set('id', parts[1]);
    p.set('action', parts[2]);
  }
  if (qs) qs.split('&').forEach(kv => { const [k,v] = kv.split('='); if(k) p.set(k,v||''); });
  return `${API_PHP}?${p.toString()}`;
}

const API = 'http://localhost:5000/api';   // kept for reference — overridden below

/* ── Token helpers ──────────────────────────────── */
const Auth = {
  getToken  : ()       => localStorage.getItem('fh_token'),
  getUser   : ()       => JSON.parse(localStorage.getItem('fh_user') || 'null'),
  setSession: (token, user) => {
    localStorage.setItem('fh_token', token);
    localStorage.setItem('fh_user', JSON.stringify(user));
  },
  clear     : ()       => {
    localStorage.removeItem('fh_token');
    localStorage.removeItem('fh_user');
  },
  isLoggedIn: ()       => !!localStorage.getItem('fh_token'),
  isAdmin   : ()       => Auth.getUser()?.role === 'admin',
  redirectIfNotLoggedIn: (returnTo) => {
    if (!Auth.isLoggedIn()) {
      window.location.href = returnTo || '../pages/login.html';
      return true;
    }
    return false;
  }
};

/* ── Core fetch wrapper ─────────────────────────── */
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(phpUrl(path), {
    ...options,
    headers
  });

  if (res.status === 401) {
    Auth.clear();
    window.location.href = '../pages/login.html';
    return null;
  }

  const data = res.headers.get('Content-Type')?.includes('application/json')
    ? await res.json()
    : null;

  if (!res.ok) {
    const msg = data?.message || data?.errors?.[Object.keys(data.errors)[0]] || 'Request failed';
    throw new Error(msg);
  }

  return data;
}

const get    = (path)        => apiFetch(path, { method: 'GET' });
const post   = (path, body)  => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) });
const put    = (path, body)  => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) });
const del    = (path)        => apiFetch(path, { method: 'DELETE' });

/* ── AUTH ───────────────────────────────────────── */
const AuthAPI = {
  login    : (email, password, rememberMe) =>
    post('/auth/login', { email, password, rememberMe }),
  register : (data) => post('/auth/register', data),
  me       : ()     => get('/auth/me'),
  forgot   : (email) => post('/auth/forgot-password', { email })
};

/* ── PETS ───────────────────────────────────────── */
const PetsAPI = {
  list    : (filters = {}) => {
    const q = new URLSearchParams(Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v != null)
    )).toString();
    return get(`/pets${q ? '?' + q : ''}`);
  },
  featured: ()       => get('/pets/featured'),
  get     : (id)     => get(`/pets/${id}`),
  create  : (data)   => post('/pets', data),
  update  : (id, d)  => put(`/pets/${id}`, d),
  delete  : (id)     => del(`/pets/${id}`)
};

/* ── SAVED PETS ─────────────────────────────────── */
const SavedAPI = {
  list   : ()    => get('/saved-pets'),
  save   : (id)  => post(`/saved-pets/${id}`, {}),
  unsave : (id)  => del(`/saved-pets/${id}`)
};

/* ── ADOPTIONS ──────────────────────────────────── */
const AdoptionsAPI = {
  my     : ()        => get('/adoptions/my'),
  apply  : (data)    => post('/adoptions', data),
  all    : (status)  => get(`/adoptions${status ? '?status=' + status : ''}`),
  review : (id, action, notes) =>
    put(`/adoptions/${id}/review`, { action, adminNotes: notes })
};

/* ── RESCUERS ───────────────────────────────────── */
const RescuersAPI = {
  list  : (municipality) =>
    get(`/rescuers${municipality ? '?municipality=' + municipality : ''}`),
  apply : (data) => post('/rescuers/apply', data)
};

/* ── DONATIONS ──────────────────────────────────── */
const DonationsAPI = {
  donate : (amount, method, msg, anon) =>
    post('/donations', { amount, paymentMethod: method, message: msg, isAnonymous: anon }),
  my     : () => get('/donations/my')
};

/* ── NOTIFICATIONS ──────────────────────────────── */
const NotifsAPI = {
  list     : ()   => get('/notifications'),
  read     : (id) => put(`/notifications/${id}/read`, {}),
  readAll  : ()   => put('/notifications/read-all', {}),
  dismiss  : (id) => del(`/notifications/${id}`)
};

/* ── USER PROFILE ───────────────────────────────── */
const UserAPI = {
  profile       : ()     => get('/users/profile'),
  updateProfile : (data) => put('/users/profile', data),
  changePassword: (curr, newP, conf) =>
    put('/users/password', { currentPassword: curr, newPassword: newP, confirmPassword: conf }),
  updateNotifs  : (prefs) => put('/users/notifications', prefs),
  deleteAccount : ()     => del('/users/account')
};

/* ── CONTACT & NEWSLETTER ───────────────────────── */
const ContactAPI = {
  send      : (data) => post('/contact', data),
  subscribe : (email) => post('/newsletter/subscribe', { email })
};

/* ── ADMIN ──────────────────────────────────────── */
const AdminAPI = {
  stats    : ()    => get('/admin/stats'),
  users    : (p)   => get(`/admin/users?page=${p||1}`),
  shelters : ()    => get('/admin/shelters'),
  messages : ()    => get('/admin/messages?unresolved=true'),
  donations: (p)   => get(`/admin/donations?page=${p||1}`),
  analytics: ()    => get('/admin/analytics'),
  deactivate: (id) => put(`/admin/users/${id}/deactivate`, {}),
  resolve  : (id)  => put(`/admin/messages/${id}/resolve`, {})
};

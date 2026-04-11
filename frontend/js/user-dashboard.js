/* ═══════════════════════════════════════
   user-dashboard.js — Furever Home
   ═══════════════════════════════════════ */

var panels = {
  dashboard:     { title: 'My Dashboard',       breadcrumb: 'Dashboard > Overview' },
  applications:  { title: 'My Applications',    breadcrumb: 'Dashboard > Applications' },
  saved:         { title: 'Saved Pets',          breadcrumb: 'Dashboard > Saved Pets' },
  profile:       { title: 'My Profile',          breadcrumb: 'Dashboard > Profile' },
  notifications: { title: 'Notifications',       breadcrumb: 'Dashboard > Notifications' },
  settings:      { title: 'Settings',            breadcrumb: 'Dashboard > Settings' },
  donate:        { title: 'Donate',              breadcrumb: 'Dashboard > Donate' },
};

function showPanel(name, clickedLink) {
  // Hide all panels
  Object.keys(panels).forEach(function(key) {
    var el = document.getElementById('panel-' + key);
    if (el) el.style.display = 'none';
  });

  // Show target panel
  var target = document.getElementById('panel-' + name);
  if (target) target.style.display = 'block';

  // Update title/breadcrumb
  var info = panels[name];
  if (info) {
    var t = document.getElementById('pageTitle');
    var b = document.getElementById('pageBreadcrumb');
    if (t) t.textContent = info.title;
    if (b) b.textContent = info.breadcrumb;
  }

  // Update sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(function(l) {
    l.classList.remove('active');
  });
  if (clickedLink) {
    clickedLink.classList.add('active');
  } else {
    // Find by panel name
    document.querySelectorAll('.sidebar-link').forEach(function(l) {
      if (l.getAttribute('onclick') && l.getAttribute('onclick').includes("'" + name + "'")) {
        l.classList.add('active');
      }
    });
  }

  // Clear notification badge when viewing notifications
  if (name === 'notifications') {
    var badge = document.getElementById('notifBadge');
    if (badge) badge.style.display = 'none';
  }

  return false;
}

function dismissNotif(id) {
  var el = document.getElementById(id);
  if (el) {
    el.style.transition = 'all 0.3s';
    el.style.opacity = '0';
    el.style.height = '0';
    el.style.overflow = 'hidden';
    setTimeout(function() { el.remove(); }, 300);
  }
}

function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(function(el) {
    el.classList.remove('unread');
    var dot = el.querySelector('.notif-dot');
    if (dot) dot.remove();
  });
  var badge = document.getElementById('notifBadge');
  if (badge) badge.style.display = 'none';
  showToast('All notifications marked as read.');
}

function removeSaved(btn, name) {
  if (confirm('Remove ' + name + ' from saved pets?')) {
    var card = btn.closest('.col-sm-6, [class*="col-"]');
    if (!card) card = btn.closest('.pcard').parentElement;
    if (card) {
      card.style.transition = 'all 0.35s';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      setTimeout(function() { card.remove(); }, 350);
    }
    showToast(name + ' removed from saved pets.');
  }
}

function handleSearch(val) {
  if (val.length > 1) {
    showToast('Searching for "' + val + '"...');
    // DB INTEGRATION: GET /api/pets/search?q=val
  }
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  showPanel('dashboard', document.querySelector('.sidebar-link.active'));
});

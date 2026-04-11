/* ═══════════════════════════════════════
   admin-dashboard.js — Furever Home
   ═══════════════════════════════════════ */

var adminPanels = {
  dashboard:  { title: 'Admin Dashboard',      breadcrumb: 'Dashboard > Overview · Today, March 29, 2026' },
  pets:       { title: 'Pet Listings',          breadcrumb: 'Management > Pet Listings' },
  requests:   { title: 'Adoption Requests',     breadcrumb: 'Management > Adoption Requests' },
  users:      { title: 'Users',                 breadcrumb: 'Management > Users' },
  shelters:   { title: 'Shelters',              breadcrumb: 'Management > Shelters' },
  analytics:  { title: 'Analytics',             breadcrumb: 'Reports > Analytics' },
  donations:  { title: 'Donations',             breadcrumb: 'Reports > Donations' },
  settings:   { title: 'Settings',              breadcrumb: 'System > Settings' },
};

function adminPanel(name, clickedLink) {
  // Hide all
  Object.keys(adminPanels).forEach(function(key) {
    var el = document.getElementById('adm-' + key);
    if (el) el.style.display = 'none';
  });

  // Show target
  var target = document.getElementById('adm-' + name);
  if (target) target.style.display = 'block';

  // Update title
  var info = adminPanels[name];
  if (info) {
    var t = document.getElementById('adminTitle');
    var b = document.getElementById('adminBreadcrumb');
    if (t) t.textContent = info.title;
    if (b) b.textContent = info.breadcrumb;
  }

  // Update active link
  document.querySelectorAll('.sidebar-link').forEach(function(l) { l.classList.remove('active'); });
  if (clickedLink) {
    clickedLink.classList.add('active');
  } else {
    document.querySelectorAll('.sidebar-link').forEach(function(l) {
      if (l.getAttribute('onclick') && l.getAttribute('onclick').includes("'" + name + "'")) {
        l.classList.add('active');
      }
    });
  }

  // Init analytics chart when panel shown
  if (name === 'analytics') initAnalyticsChart();

  return false;
}

/* ── Approve / Reject requests ── */
function handleRequest(rowId, action, petName) {
  var row = document.getElementById(rowId);
  if (!row) return;
  var statusCell = row.querySelector('td:nth-child(5)');
  var actionCell = row.querySelector('td:last-child');

  if (action === 'approve') {
    if (statusCell) statusCell.innerHTML = '<span class="badge-status badge-available">Approved</span>';
    if (actionCell) actionCell.innerHTML = '<span style="font-size:12px;color:var(--text-light)">Done</span>';
    showToast('✅ ' + petName + ' adoption approved!');
    // DB: PUT /api/adoptions/{id}/approve
  } else {
    if (statusCell) statusCell.innerHTML = '<span class="badge-status" style="background:#fde8e8;color:#c53030">Rejected</span>';
    if (actionCell) actionCell.innerHTML = '<span style="font-size:12px;color:var(--text-light)">Done</span>';
    showToast('❌ ' + petName + ' adoption rejected.');
    // DB: PUT /api/adoptions/{id}/reject
  }

  // Decrement badge
  var badge = document.getElementById('reqBadge');
  var adminBadge = document.getElementById('adminNotifBadge');
  if (badge) {
    var n = parseInt(badge.textContent) - 1;
    badge.textContent = n > 0 ? n : '';
    if (n <= 0) badge.style.display = 'none';
  }
  if (adminBadge) {
    var n2 = parseInt(adminBadge.textContent) - 1;
    adminBadge.textContent = n2 > 0 ? n2 : '';
    if (n2 <= 0) adminBadge.style.display = 'none';
  }
}

/* ── Open Edit Pet modal ── */
function openEditPet(petName) {
  var title = document.getElementById('petModalTitle');
  if (title) title.textContent = 'Edit Pet: ' + petName;
  var nameInput = document.getElementById('petName');
  if (nameInput) nameInput.value = petName;
  var modal = new bootstrap.Modal(document.getElementById('addPetModal'));
  modal.show();
}

/* ── Save Pet ── */
function savePet() {
  var name     = document.getElementById('petName').value.trim();
  var type     = document.getElementById('petType').value;
  var breed    = document.getElementById('petBreed').value.trim();
  var location = document.getElementById('petLocation').value;

  if (!name || !type || !breed || !location) {
    showToast('Please fill in all required fields.');
    return;
  }
  // DB: POST /api/pets (add) or PUT /api/pets/{id} (edit)
  bootstrap.Modal.getInstance(document.getElementById('addPetModal')).hide();
  showToast('✅ Pet listing "' + name + '" saved successfully!');

  // Add row to table (demo)
  var tbody = document.getElementById('petListBody');
  if (tbody) {
    var row = document.createElement('tr');
    row.innerHTML = '<td><div class="d-flex align-items-center gap-2"><div style="width:40px;height:40px;border-radius:10px;background:var(--light-green);display:flex;align-items:center;justify-content:center;font-size:18px">' + (type==='Dog'?'🐕':'🐈') + '</div><div><div class="fw-600">' + name + '</div></div></div></td><td>' + (type==='Dog'?'🐕':'🐈') + ' ' + type + '</td><td style="font-size:13px">' + breed + '</td><td style="font-size:13px">' + location + '</td><td><span class="badge-status badge-available" style="font-size:10px">Available</span></td><td><button class="btn btn-sm btn-outline-dark me-1" onclick="openEditPet(\'' + name + '\')"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deletePet(\'' + name + '\')"><i class="bi bi-trash"></i></button></td>';
    tbody.appendChild(row);
  }

  // Clear form
  ['petName','petBreed','petAge','petWeight','petDesc'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
}

/* ── Delete pet ── */
function deletePet(name) {
  if (confirm('Delete "' + name + '" from listings? This cannot be undone.')) {
    showToast('🗑️ "' + name + '" deleted.');
    // DB: DELETE /api/pets/{id}
  }
}

/* ── Filter pets list ── */
function filterPetsList(type, status) {
  showToast('Filtering pets...');
  // DB: GET /api/pets?type=type&status=status
}

/* ── Charts ── */
var adoptionChartInstance = null;
var analyticsChartInstance = null;

function initCharts() {
  // Adoption trend chart
  var ctx = document.getElementById('adoptionChart');
  if (!ctx) return;
  adoptionChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Oct','Nov','Dec','Jan','Feb','Mar'],
      datasets: [
        {
          label: 'Adopted',
          data: [62, 78, 95, 110, 88, 135],
          borderColor: '#c9a84c',
          backgroundColor: 'rgba(201,168,76,0.08)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#c9a84c',
          pointRadius: 4
        },
        {
          label: 'Listed',
          data: [88, 115, 140, 158, 130, 172],
          borderColor: '#1a3c34',
          backgroundColor: 'rgba(26,60,52,0.06)',
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#1a3c34',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top', labels: { boxWidth: 30, font: { size: 12 } } } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Doughnut chart
  var ctx2 = document.getElementById('statusChart');
  if (!ctx2) return;
  new Chart(ctx2.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Available','Pending','Adopted'],
      datasets: [{
        data: [712, 278, 890],
        backgroundColor: ['#38a169','#d69e2e','#3182ce'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      cutout: '65%',
      plugins: { legend: { display: false } }
    }
  });
}

function initAnalyticsChart() {
  if (analyticsChartInstance) return;
  var ctx = document.getElementById('analyticsChart');
  if (!ctx) return;
  analyticsChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'],
      datasets: [{
        label: 'Adoptions',
        data: [45,52,60,70,65,80,92,95,110,88,100,135],
        backgroundColor: 'rgba(26,60,52,0.75)',
        borderRadius: 6
      },{
        label: 'New Listings',
        data: [60,70,75,85,80,100,110,120,140,130,145,172],
        backgroundColor: 'rgba(201,168,76,0.7)',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function setChart(mode) {
  if (!adoptionChartInstance) return;
  var btnMonth = document.getElementById('btnMonth');
  var btnWeek  = document.getElementById('btnWeek');

  if (mode === 'week') {
    adoptionChartInstance.data.labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    adoptionChartInstance.data.datasets[0].data = [8,12,6,14,10,18,15];
    adoptionChartInstance.data.datasets[1].data = [12,15,10,18,14,22,19];
    if (btnMonth) { btnMonth.className = 'btn btn-sm btn-outline-dark px-3'; }
    if (btnWeek)  { btnWeek.className  = 'btn btn-sm btn-gold px-3'; }
  } else {
    adoptionChartInstance.data.labels = ['Oct','Nov','Dec','Jan','Feb','Mar'];
    adoptionChartInstance.data.datasets[0].data = [62,78,95,110,88,135];
    adoptionChartInstance.data.datasets[1].data = [88,115,140,158,130,172];
    if (btnMonth) { btnMonth.className = 'btn btn-sm btn-gold px-3'; }
    if (btnWeek)  { btnWeek.className  = 'btn btn-sm btn-outline-dark px-3'; }
  }
  adoptionChartInstance.update();
}

// Init on load
document.addEventListener('DOMContentLoaded', function() {
  adminPanel('dashboard', document.querySelector('.sidebar-link.active'));
  setTimeout(initCharts, 100);
});

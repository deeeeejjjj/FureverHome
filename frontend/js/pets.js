// ===== PET DATABASE =====
const PETS = [
  // --- DOGS ---
  {
    id: 1, type: "Dog", name: "Max", breed: "Golden Retriever", age: 2, ageLabel: "2 yrs", ageGroup: "young",
    gender: "Male", location: "Boac", status: "available",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80",
    tags: ["Vaccinated","House-trained","Friendly"], weight: "28 kg", size: "Large",
    desc: "Max is a gentle and affectionate Golden Retriever who loves cuddles and outdoor walks. He's great with children and other dogs. Rescued from the streets of Boac, he's been in our shelter for 2 months and has completed basic obedience training."
  },
  {
    id: 2, type: "Dog", name: "Buddy", breed: "Labrador Mix", age: 3, ageLabel: "3 yrs", ageGroup: "young",
    gender: "Male", location: "Gasan", status: "available",
    img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80",
    tags: ["Vaccinated","Playful","Energetic"], weight: "22 kg", size: "Medium",
    desc: "Buddy is a lively and loving Labrador mix who thrives on attention and play. He enjoys fetch, swimming, and long walks on the beach. He gets along well with older children and is working on his leash manners."
  },
  {
    id: 3, type: "Dog", name: "Rocky", breed: "Aspin Mix", age: 5, ageLabel: "5 yrs", ageGroup: "adult",
    gender: "Male", location: "Buenavista", status: "available",
    img: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=500&q=80",
    tags: ["House-trained","Calm","Loyal"], weight: "18 kg", size: "Medium",
    desc: "Rocky is a calm and devoted Aspin who has lived as a house dog most of his life. He's quiet indoors, loves afternoon naps, and is perfectly content with a short daily walk. Ideal for a relaxed household or small apartment."
  },
  {
    id: 4, type: "Dog", name: "Coco", breed: "Dachshund", age: 4, ageLabel: "4 yrs", ageGroup: "adult",
    gender: "Female", location: "Santa Cruz", status: "available",
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80",
    tags: ["Vaccinated","Spayed","Affectionate"], weight: "7 kg", size: "Small",
    desc: "Coco is a charming little Dachshund with a big personality. She loves to burrow under blankets, follow her humans everywhere, and bark at anything that moves outside. She does best in a home without very young children."
  },
  {
    id: 5, type: "Dog", name: "Kiko", breed: "Shih Tzu Mix", age: 2, ageLabel: "2 yrs", ageGroup: "young",
    gender: "Male", location: "Torrijos", status: "available",
    img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80",
    tags: ["Vaccinated","Kid-friendly","Gentle"], weight: "5 kg", size: "Small",
    desc: "Kiko is an adorable Shih Tzu mix with a silky coat and a sweet temperament. He loves lap time, light play, and meeting new people. He's been socialized with children and other small dogs and adapts well to apartment living."
  },
  {
    id: 6, type: "Dog", name: "Bruno", breed: "Labrador Retriever", age: 1, ageLabel: "1 yr", ageGroup: "puppy",
    gender: "Male", location: "Mogpog", status: "pending",
    img: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=500&q=80",
    tags: ["Vaccinated","Puppy","High-energy"], weight: "20 kg", size: "Large",
    desc: "Bruno is an enthusiastic young Labrador full of puppy energy and curiosity. He's still learning commands but is a fast learner. He needs an active family who can give him plenty of exercise, training, and lots of love."
  },
  // --- CATS ---
  {
    id: 7, type: "Cat", name: "Luna", breed: "Domestic Shorthair", age: 1, ageLabel: "1 yr", ageGroup: "puppy",
    gender: "Female", location: "Gasan", status: "available",
    img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80",
    tags: ["Vaccinated","Indoor","Gentle"], weight: "3.2 kg", size: "Small",
    desc: "Luna is a sweet and curious Domestic Shorthair who loves to explore every corner of her space. She's litter-trained, independent, and enjoys the company of calm humans. She'd thrive as a single-cat household or with another gentle cat."
  },
  {
    id: 8, type: "Cat", name: "Nala", breed: "Persian Mix", age: 2, ageLabel: "2 yrs", ageGroup: "young",
    gender: "Female", location: "Boac", status: "available",
    img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80",
    tags: ["Vaccinated","Calm","Lap cat"], weight: "4 kg", size: "Medium",
    desc: "Nala is a gorgeous Persian mix with a laid-back personality. She's the ultimate lap cat — happiest when curled up beside her favorite human. She's quiet, low-maintenance, and perfect for someone seeking a calm and loving companion."
  },
  {
    id: 9, type: "Cat", name: "Mochi", breed: "Siamese Mix", age: 1, ageLabel: "1 yr", ageGroup: "puppy",
    gender: "Female", location: "Mogpog", status: "available",
    img: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=500&q=80",
    tags: ["Playful","Kid-friendly","Vocal"], weight: "3 kg", size: "Small",
    desc: "Mochi is a chatty and playful Siamese mix who loves interactive toys, climbing, and conversation. She'll talk to you all day if you let her! She bonds strongly with her humans and does well in families with older children."
  },
  {
    id: 10, type: "Cat", name: "Shadow", breed: "Domestic Longhair", age: 4, ageLabel: "4 yrs", ageGroup: "adult",
    gender: "Male", location: "Santa Cruz", status: "available",
    img: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=500&q=80",
    tags: ["Neutered","Independent","Calm"], weight: "5 kg", size: "Medium",
    desc: "Shadow is a sleek, mysterious Domestic Longhair who prefers quiet environments. He's not a lap cat, but he'll settle near you and purr contentedly for hours. Best suited for a calm, adult household — he'll reveal his affectionate side on his own terms."
  },
  {
    id: 11, type: "Cat", name: "Ginger", breed: "Orange Tabby", age: 3, ageLabel: "3 yrs", ageGroup: "young",
    gender: "Male", location: "Buenavista", status: "available",
    img: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=500&q=80",
    tags: ["Vaccinated","Friendly","Social"], weight: "4.5 kg", size: "Medium",
    desc: "Ginger is an outgoing, social Orange Tabby who greets every visitor at the door. He loves belly rubs, feather wands, and sitting in sunny spots. He's been raised around dogs and adapts quickly to new environments — a true extrovert in a cat's body."
  },
  {
    id: 12, type: "Cat", name: "Bella", breed: "Calico", age: 5, ageLabel: "5 yrs", ageGroup: "adult",
    gender: "Female", location: "Torrijos", status: "pending",
    img: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=500&q=80",
    tags: ["Spayed","Calm","Senior-friendly"], weight: "3.8 kg", size: "Small",
    desc: "Bella is a beautiful Calico with a gentle soul. She's spent most of her life in a quiet home and prefers the same. She loves soft music, cozy spots, and slow mornings. She would be perfect for a retiree or someone working from home."
  }
];

let currentType = 'all';

// Pastel colors matching the app concept
const CARD_COLORS = [
  { bg:'#e8e0f5', circle:'#c8b8e8', name:'#5b3d8a' },  // purple
  { bg:'#d6ecf5', circle:'#b0d4e8', name:'#1d5f7a' },  // blue
  { bg:'#f5e0e8', circle:'#e8b8c8', name:'#8a3d52' },  // rose
  { bg:'#ede8f5', circle:'#d0c4e8', name:'#4d3d8a' },  // lavender
  { bg:'#f5ede0', circle:'#e8d0b0', name:'#7a4f1d' },  // peach
  { bg:'#e0f5ee', circle:'#b0e8d4', name:'#1d7a52' },  // mint
];

function renderPets(list) {
  const grid = document.getElementById('petsGrid');
  document.getElementById('petCount').textContent = list.length;
  if (list.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center py-5"><div style="font-size:60px">🐾</div><h5 class="mt-3">No pets found</h5><p class="text-muted">Try adjusting your filters</p></div>`;
    return;
  }
  grid.innerHTML = list.map((p, i) => {
    const col = CARD_COLORS[i % CARD_COLORS.length];
    const statusLabel = p.status.charAt(0).toUpperCase() + p.status.slice(1);
    return `
    <div class="col-12 col-md-6 col-xl-4 pet-item" data-type="${p.type}" data-status="${p.status}">
      <div class="pcard" style="background:${col.bg}">

        <!-- Top row: photo circle + info + heart -->
        <div class="pcard-top">
          <div class="pcard-circle" style="background:${col.circle}">
            <img src="${p.img}" alt="${p.name}" class="pcard-img"
              onerror="this.src='https://via.placeholder.com/160/e8f2ef/1a3c34?text=${p.name}'"/>
          </div>

          <div class="pcard-info">
            <div class="pcard-type" style="color:${col.name}">${p.type === 'Dog' ? '🐕' : '🐈'} ${p.type}</div>
            <h5 class="pcard-name" style="color:${col.name}">${p.name}</h5>
            <div class="pcard-gender-age">${p.gender} · ${p.ageLabel}</div>
            <div class="pcard-location"><i class="bi bi-geo-alt-fill"></i> ${p.location}, Marinduque</div>
            <div class="pcard-status-row">
              <span class="pcard-status ${p.status === 'available' ? 'pcs-available' : 'pcs-pending'}">${statusLabel}</span>
              <span class="pcard-weight"><i class="bi bi-speedometer2"></i> ${p.weight}</span>
            </div>
          </div>

          <button class="pcard-heart" onclick="toggleFav(this)">
            <i class="bi bi-heart"></i>
          </button>
        </div>

        <!-- Stats strip -->
        <div class="pcard-stats" style="background:rgba(255,255,255,0.45)">
          <div class="pcard-stat"><span class="pcs-label">Breed</span><span class="pcs-val">${p.breed}</span></div>
          <div class="pcard-stat-div"></div>
          <div class="pcard-stat"><span class="pcs-label">Size</span><span class="pcs-val">${p.size}</span></div>
          <div class="pcard-stat-div"></div>
          <div class="pcard-stat"><span class="pcs-label">Weight</span><span class="pcs-val">${p.weight}</span></div>
        </div>

        <!-- Tags -->
        <div class="pcard-tags">
          ${p.tags.map(t => `<span class="pcard-tag" style="background:rgba(255,255,255,0.6);color:${col.name}">${t}</span>`).join('')}
        </div>

        <!-- CTA -->
        <a href="pet-detail.html?id=${p.id}"
           class="pcard-btn ${p.status === 'available' ? 'pcard-btn-main' : 'pcard-btn-out'}"
           style="${p.status === 'available' ? 'background:' + col.name + ';color:#fff' : ''}">
          ${p.status === 'available' ? 'Adopt ' + p.name : 'View Details'}
          <i class="bi bi-arrow-right ms-1"></i>
        </a>

      </div>
    </div>`;
  }).join('');
}

function filterPets(type, btn) {
  currentType = type;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

function applyFilters() {
  let list = [...PETS];

  // Type tab
  if (currentType !== 'all') list = list.filter(p => p.type === currentType);

  // Age checkboxes
  const checkedAges = [...document.querySelectorAll('.age-filter:checked')].map(el => el.value);
  if (checkedAges.length > 0) list = list.filter(p => checkedAges.includes(p.ageGroup));

  // Gender checkboxes
  const checkedGenders = [...document.querySelectorAll('.gender-filter:checked')].map(el => el.value);
  if (checkedGenders.length > 0) list = list.filter(p => checkedGenders.includes(p.gender));

  // Status checkboxes
  const checkedStatuses = [...document.querySelectorAll('.status-filter:checked')].map(el => el.value);
  if (checkedStatuses.length > 0) list = list.filter(p => checkedStatuses.includes(p.status));

  // Location dropdown
  const loc = document.getElementById('locationFilter').value;
  if (loc) list = list.filter(p => p.location === loc);

  renderPets(list);
}

function sortPets() {
  const val = document.getElementById('sortSelect').value;
  // Re-run applyFilters which will pick up the sort too
  applyFiltersAndSort(val);
}

function applyFiltersAndSort(sortVal) {
  let list = [...PETS];

  if (currentType !== 'all') list = list.filter(p => p.type === currentType);

  const checkedAges = [...document.querySelectorAll('.age-filter:checked')].map(el => el.value);
  if (checkedAges.length > 0) list = list.filter(p => checkedAges.includes(p.ageGroup));

  const checkedGenders = [...document.querySelectorAll('.gender-filter:checked')].map(el => el.value);
  if (checkedGenders.length > 0) list = list.filter(p => checkedGenders.includes(p.gender));

  const checkedStatuses = [...document.querySelectorAll('.status-filter:checked')].map(el => el.value);
  if (checkedStatuses.length > 0) list = list.filter(p => checkedStatuses.includes(p.status));

  const loc = document.getElementById('locationFilter').value;
  if (loc) list = list.filter(p => p.location === loc);

  const sort = sortVal || document.getElementById('sortSelect').value;
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'age')  list.sort((a, b) => a.age - b.age);

  renderPets(list);
}

function applyFilters() { applyFiltersAndSort(); }

function clearFilters() {
  document.querySelectorAll('.age-filter, .gender-filter, .status-filter').forEach(el => {
    el.checked = el.classList.contains('status-filter') && el.value === 'available';
  });
  document.getElementById('locationFilter').value = '';
  document.getElementById('sortSelect').value = 'newest';
  applyFiltersAndSort();
}// Init
renderPets(PETS);

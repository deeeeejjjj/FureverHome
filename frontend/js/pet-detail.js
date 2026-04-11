// ===== PET DATABASE (must match pets.js) =====
const PETS = [
  {
    id: 1, type: "Dog", name: "Max", breed: "Golden Retriever", age: 2, ageLabel: "2 yrs", ageGroup: "young",
    gender: "Male", location: "Boac", status: "available",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=700&q=80",
    tags: ["Vaccinated","House-trained","Friendly"], weight: "28 kg", size: "Large",
    desc: "Max is a gentle and affectionate Golden Retriever who loves cuddles and outdoor walks. He's great with children and other dogs. Rescued from the streets of Boac, he's been in our shelter for 2 months and has completed basic obedience training."
  },
  {
    id: 2, type: "Dog", name: "Buddy", breed: "Labrador Mix", age: 3, ageLabel: "3 yrs", ageGroup: "young",
    gender: "Male", location: "Gasan", status: "available",
    img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&q=80",
    tags: ["Vaccinated","Playful","Energetic"], weight: "22 kg", size: "Medium",
    desc: "Buddy is a lively and loving Labrador mix who thrives on attention and play. He enjoys fetch, swimming, and long walks on the beach. He gets along well with older children and is working on his leash manners."
  },
  {
    id: 3, type: "Dog", name: "Rocky", breed: "Aspin Mix", age: 5, ageLabel: "5 yrs", ageGroup: "adult",
    gender: "Male", location: "Buenavista", status: "available",
    img: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=700&q=80",
    tags: ["House-trained","Calm","Loyal"], weight: "18 kg", size: "Medium",
    desc: "Rocky is a calm and devoted Aspin who has lived as a house dog most of his life. He's quiet indoors, loves afternoon naps, and is perfectly content with a short daily walk. Ideal for a relaxed household or small apartment."
  },
  {
    id: 4, type: "Dog", name: "Coco", breed: "Dachshund", age: 4, ageLabel: "4 yrs", ageGroup: "adult",
    gender: "Female", location: "Santa Cruz", status: "available",
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=700&q=80",
    tags: ["Vaccinated","Spayed","Affectionate"], weight: "7 kg", size: "Small",
    desc: "Coco is a charming little Dachshund with a big personality. She loves to burrow under blankets, follow her humans everywhere, and bark at anything that moves outside. She does best in a home without very young children."
  },
  {
    id: 5, type: "Dog", name: "Kiko", breed: "Shih Tzu Mix", age: 2, ageLabel: "2 yrs", ageGroup: "young",
    gender: "Male", location: "Torrijos", status: "available",
    img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=700&q=80",
    tags: ["Vaccinated","Kid-friendly","Gentle"], weight: "5 kg", size: "Small",
    desc: "Kiko is an adorable Shih Tzu mix with a silky coat and a sweet temperament. He loves lap time, light play, and meeting new people. He's been socialized with children and other small dogs and adapts well to apartment living."
  },
  {
    id: 6, type: "Dog", name: "Bruno", breed: "Labrador Retriever", age: 1, ageLabel: "1 yr", ageGroup: "puppy",
    gender: "Male", location: "Mogpog", status: "pending",
    img: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=700&q=80",
    tags: ["Vaccinated","Puppy","High-energy"], weight: "20 kg", size: "Large",
    desc: "Bruno is an enthusiastic young Labrador full of puppy energy and curiosity. He's still learning commands but is a fast learner. He needs an active family who can give him plenty of exercise, training, and lots of love."
  },
  {
    id: 7, type: "Cat", name: "Luna", breed: "Domestic Shorthair", age: 1, ageLabel: "1 yr", ageGroup: "puppy",
    gender: "Female", location: "Gasan", status: "available",
    img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=700&q=80",
    tags: ["Vaccinated","Indoor","Gentle"], weight: "3.2 kg", size: "Small",
    desc: "Luna is a sweet and curious Domestic Shorthair who loves to explore every corner of her space. She's litter-trained, independent, and enjoys the company of calm humans. She'd thrive as a single-cat household or with another gentle cat."
  },
  {
    id: 8, type: "Cat", name: "Nala", breed: "Persian Mix", age: 2, ageLabel: "2 yrs", ageGroup: "young",
    gender: "Female", location: "Boac", status: "available",
    img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700&q=80",
    tags: ["Vaccinated","Calm","Lap cat"], weight: "4 kg", size: "Medium",
    desc: "Nala is a gorgeous Persian mix with a laid-back personality. She's the ultimate lap cat — happiest when curled up beside her favorite human. She's quiet, low-maintenance, and perfect for someone seeking a calm and loving companion."
  },
  {
    id: 9, type: "Cat", name: "Mochi", breed: "Siamese Mix", age: 1, ageLabel: "1 yr", ageGroup: "puppy",
    gender: "Female", location: "Mogpog", status: "available",
    img: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=700&q=80",
    tags: ["Playful","Kid-friendly","Vocal"], weight: "3 kg", size: "Small",
    desc: "Mochi is a chatty and playful Siamese mix who loves interactive toys, climbing, and conversation. She'll talk to you all day if you let her! She bonds strongly with her humans and does well in families with older children."
  },
  {
    id: 10, type: "Cat", name: "Shadow", breed: "Domestic Longhair", age: 4, ageLabel: "4 yrs", ageGroup: "adult",
    gender: "Male", location: "Santa Cruz", status: "available",
    img: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=700&q=80",
    tags: ["Neutered","Independent","Calm"], weight: "5 kg", size: "Medium",
    desc: "Shadow is a sleek, mysterious Domestic Longhair who prefers quiet environments. He's not a lap cat, but he'll settle near you and purr contentedly for hours. Best suited for a calm, adult household — he'll reveal his affectionate side on his own terms."
  },
  {
    id: 11, type: "Cat", name: "Ginger", breed: "Orange Tabby", age: 3, ageLabel: "3 yrs", ageGroup: "young",
    gender: "Male", location: "Buenavista", status: "available",
    img: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=700&q=80",
    tags: ["Vaccinated","Friendly","Social"], weight: "4.5 kg", size: "Medium",
    desc: "Ginger is an outgoing, social Orange Tabby who greets every visitor at the door. He loves belly rubs, feather wands, and sitting in sunny spots. He's been raised around dogs and adapts quickly to new environments — a true extrovert in a cat's body."
  },
  {
    id: 12, type: "Cat", name: "Bella", breed: "Calico", age: 5, ageLabel: "5 yrs", ageGroup: "adult",
    gender: "Female", location: "Torrijos", status: "pending",
    img: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=700&q=80",
    tags: ["Spayed","Calm","Senior-friendly"], weight: "3.8 kg", size: "Small",
    desc: "Bella is a beautiful Calico with a gentle soul. She's spent most of her life in a quiet home and prefers the same. She loves soft music, cozy spots, and slow mornings. She would be perfect for a retiree or someone working from home."
  }
];

// ===== TAG ICON MAP =====
const TAG_ICONS = {
  "Vaccinated":     "bi-shield-check-fill text-success",
  "Spayed":         "bi-scissors",
  "Neutered":       "bi-scissors",
  "House-trained":  "bi-house-heart-fill",
  "Healthy":        "bi-heart-pulse-fill text-danger",
  "Indoor":         "bi-house-fill",
  "Puppy":          "bi-star-fill text-warning",
  "Kid-friendly":   "bi-people-fill",
  "Friendly":       "bi-emoji-smile-fill text-warning",
  "Calm":           "bi-moon-stars-fill",
  "Gentle":         "bi-feather",
  "Playful":        "bi-controller",
  "Energetic":      "bi-lightning-fill text-warning",
  "Loyal":          "bi-award-fill",
  "Affectionate":   "bi-heart-fill text-danger",
  "Lap cat":        "bi-heart-fill text-danger",
  "Social":         "bi-chat-heart-fill",
  "Independent":    "bi-person-fill",
  "Vocal":          "bi-volume-up-fill",
  "High-energy":    "bi-lightning-charge-fill text-warning",
  "Senior-friendly":"bi-cup-hot-fill",
};

// ===== LOCATION → SHELTER MAP =====
const SHELTERS = {
  "Boac":        "Boac Animal Shelter",
  "Gasan":       "Gasan Rescue Center",
  "Mogpog":      "Mogpog Animal Welfare",
  "Santa Cruz":  "Santa Cruz Shelter",
  "Buenavista":  "Buenavista Animal Care",
  "Torrijos":    "Torrijos Pet Rescue",
};

// ===== LOAD PET FROM URL =====
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const petId  = parseInt(params.get('id'));
  const pet    = PETS.find(p => p.id === petId);

  if (!pet) {
    document.body.innerHTML = `
      <div style="text-align:center;padding:80px 20px">
        <div style="font-size:60px">🐾</div>
        <h2 style="margin-top:16px">Pet not found</h2>
        <p style="color:#777">This pet may have already found a home!</p>
        <a href="pets.html" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#c9a84c;color:#fff;border-radius:10px;text-decoration:none;font-weight:700">← Back to Find a Pet</a>
      </div>`;
    return;
  }

  populatePage(pet);
});

function populatePage(pet) {
  const typeEmoji = pet.type === 'Dog' ? '🐕' : '🐈';
  const isAvailable = pet.status === 'available';

  // --- <title> & breadcrumb ---
  document.title = `${pet.name} — Furever Home`;
  const breadcrumbName = document.getElementById('breadcrumb-name');
  if (breadcrumbName) breadcrumbName.textContent = pet.name;

  // --- Main image ---
  const mainImg = document.getElementById('mainImg');
  if (mainImg) {
    mainImg.src = pet.img;
    mainImg.alt = pet.name;
  }

  // --- Status badge ---
  const badge = document.getElementById('statusBadge');
  if (badge) {
    badge.textContent = isAvailable ? 'Available' : 'Pending';
    badge.className = `pet-status detail-badge ${isAvailable ? 'available' : 'pending'}`;
  }

  // --- Thumbnail strip (reuse main image; real app would have multiple) ---
  const thumbsContainer = document.getElementById('thumbsContainer');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = `
      <img src="${pet.img.replace('w=700','w=200')}" class="pet-thumb active-thumb" onclick="switchImg(this)" alt="${pet.name}"/>`;
  }

  // --- Type label ---
  const typeEl = document.getElementById('petType');
  if (typeEl) typeEl.textContent = `${typeEmoji} ${pet.type}`;

  // --- Name ---
  const nameEl = document.getElementById('petName');
  if (nameEl) nameEl.textContent = pet.name;

  // --- About heading ---
  const aboutHeading = document.getElementById('aboutHeading');
  if (aboutHeading) aboutHeading.textContent = `About ${pet.name}`;

  // --- Location ---
  const locEl = document.getElementById('petLocation');
  if (locEl) locEl.innerHTML = `<i class="bi bi-geo-alt-fill text-gold"></i> ${pet.location}, Marinduque`;

  // --- Stats grid ---
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setVal('statBreed',  pet.breed);
  setVal('statAge',    `${pet.age} ${pet.age === 1 ? 'Year' : 'Years'}`);
  setVal('statGender', pet.gender);
  setVal('statSize',   pet.size);
  setVal('statWeight', pet.weight);

  // --- Health / tag badges ---
  const tagsEl = document.getElementById('healthTags');
  if (tagsEl) {
    tagsEl.innerHTML = pet.tags.map(t => {
      const icon = TAG_ICONS[t] || 'bi-check-circle-fill text-success';
      return `<span class="health-tag"><i class="bi ${icon} me-1"></i>${t}</span>`;
    }).join('');
  }

  // --- Description ---
  const descEl = document.getElementById('petDesc');
  if (descEl) descEl.textContent = pet.desc;

  // --- Shelter / owner ---
  const shelterEl = document.getElementById('shelterName');
  if (shelterEl) shelterEl.textContent = SHELTERS[pet.location] || `${pet.location} Animal Shelter`;

  // --- Adopt button ---
  const adoptBtn = document.getElementById('adoptBtn');
  if (adoptBtn) {
    if (isAvailable) {
      adoptBtn.textContent = '';
      adoptBtn.innerHTML   = `Adopt ${pet.name} <i class="bi bi-arrow-right ms-1"></i>`;
      adoptBtn.href        = `adopt-form.html?id=${pet.id}`;
      adoptBtn.classList.remove('btn-secondary');
      adoptBtn.classList.add('btn-gold');
    } else {
      adoptBtn.textContent = 'Currently Pending';
      adoptBtn.classList.add('btn-secondary');
      adoptBtn.classList.remove('btn-gold');
      adoptBtn.removeAttribute('href');
      adoptBtn.style.pointerEvents = 'none';
    }
  }
}

// ===== IMAGE SWITCHER =====
function switchImg(el) {
  document.getElementById('mainImg').src = el.src.replace('w=200','w=700');
  document.querySelectorAll('.pet-thumb').forEach(t => t.classList.remove('active-thumb'));
  el.classList.add('active-thumb');
}

// ===== FAVOURITE TOGGLE =====
function toggleFav(btn) {
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  if (icon) {
    icon.classList.toggle('bi-heart');
    icon.classList.toggle('bi-heart-fill');
  }
}

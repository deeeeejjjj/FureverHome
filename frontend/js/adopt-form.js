// ===== PET DATABASE =====
const PETS = [
  {
    id: 1, type: "Dog", name: "Max", breed: "Golden Retriever", age: 2, ageLabel: "2 yrs",
    gender: "Male", location: "Boac", status: "available",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=120&q=80",
  },
  {
    id: 2, type: "Dog", name: "Buddy", breed: "Labrador Mix", age: 3, ageLabel: "3 yrs",
    gender: "Male", location: "Gasan", status: "available",
    img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&q=80",
  },
  {
    id: 3, type: "Dog", name: "Rocky", breed: "Aspin Mix", age: 5, ageLabel: "5 yrs",
    gender: "Male", location: "Buenavista", status: "available",
    img: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=120&q=80",
  },
  {
    id: 4, type: "Dog", name: "Coco", breed: "Dachshund", age: 4, ageLabel: "4 yrs",
    gender: "Female", location: "Santa Cruz", status: "available",
    img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=120&q=80",
  },
  {
    id: 5, type: "Dog", name: "Kiko", breed: "Shih Tzu Mix", age: 2, ageLabel: "2 yrs",
    gender: "Male", location: "Torrijos", status: "available",
    img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=120&q=80",
  },
  {
    id: 6, type: "Dog", name: "Bruno", breed: "Labrador Retriever", age: 1, ageLabel: "1 yr",
    gender: "Male", location: "Mogpog", status: "pending",
    img: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=120&q=80",
  },
  {
    id: 7, type: "Cat", name: "Luna", breed: "Domestic Shorthair", age: 1, ageLabel: "1 yr",
    gender: "Female", location: "Gasan", status: "available",
    img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=120&q=80",
  },
  {
    id: 8, type: "Cat", name: "Nala", breed: "Persian Mix", age: 2, ageLabel: "2 yrs",
    gender: "Female", location: "Boac", status: "available",
    img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&q=80",
  },
  {
    id: 9, type: "Cat", name: "Mochi", breed: "Siamese Mix", age: 1, ageLabel: "1 yr",
    gender: "Female", location: "Mogpog", status: "available",
    img: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=120&q=80",
  },
  {
    id: 10, type: "Cat", name: "Shadow", breed: "Domestic Longhair", age: 4, ageLabel: "4 yrs",
    gender: "Male", location: "Santa Cruz", status: "available",
    img: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=120&q=80",
  },
  {
    id: 11, type: "Cat", name: "Ginger", breed: "Orange Tabby", age: 3, ageLabel: "3 yrs",
    gender: "Male", location: "Buenavista", status: "available",
    img: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=120&q=80",
  },
  {
    id: 12, type: "Cat", name: "Bella", breed: "Calico", age: 5, ageLabel: "5 yrs",
    gender: "Female", location: "Torrijos", status: "pending",
    img: "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=120&q=80",
  }
];

// ===== POPULATE PAGE FROM URL ?id= =====
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const petId  = parseInt(params.get('id'));
  const pet    = PETS.find(p => p.id === petId);

  if (!pet) {
    // Fallback: redirect back to pets list if ID is missing/invalid
    window.location.href = 'pets.html';
    return;
  }

  const isAvailable = pet.status === 'available';

  // Page title
  document.title = `Adopt ${pet.name} — Furever Home`;

  // Breadcrumb last item
  const crumb = document.getElementById('breadcrumbPet');
  if (crumb) crumb.textContent = `Adopt ${pet.name}`;

  // Header subtitle
  const subtitle = document.getElementById('headerSubtitle');
  if (subtitle) subtitle.innerHTML = `Fill in your details to apply for adopting <strong>${pet.name}</strong> the ${pet.breed}.`;

  // Pet summary card
  const img = document.getElementById('summaryImg');
  if (img) { img.src = pet.img; img.alt = pet.name; }

  const summaryName = document.getElementById('summaryName');
  if (summaryName) summaryName.textContent = pet.name;

  const summaryMeta = document.getElementById('summaryMeta');
  if (summaryMeta) summaryMeta.textContent = `${pet.breed} · ${pet.ageLabel} · ${pet.gender} · ${pet.location}`;

  const summaryBadge = document.getElementById('summaryBadge');
  if (summaryBadge) {
    summaryBadge.textContent = isAvailable ? 'Available' : 'Pending';
    summaryBadge.className   = `badge-status ms-auto ${isAvailable ? 'badge-available' : 'badge-pending'}`;
    summaryBadge.style.alignSelf = 'flex-start';
  }

  // "Why adopt" textarea placeholder
  const whyTextarea = document.getElementById('whyAdopt');
  if (whyTextarea) whyTextarea.placeholder = `Tell us why you'd be a great fit for ${pet.name} and what your plans are for their care...`;

  const safetyTextarea = document.getElementById('safetyPlan');
  if (safetyTextarea) safetyTextarea.placeholder = `e.g. secure yard, regular vet visits, daily exercise for ${pet.name}...`;

  // "Go Back" button → back to the correct pet-detail page
  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.href = `pet-detail.html?id=${pet.id}`;

  // Store pet id for submit
  const hiddenId = document.getElementById('hiddenPetId');
  if (hiddenId) hiddenId.value = pet.id;
});

// ===== SUBMIT =====
function submitAdoption(e) {
  e.preventDefault();
  showToast('Application submitted! We\'ll contact you soon. 🐾');
  setTimeout(() => window.location.href = 'user-dashboard.html', 2200);
}

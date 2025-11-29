// js/admin.js
// Fleet management admin page logic.
// Uses localStorage key 'fleets_v1' to persist vehicles.

const STORAGE_KEY = 'fleets_v1';
const defaultImage = 'https://via.placeholder.com/400x240?text=Vehicle'; // replace with your sample image link

// DOM refs
const regNoInput = document.getElementById('regNo');
const categoryInput = document.getElementById('category');
const driverInput = document.getElementById('driverName');
const isAvailableInput = document.getElementById('isAvailable');
const addFleetBtn = document.getElementById('addFleetBtn');
const cardsContainer = document.getElementById('cardsContainer');

const filterCategory = document.getElementById('filterCategory');
const filterAvailability = document.getElementById('filterAvailability');
const clearFiltersBtn = document.getElementById('clearFilters');
const logoutBtn = document.getElementById('logoutBtn');

let fleets = loadFleets(); // array of objects

// --- Initialization ---
renderCards();

// --- Event listeners ---
addFleetBtn.addEventListener('click', handleAddFleet);
filterCategory.addEventListener('change', renderCards);
filterAvailability.addEventListener('change', renderCards);
clearFiltersBtn.addEventListener('click', handleClearFilters);
logoutBtn.addEventListener('click', () => {
  // just go back to login page
  window.location.href = 'index.html';
});

// --- Functions ---

function loadFleets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Could not parse fleets from storage', e);
    return [];
  }
}

function saveFleets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fleets));
}

function handleAddFleet() {
  const regNo = regNoInput.value.trim();
  const category = categoryInput.value;
  const driverName = driverInput.value.trim();
  const availability = isAvailableInput.value;

  // Validation
  if (!regNo) {
    alert('Registration number is required.');
    return;
  }
  if (!category) {
    alert('Please select a category.');
    return;
  }
  if (!driverName) {
    alert('Driver name is required.');
    return;
  }

  // Create fleet object
  const fleet = {
    id: Date.now().toString(),
    regNo,
    category,
    driverName,
    availability, // "Available" or "Unavailable"
    image: defaultImage
  };

  fleets.unshift(fleet); // add to front
  saveFleets();
  clearForm();
  renderCards();
}

function clearForm() {
  regNoInput.value = '';
  categoryInput.value = '';
  driverInput.value = '';
  isAvailableInput.value = 'Available';
}

function handleClearFilters() {
  filterCategory.value = 'All';
  filterAvailability.value = 'All';
  renderCards();
}

function renderCards() {
  // apply filters
  const catFilter = filterCategory.value;
  const availFilter = filterAvailability.value;

  const visible = fleets.filter(f => {
    if (catFilter !== 'All' && f.category !== catFilter) return false;
    if (availFilter !== 'All' && f.availability !== availFilter) return false;
    return true;
  });

  // clear UI
  cardsContainer.innerHTML = '';

  if (visible.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.textContent = 'No vehicles to show.';
    cardsContainer.appendChild(empty);
    return;
  }

  visible.forEach(fleet => {
    const card = document.createElement('div');
    card.className = 'fleet-card card';
    card.dataset.id = fleet.id;

    // image
    const img = document.createElement('img');
    img.src = fleet.image || defaultImage;
    img.alt = 'vehicle';

    // body
    const body = document.createElement('div');
    body.className = 'card-body';

    const regRow = document.createElement('div');
    regRow.className = 'meta-row';
    regRow.innerHTML = `<div class="label">Reg:</div><div>${fleet.regNo}</div>`;

    const catRow = document.createElement('div');
    catRow.className = 'meta-row';
    catRow.innerHTML = `<div class="label">Category:</div><div>${fleet.category}</div>`;

    const driverRow = document.createElement('div');
    driverRow.className = 'meta-row';
    driverRow.innerHTML = `<div class="label">Driver:</div><div id="driver-${fleet.id}">${fleet.driverName}</div>`;

    const availRow = document.createElement('div');
    availRow.className = 'meta-row';
    availRow.innerHTML = `<div class="label">Availability:</div><div id="avail-${fleet.id}">${fleet.availability}</div>`;

    // actions
    const actions = document.createElement('div');
    actions.className = 'actions';

    const updateBtn = document.createElement('button');
    updateBtn.className = 'btn ghost small';
    updateBtn.textContent = 'Update Driver';
    updateBtn.addEventListener('click', () => updateDriver(fleet.id));

    const changeAvailBtn = document.createElement('button');
    changeAvailBtn.className = 'btn small';
    changeAvailBtn.textContent = 'Change Availability';
    changeAvailBtn.addEventListener('click', () => toggleAvailability(fleet.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn small danger';
    deleteBtn.textContent = 'Delete Vehicle';
    deleteBtn.addEventListener('click', () => deleteVehicle(fleet.id));

    actions.appendChild(updateBtn);
    actions.appendChild(changeAvailBtn);
    actions.appendChild(deleteBtn);

    // assemble
    body.appendChild(regRow);
    body.appendChild(catRow);
    body.appendChild(driverRow);
    body.appendChild(availRow);
    body.appendChild(actions);

    card.appendChild(img);
    card.appendChild(body);

    cardsContainer.appendChild(card);
  });
}

function updateDriver(id) {
  const fleet = fleets.find(f => f.id === id);
  if (!fleet) return;

  const current = fleet.driverName || '';
  const newDriver = prompt('Enter new driver name', current);

  // If user pressed Cancel, prompt returns null -> do nothing
  if (newDriver === null) return;

  // Trim and validate non-empty
  if (newDriver.trim() === '') {
    alert('Driver name cannot be empty.');
    return;
  }

  fleet.driverName = newDriver.trim();
  saveFleets();
  // update DOM quickly without full re-render
  const driverEl = document.getElementById(`driver-${id}`);
  if (driverEl) driverEl.textContent = fleet.driverName;
}

function toggleAvailability(id) {
  const fleet = fleets.find(f => f.id === id);
  if (!fleet) return;

  fleet.availability = fleet.availability === 'Available' ? 'Unavailable' : 'Available';
  saveFleets();

  // update DOM
  const availEl = document.getElementById(`avail-${id}`);
  if (availEl) availEl.textContent = fleet.availability;

  // If filters active and card no longer matches, re-render to hide or show as needed
  const catFilter = filterCategory.value;
  const availFilter = filterAvailability.value;
  if ((catFilter !== 'All' && fleet.category !== catFilter) || (availFilter !== 'All' && fleet.availability !== availFilter)) {
    renderCards();
  }
}

function deleteVehicle(id) {
  const confirmed = confirm('Are you sure you want to delete this vehicle?');
  if (!confirmed) return;

  // remove
  fleets = fleets.filter(f => f.id !== id);
  saveFleets();
  renderCards();
}

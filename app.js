// 1. Initialize State from LocalStorage
let appointments = JSON.parse(localStorage.getItem('clinic_appointments')) || [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const appointmentForm = document.getElementById('appointment-form');
const appointmentList = document.getElementById('appointment-list');
const badgeCounter = document.getElementById('appointment-badge');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');

// Stat Counter Elements
const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statCompleted = document.getElementById('stat-completed');

// Initial Render on Page Load
renderAppointments();

// 2. Form Submission Handler
appointmentForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const newAppointment = {
    id: Date.now(),
    patientName: document.getElementById('patient-name').value.trim(),
    doctor: document.getElementById('doctor').value,
    date: document.getElementById('app-date').value,
    time: document.getElementById('app-time').value,
    triage: document.getElementById('triage-level').value,
    symptoms: document.getElementById('symptoms').value.trim(),
    status: 'Scheduled'
  };

  appointments.push(newAppointment);
  saveAndRender();
  appointmentForm.reset();
});

// 3. Save to LocalStorage & Render UI
function saveAndRender() {
  localStorage.setItem('clinic_appointments', JSON.stringify(appointments));
  renderAppointments();
}

// 4. Update Analytics Stats Cards
function updateStats() {
  const total = appointments.length;
  const pending = appointments.filter(a => a.status === 'Scheduled').length;
  const completed = appointments.filter(a => a.status === 'Completed').length;

  statTotal.textContent = total;
  statPending.textContent = pending;
  statCompleted.textContent = completed;
}

// 5. Main Render Function
function renderAppointments() {
  updateStats();
  appointmentList.innerHTML = '';

  // Apply Filter + Search Filter
  const filtered = appointments.filter(app => {
    const matchesFilter = 
      currentFilter === 'all' ? true :
      currentFilter === 'Urgent' ? app.triage === 'Urgent' :
      app.status === currentFilter;

    const matchesSearch = 
      app.patientName.toLowerCase().includes(searchQuery) ||
      app.doctor.toLowerCase().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  badgeCounter.textContent = `${filtered.length} Records`;

  if (filtered.length === 0) {
    appointmentList.innerHTML = `<p class="empty-state">No matching appointments found.</p>`;
    return;
  }

  filtered.forEach(app => {
    const card = document.createElement('div');
    card.classList.add('appointment-card');
    
    // Priority class styling
    if (app.status === 'Completed') {
      card.classList.add('completed');
    } else {
      card.classList.add(`triage-${app.triage.toLowerCase()}`);
    }

    card.innerHTML = `
      <div class="card-top">
        <span class="patient-name">👤 ${app.patientName}</span>
        <span class="triage-tag ${app.triage.toLowerCase()}">${app.triage}</span>
      </div>
      <div class="doctor-info">🩺 ${app.doctor}</div>
      <div class="datetime-info">📅 ${app.date} at 🕒 ${app.time} | <strong>Status: ${app.status}</strong></div>
      <div class="symptoms-text"><strong>Notes:</strong> ${app.symptoms}</div>
      <div class="action-row">
        <button class="btn-status" onclick="toggleStatus(${app.id})">
          ${app.status === 'Scheduled' ? 'Mark Completed' : 'Re-open Booking'}
        </button>
        <button class="btn-cancel" onclick="deleteAppointment(${app.id})">Cancel</button>
      </div>
    `;

    appointmentList.appendChild(card);
  });
}

// 6. Action Functions
window.toggleStatus = function (id) {
  appointments = appointments.map(app => {
    if (app.id === id) {
      return { ...app, status: app.status === 'Scheduled' ? 'Completed' : 'Scheduled' };
    }
    return app;
  });
  saveAndRender();
};

window.deleteAppointment = function (id) {
  appointments = appointments.filter(app => app.id !== id);
  saveAndRender();
};

// 7. Search Input Event
searchInput.addEventListener('input', function (e) {
  searchQuery = e.target.value.toLowerCase();
  renderAppointments();
});

// 8. Filter Buttons Events
filterBtns.forEach(btn => {
  btn.addEventListener('click', function () {
    filterBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.getAttribute('data-filter');
    renderAppointments();
  });
});
// Date navigation functionality
let currentDate = new Date('2026-01-22');
const fixturesWidget = document.getElementById('fixtures-widget');
const currentDateSpan = document.getElementById('current-date');
const datePicker = document.getElementById('date-picker');
const widgetContainer = document.querySelector('.widget-container');

function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function updateDate(newDate) {
  currentDate = new Date(newDate);
  const dateString = currentDate.toISOString().split('T')[0];

  // Update display
  currentDateSpan.textContent = formatDate(currentDate);
  datePicker.value = dateString;

  // Update widget
  if (fixturesWidget) {
    fixturesWidget.setAttribute('data-date', dateString);
  }
}

// Previous day button
document.getElementById('prev-date')?.addEventListener('click', () => {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() - 1);
  updateDate(newDate);
});

// Next day button
document.getElementById('next-date')?.addEventListener('click', () => {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + 1);
  updateDate(newDate);
});

// Date picker input
datePicker?.addEventListener('change', (e) => {
  updateDate(e.target.value);
});

// Modal functionality
const modal = document.getElementById('match-detail');
const closeBtn = document.querySelector('.close');

closeBtn?.addEventListener('click', () => {
  modal.classList.remove('active');
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

// Listen for widget interactions
document.addEventListener('widget-click', (e) => {
  if (e.detail.type === 'fixture') {
    modal.classList.add('active');
  }
});

// Hide loading indicator when widget loads
window.addEventListener('load', () => {
  // Give widgets a moment to initialize
  setTimeout(() => {
    if (widgetContainer) {
      widgetContainer.classList.add('widget-loaded');
    }
  }, 2000);

  // Force date synchronization on page load - ensures all 3 displays match
  updateDate(currentDate);
});

// Initialize with current date on page load
if (currentDateSpan && !currentDateSpan.textContent) {
  currentDateSpan.textContent = formatDate(currentDate);
}

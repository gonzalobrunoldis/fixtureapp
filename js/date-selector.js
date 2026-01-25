// Date navigation functionality
let currentDate = new Date('2025-01-21');
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
const modalWidget = document.getElementById('match-detail-widget');
const modalLoading = document.getElementById('modal-loading');
const closeBtn = document.querySelector('.close');

// Function to open modal
function openModal() {
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Show loading indicator
    if (modalLoading) {
      modalLoading.style.display = 'flex';
    }

    // Hide loading after widget has time to load
    setTimeout(() => {
      if (modalLoading) {
        modalLoading.style.display = 'none';
      }
    }, 2000);
  }
}

// Function to close modal
function closeModal() {
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Close button click
closeBtn?.addEventListener('click', closeModal);

// Click outside modal to close
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// ESC key to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('active')) {
    closeModal();
  }
});

// Method 1: Listen for widget-click event (if widget library supports it)
document.addEventListener('widget-click', (e) => {
  if (e.detail?.type === 'fixture' || e.detail?.type === 'game') {
    openModal();
  }
});

// Method 2: Observe changes to modal widget (fallback if widget-click doesn't work)
if (modalWidget && modal) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // If widget content changes (fixture data loaded), open modal
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        openModal();
      }
      // Check for attribute changes that indicate widget data loaded
      if (mutation.type === 'attributes' &&
          (mutation.attributeName === 'data-fixture' ||
           mutation.attributeName === 'data-id')) {
        openModal();
      }
    });
  });

  // Start observing the modal widget for changes
  observer.observe(modalWidget, {
    childList: true,
    attributes: true,
    attributeFilter: ['data-fixture', 'data-id', 'data-game']
  });
}

// Method 3: Click event on fixtures widget (additional fallback)
if (fixturesWidget) {
  fixturesWidget.addEventListener('click', (e) => {
    // If click is on a fixture element, prepare to show modal
    // The widget library will handle populating the modal widget
    const fixtureElement = e.target.closest('[data-fixture-id]') ||
                          e.target.closest('.fixture') ||
                          e.target.closest('[class*="match"]');

    if (fixtureElement) {
      // Give widget time to populate before showing modal
      setTimeout(() => {
        if (modalWidget && modalWidget.innerHTML.trim()) {
          openModal();
        }
      }, 100);
    }
  });
}

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

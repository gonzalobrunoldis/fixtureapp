// Automated test script for Fixtures App MVP
// Run this in the browser console to test functionality

console.log('🧪 Starting Automated Tests...\n');

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

function test(name, fn) {
  try {
    fn();
    tests.passed++;
    tests.results.push(`✅ ${name}`);
    console.log(`✅ ${name}`);
  } catch (error) {
    tests.failed++;
    tests.results.push(`❌ ${name}: ${error.message}`);
    console.error(`❌ ${name}:`, error.message);
  }
}

// Test 1: Check required elements exist
test('Header element exists', () => {
  const header = document.querySelector('.app-header');
  if (!header) throw new Error('Header not found');
});

test('Navigation elements exist', () => {
  const nav = document.querySelector('.app-header nav');
  if (!nav) throw new Error('Navigation not found');
  const links = nav.querySelectorAll('a');
  if (links.length !== 3) throw new Error(`Expected 3 nav links, found ${links.length}`);
});

test('Date selector exists', () => {
  const selector = document.querySelector('.date-selector');
  if (!selector) throw new Error('Date selector not found');
});

test('Previous date button exists', () => {
  const btn = document.getElementById('prev-date');
  if (!btn) throw new Error('Previous date button not found');
});

test('Next date button exists', () => {
  const btn = document.getElementById('next-date');
  if (!btn) throw new Error('Next date button not found');
});

test('Date display exists', () => {
  const display = document.getElementById('current-date');
  if (!display) throw new Error('Date display not found');
});

test('Date picker input exists', () => {
  const picker = document.getElementById('date-picker');
  if (!picker) throw new Error('Date picker not found');
});

test('Fixtures widget exists', () => {
  const widget = document.getElementById('fixtures-widget');
  if (!widget) throw new Error('Fixtures widget not found');
});

test('Modal exists', () => {
  const modal = document.getElementById('match-detail');
  if (!modal) throw new Error('Match detail modal not found');
});

test('Close button exists in modal', () => {
  const closeBtn = document.querySelector('.close');
  if (!closeBtn) throw new Error('Modal close button not found');
});

// Test 2: Check CSS is loaded
test('Styles are loaded', () => {
  const header = document.querySelector('.app-header');
  const styles = window.getComputedStyle(header);
  const bgColor = styles.backgroundColor;
  // Check if background is not white (default)
  if (bgColor === 'rgb(255, 255, 255)' || bgColor === 'rgba(0, 0, 0, 0)') {
    throw new Error('Styles may not be loaded correctly');
  }
});

// Test 3: Check widget configuration
test('Widget config exists', () => {
  const config = document.querySelector('api-sports-widget[data-type="config"]');
  if (!config) throw new Error('Widget config not found');
  if (!config.getAttribute('data-key')) throw new Error('API key not configured');
});

test('Widget script is loaded', () => {
  const script = document.querySelector('script[src*="widgets.api-sports.io"]');
  if (!script) throw new Error('Widget script not found');
});

test('Date selector script is loaded', () => {
  const script = document.querySelector('script[src="js/date-selector.js"]');
  if (!script) throw new Error('Date selector script not found');
});

// Test 4: Test date navigation logic (if on index.html)
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  test('Date navigation variables are initialized', () => {
    if (typeof currentDate === 'undefined') {
      throw new Error('currentDate variable not initialized');
    }
  });

  test('Date format function works', () => {
    if (typeof formatDate !== 'function') {
      throw new Error('formatDate function not defined');
    }
    const testDate = new Date('2026-01-22');
    const formatted = formatDate(testDate);
    if (!formatted.includes('January')) {
      throw new Error('Date formatting incorrect');
    }
  });

  test('Update date function works', () => {
    if (typeof updateDate !== 'function') {
      throw new Error('updateDate function not defined');
    }
  });
}

// Test 5: Responsive design check
test('Viewport meta tag exists', () => {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) throw new Error('Viewport meta tag not found');
  if (!viewport.content.includes('width=device-width')) {
    throw new Error('Viewport not properly configured');
  }
});

// Print summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary');
console.log('='.repeat(50));
console.log(`Total Tests: ${tests.passed + tests.failed}`);
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`Success Rate: ${Math.round((tests.passed / (tests.passed + tests.failed)) * 100)}%`);
console.log('='.repeat(50));

if (tests.failed > 0) {
  console.log('\n❌ Failed Tests:');
  tests.results.filter(r => r.startsWith('❌')).forEach(r => console.log(r));
}

// Return results for programmatic access
window.testResults = tests;
console.log('\n💡 Access detailed results via: window.testResults');

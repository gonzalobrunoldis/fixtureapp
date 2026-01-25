// MVP Validation Script - Run with Node.js
// This script validates the implementation without needing a browser

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Fixtures App MVP Implementation\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

function pass(msg) {
  console.log(`✅ ${msg}`);
  results.passed++;
}

function fail(msg, details = '') {
  console.log(`❌ ${msg}`);
  if (details) console.log(`   ${details}`);
  results.failed++;
  results.issues.push({ type: 'error', message: msg, details });
}

function warn(msg, details = '') {
  console.log(`⚠️  ${msg}`);
  if (details) console.log(`   ${details}`);
  results.warnings++;
  results.issues.push({ type: 'warning', message: msg, details });
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    pass(`${description} exists`);
    return true;
  } else {
    fail(`${description} not found`, filePath);
    return false;
  }
}

function checkFileContent(filePath, searchStrings, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const missing = [];

    searchStrings.forEach(str => {
      if (!content.includes(str)) {
        missing.push(str);
      }
    });

    if (missing.length === 0) {
      pass(`${description}`);
      return true;
    } else {
      fail(`${description}`, `Missing: ${missing.join(', ')}`);
      return false;
    }
  } catch (error) {
    fail(`Error reading ${filePath}`, error.message);
    return false;
  }
}

console.log('📁 Checking File Structure...\n');

// Check HTML files
checkFileExists('index.html', 'Main fixtures page (index.html)');
checkFileExists('standings.html', 'Standings page');
checkFileExists('schedule.html', 'Schedule page');
checkFileExists('tests/test-widget.html', 'Widget test page');

// Check CSS files
checkFileExists('css/styles.css', 'Main stylesheet');

// Check JS files
checkFileExists('js/date-selector.js', 'Date selector JavaScript');

// Check batch file
checkFileExists('serve.bat', 'Local server script');

console.log('\n📄 Validating index.html...\n');

if (fs.existsSync('index.html')) {
  const indexHtml = fs.readFileSync('index.html', 'utf8');

  // Check essential elements
  checkFileContent('index.html', [
    '<link rel="stylesheet" href="css/styles.css">',
    '<script src="js/date-selector.js">',
    'data-type="games"',
    'data-league="2"',
    'data-season="2024"',
    'id="fixtures-widget"',
    'id="prev-date"',
    'id="next-date"',
    'id="current-date"',
    'id="date-picker"'
  ], 'Index.html has all required elements');

  // Check navigation
  checkFileContent('index.html', [
    'href="index.html"',
    'href="standings.html"',
    'href="schedule.html"'
  ], 'Navigation links present');

  // Check widget configuration
  checkFileContent('index.html', [
    'data-type="config"',
    'data-key="23d8de870ce857b71cca01de36de26aa"',
    'data-sport="football"',
    'data-theme="dark"'
  ], 'Widget configuration present');

  // Check widget script
  checkFileContent('index.html', [
    'widgets.api-sports.io'
  ], 'Widget script included');
}

console.log('\n📄 Validating standings.html...\n');

if (fs.existsSync('standings.html')) {
  checkFileContent('standings.html', [
    '<link rel="stylesheet" href="css/styles.css">',
    'data-type="standings"',
    'data-league="2"',
    'data-season="2024"'
  ], 'Standings page has required elements');

  // Check polish features (FIX-20)
  checkFileContent('standings.html', [
    'class="page-description"',
    'id="loading-indicator"',
    'class="loading"',
    'Loading standings...'
  ], 'Standings page polish features present (FIX-20)');
}

console.log('\n📄 Validating schedule.html...\n');

if (fs.existsSync('schedule.html')) {
  checkFileContent('schedule.html', [
    '<link rel="stylesheet" href="css/styles.css">',
    'data-type="league"',
    'data-league="2"',
    'data-season="2024"'
  ], 'Schedule page has required elements');

  // Check polish features (FIX-20)
  checkFileContent('schedule.html', [
    'class="page-description"',
    'id="loading-indicator"',
    'class="loading"',
    'Loading schedule...'
  ], 'Schedule page polish features present (FIX-20)');
}

console.log('\n🎨 Validating CSS (styles.css)...\n');

if (fs.existsSync('css/styles.css')) {
  const css = fs.readFileSync('css/styles.css', 'utf8');

  // Check CSS variables
  checkFileContent('css/styles.css', [
    '--bg-primary',
    '--bg-secondary',
    '--text-primary',
    '--accent-color'
  ], 'CSS variables defined');

  // Check critical styles
  checkFileContent('css/styles.css', [
    '.app-header',
    '.date-selector',
    '.modal',
    '.widget-container',
    '.page-description',
    '.loading'
  ], 'Essential component styles present');

  // Check responsive design
  checkFileContent('css/styles.css', [
    '@media (max-width: 768px)'
  ], 'Responsive media queries present');
}

console.log('\n⚙️  Validating JavaScript (date-selector.js)...\n');

if (fs.existsSync('js/date-selector.js')) {
  const js = fs.readFileSync('js/date-selector.js', 'utf8');

  // Check key functions
  checkFileContent('js/date-selector.js', [
    'function formatDate',
    'function updateDate',
    'getElementById(\'prev-date\')',
    'getElementById(\'next-date\')',
    'getElementById(\'date-picker\')'
  ], 'Core date navigation functions present');

  // Check modal functionality
  checkFileContent('js/date-selector.js', [
    'getElementById(\'match-detail\')',
    '.close'
  ], 'Modal functionality implemented');

  // Check widget interaction
  checkFileContent('js/date-selector.js', [
    'setAttribute(\'data-date\'',
    'fixturesWidget'
  ], 'Widget date update logic present');

  // Check for potential issues
  if (js.includes('console.log')) {
    warn('Debug console.logs found in date-selector.js', 'Consider removing for production');
  }
}

console.log('\n🔧 Checking Configuration...\n');

// Check API key is configured
if (fs.existsSync('index.html')) {
  const content = fs.readFileSync('index.html', 'utf8');
  if (content.includes('data-key="23d8de870ce857b71cca01de36de26aa"')) {
    pass('API key configured');
  } else {
    fail('API key not found or incorrect');
  }
}

// Check league ID (Champions League = 2)
if (fs.existsSync('index.html')) {
  const content = fs.readFileSync('index.html', 'utf8');
  if (content.includes('data-league="2"')) {
    pass('Champions League ID configured (league=2)');
  } else {
    warn('League ID may not be set to Champions League');
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
console.log('='.repeat(60));

if (results.issues.length > 0) {
  console.log('\n🔍 Issues Found:\n');
  results.issues.forEach((issue, idx) => {
    const icon = issue.type === 'error' ? '❌' : '⚠️';
    console.log(`${idx + 1}. ${icon} ${issue.message}`);
    if (issue.details) {
      console.log(`   ${issue.details}`);
    }
  });
}

console.log('\n' + '='.repeat(60));

if (results.failed === 0) {
  console.log('✅ MVP IMPLEMENTATION VALIDATED SUCCESSFULLY!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start the server: serve.bat');
  console.log('2. Open http://localhost:8000/test-widget.html');
  console.log('3. Test in browser using TEST_CHECKLIST.md');
  console.log('4. Test on different devices/browsers');
} else {
  console.log('❌ VALIDATION FAILED - Please fix the issues above');
  process.exit(1);
}

console.log('='.repeat(60) + '\n');

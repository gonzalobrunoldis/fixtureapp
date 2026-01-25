# Testing Guide - Fixtures App MVP

This document outlines the testing procedures for the Champions League Fixtures App.

## 🧪 Test Cases

### Test 1: Page Load & Widget Integration

**File**: `test-widget.html`

**Steps**:
1. Open `test-widget.html` in a web browser
2. Wait for widgets to load (should take 2-5 seconds)
3. Check browser console for errors

**Expected Results**:
- ✅ Page loads without errors
- ✅ Widgets display with dark theme
- ✅ Team logos are visible
- ✅ Data loads from API-Football

---

### Test 2: Main Fixtures Page

**File**: `index.html`

#### 2a. Initial Load
**Steps**:
1. Open `index.html` in browser
2. Verify page structure loads

**Expected Results**:
- ✅ Header with navigation appears
- ✅ Date selector shows current date (Jan 22, 2026)
- ✅ Games widget loads and displays fixtures
- ✅ Dark theme is applied

#### 2b. Date Navigation - Previous Day
**Steps**:
1. Click the "←" (previous day) button
2. Observe widget update

**Expected Results**:
- ✅ Date display updates to Jan 21, 2026
- ✅ Date picker input updates
- ✅ Widget refreshes with new date's fixtures

#### 2c. Date Navigation - Next Day
**Steps**:
1. Click the "→" (next day) button
2. Observe widget update

**Expected Results**:
- ✅ Date display updates to Jan 23, 2026
- ✅ Date picker input updates
- ✅ Widget refreshes with new date's fixtures

#### 2d. Date Picker
**Steps**:
1. Click the date picker input
2. Select a different date (e.g., Feb 1, 2026)
3. Observe widget update

**Expected Results**:
- ✅ Date display updates to selected date
- ✅ Widget refreshes with selected date's fixtures

#### 2e. Live Updates (Auto-Refresh)
**Steps**:
1. Navigate to a date with live matches (if available)
2. Wait 15 seconds
3. Observe widget behavior

**Expected Results**:
- ✅ Widget automatically refreshes every 15 seconds
- ✅ Live scores update without page reload
- ✅ No flickering or UI disruption

---

### Test 3: Standings Page

**File**: `standings.html`

**Steps**:
1. Open `standings.html` or click "Standings" in navigation
2. Wait for widget to load

**Expected Results**:
- ✅ Page loads with header navigation
- ✅ "Standings" nav item is highlighted
- ✅ Standings widget displays league table
- ✅ Team positions, points, and stats are visible

---

### Test 4: Schedule Page

**File**: `schedule.html`

**Steps**:
1. Open `schedule.html` or click "Schedule" in navigation
2. Wait for widget to load

**Expected Results**:
- ✅ Page loads with header navigation
- ✅ "Schedule" nav item is highlighted
- ✅ League widget displays full schedule
- ✅ All matchdays are visible

---

### Test 5: Navigation Between Pages

**Steps**:
1. Start on `index.html`
2. Click "Standings" link
3. Click "Schedule" link
4. Click "Fixtures" link

**Expected Results**:
- ✅ All page transitions work smoothly
- ✅ Active nav item updates correctly
- ✅ Widgets load on each page

---

### Test 6: Responsive Design

#### 6a. Desktop (1920x1080)
**Expected Results**:
- ✅ Full layout with proper spacing
- ✅ Navigation horizontal
- ✅ Widgets display at full width (max 1200px)

#### 6b. Tablet (768x1024)
**Expected Results**:
- ✅ Layout adapts to smaller width
- ✅ Navigation remains horizontal
- ✅ Widgets remain readable

#### 6c. Mobile (375x667)
**Expected Results**:
- ✅ Date selector stacks vertically
- ✅ Navigation items are compact
- ✅ Widgets are fully responsive
- ✅ All buttons are easily tappable

**Test Tools**:
- Use browser DevTools responsive mode
- Test on actual devices if available

---

### Test 7: Browser Compatibility

**Browsers to Test**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Steps for Each Browser**:
1. Open `index.html`
2. Test date navigation
3. Navigate between pages
4. Check console for errors

**Expected Results**:
- ✅ All functionality works consistently
- ✅ Widgets load and display properly
- ✅ No JavaScript errors
- ✅ Styling appears correct

---

### Test 8: API Integration

**Steps**:
1. Open browser DevTools → Network tab
2. Load `index.html`
3. Monitor API requests

**Expected Results**:
- ✅ Widgets make requests to API-Football
- ✅ Requests return 200 status codes
- ✅ Data is cached (fewer requests on repeated loads)
- ✅ API key is included in requests

**Note**: Free tier has 100 requests/day limit

---

### Test 9: Modal Functionality (Match Details)

**Steps**:
1. Open `index.html`
2. Click on a fixture in the games widget
3. Click the "×" close button
4. Click outside the modal

**Expected Results**:
- ✅ Modal opens when fixture is clicked
- ✅ Game widget loads in modal with match details
- ✅ Close button closes modal
- ✅ Clicking outside modal closes it
- ✅ Modal is centered on screen

---

## 🐛 Known Issues & Limitations

1. **API Rate Limit**: Free tier limited to 100 requests/day
   - Widgets cache internally to minimize requests
   - Refresh rate set to 15 seconds balances updates vs. API usage

2. **Historical Data**: Season 2024 data may be limited
   - Current season data is most complete
   - Future dates may show "No fixtures"

3. **Widget Customization**: Limited to API-Football widget options
   - Cannot deeply customize widget UI
   - Theming limited to: white, grey, dark, blue

---

## ✅ Success Metrics

After testing, verify these metrics are met:

### Technical
- [ ] Page load time < 3 seconds
- [ ] Mobile responsive (all devices)
- [ ] Zero critical JavaScript errors
- [ ] Works in all major browsers

### Functional
- [ ] Date navigation works smoothly
- [ ] Widgets display correct data
- [ ] Auto-refresh works for live matches
- [ ] Navigation between pages works
- [ ] Responsive design adapts properly

### User Experience
- [ ] UI is intuitive and easy to use
- [ ] Dark theme is applied consistently
- [ ] Buttons and controls are accessible
- [ ] Loading states are visible

---

## 📊 Testing Checklist

Use this checklist to track testing progress:

### Quick Smoke Test (5 minutes)
- [ ] Open test-widget.html - widgets load
- [ ] Open index.html - page loads correctly
- [ ] Click prev/next buttons - date changes
- [ ] Open standings.html - table displays
- [ ] Open schedule.html - schedule displays

### Comprehensive Test (20 minutes)
- [ ] All Test Cases 1-9 completed
- [ ] Mobile responsive tested
- [ ] Cross-browser tested
- [ ] All success metrics met
- [ ] No critical bugs found

---

## 🚀 Next Steps After Testing

1. Fix any bugs discovered
2. Document any issues in Linear
3. Optimize performance if needed
4. Proceed to FIX-14 (Enhanced Features)
5. Continue to FIX-15 (Testing & Optimization)
6. Deploy MVP (FIX-16)

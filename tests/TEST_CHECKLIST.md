# 🧪 Testing Checklist - Live Session

Use this checklist while testing the app in your browser.

## Setup
- [ ] Local server is running on http://localhost:8000
- [ ] Browser is open (Chrome, Firefox, Safari, or Edge)

---

## Bug Verification: Date Synchronization & Widget Data (FIX-27)

**Purpose**: Verify fixes for date synchronization bug and widget data loading issue

### Test 1: Initial Date Synchronization (3 min)

**URL**: http://localhost:8000/index.html

**Action**: Load the page and verify all date displays match

1. **Before clicking anything**, check all 3 date displays:
   - [ ] Span text shows "Tuesday, January 21, 2025"
   - [ ] Date picker input shows "2025-01-21"
   - [ ] Widget is requesting data for 2025-01-21

2. **Verify in browser console (F12 → Console)**:
   ```javascript
   console.log({
     spanText: document.getElementById('current-date').textContent,
     pickerValue: document.getElementById('date-picker').value,
     widgetDate: document.getElementById('fixtures-widget').getAttribute('data-date'),
     jsVariable: currentDate.toISOString().split('T')[0]
   });
   ```
   - [ ] All 4 values are identical: "2025-01-21"

### Test 2: Widget Data Loading (2 min)

**Action**: Verify standings and schedule widgets display data (these work reliably on free tier)

**Go to standings.html:**
- [ ] Standings widget shows Champions League table
- [ ] Team names and logos display
- [ ] Points, W/D/L columns visible
- [ ] Dark theme is applied

**Go to schedule.html:**
- [ ] Schedule widget shows full season fixtures
- [ ] Matchday sections visible
- [ ] Team names and match dates shown
- [ ] Dark theme is applied

**Note**: Fixtures widget (index.html) may show "No games" due to free tier date restrictions.

### Test 3: Date Navigation Synchronization (3 min)

**Action**: Test that all 3 displays update together

1. **Click ← (previous day)**:
   - [ ] Span updates to "Monday, January 20, 2025"
   - [ ] Date picker updates to "2025-01-20"
   - [ ] Widget refreshes with new date

2. **Click → (next day) twice**:
   - [ ] Span updates to "Wednesday, January 22, 2025"
   - [ ] Date picker updates to "2025-01-22"
   - [ ] Widget refreshes with new date

3. **Use date picker** to select "2025-02-11":
   - [ ] Span updates to "Tuesday, February 11, 2025"
   - [ ] All 3 displays synchronized to 2025-02-11
   - [ ] Widget shows fixtures for February 11

### Test 4: Multiple Matchday Dates (5 min)

**Action**: Test various Champions League dates to ensure widget data loads

Use date picker to navigate to these dates (season 2024 = 2024/25 Champions League):
- [ ] **January 21, 2025** (League Stage - 7) - Default date
- [ ] **January 22, 2025** (League Stage - 7) - Shows fixtures
- [ ] **January 29, 2025** (League Stage - 8) - Shows fixtures
- [ ] **February 11, 2025** (Round of 16) - Shows fixtures or "No games"

**Note**: Free tier API has date restrictions. Widget may show "No games" for some dates.

### Test 5: Console Error Check (1 min)

**Action**: Verify no JavaScript errors

- [ ] Open DevTools (F12) → Console tab
- [ ] No red error messages related to:
  - date-selector.js
  - Widget loading
  - Attribute updates

### Bug Fix Success Criteria

✅ **Bug is fixed if:**
- All 3 date displays synchronized on every page load
- Standings widget displays Champions League standings (season 2024)
- Schedule widget displays full season schedule (season 2024)
- Date navigation (buttons + picker) updates all 3 displays together
- No console errors
- Default date is January 21, 2025 (League Stage - 7)
- Widget season is 2024 (free tier accessible)

**Known Limitation**: Fixtures widget may show "No games" for specific dates due to free tier API date restrictions. This is expected behavior - the standings and schedule pages work correctly.

---

## FIX-20: Additional Pages Polish Testing (10 min)

**Purpose**: Verify polish improvements to standings and schedule pages

### Standings Page Polish Tests

**URL**: http://localhost:8000/standings.html

**Visual Elements:**
- [ ] Page description appears below header ("View the current Champions League table...")
- [ ] Page description uses secondary text color (gray)
- [ ] Loading indicator shows "Loading standings..." while widget loads
- [ ] Loading indicator has spinning animation
- [ ] Loading indicator disappears when widget loads

**Widget Functionality:**
- [ ] Standings widget displays league table
- [ ] Team logos are visible
- [ ] Points, wins, draws, losses display correctly
- [ ] Dark theme is applied
- [ ] No console errors

**Navigation:**
- [ ] "Standings" nav item is highlighted with green accent
- [ ] Header structure matches index.html
- [ ] Navigation links work (Fixtures, Schedule)

**Responsive Design:**
- [ ] Desktop (1200px+): Full width layout
- [ ] Tablet (768px-1199px): Adjusted layout
- [ ] Mobile (<768px): Stacked layout, readable
- [ ] No horizontal scrolling on any size

### Schedule Page Polish Tests

**URL**: http://localhost:8000/schedule.html

**Visual Elements:**
- [ ] Page description appears below header ("Browse all Champions League matches...")
- [ ] Page description uses secondary text color (gray)
- [ ] Loading indicator shows "Loading schedule..." while widget loads
- [ ] Loading indicator has spinning animation
- [ ] Loading indicator disappears when widget loads

**Widget Functionality:**
- [ ] League widget displays full schedule
- [ ] All matchdays are visible
- [ ] Match dates and teams shown
- [ ] Dark theme is applied
- [ ] No console errors

**Navigation:**
- [ ] "Schedule" nav item is highlighted with green accent
- [ ] Header structure matches index.html
- [ ] Navigation links work (Fixtures, Standings)

**Responsive Design:**
- [ ] Desktop (1200px+): Full width layout
- [ ] Tablet (768px-1199px): Adjusted layout
- [ ] Mobile (<768px): Stacked layout, readable
- [ ] No horizontal scrolling on any size

### Cross-Page Consistency Tests

**Action**: Navigate through all 3 pages and compare

**Consistent Elements:**
- [ ] Header structure identical across all pages
- [ ] Navigation styling matches (same colors, spacing, active state)
- [ ] Page description styling consistent (color, font size, margin)
- [ ] Loading indicator styling consistent
- [ ] Widget container styling matches
- [ ] Dark theme applied consistently

**CSS Variables Check** (Open DevTools → Elements → :root):
- [ ] `--bg-primary: #0a0a0a`
- [ ] `--bg-secondary: #1a1a1a`
- [ ] `--text-primary: #ffffff`
- [ ] `--text-secondary: #a0a0a0`
- [ ] `--accent-color: #00ff88`

### Browser Compatibility Tests

**Test on multiple browsers:**

**Chrome:**
- [ ] All pages load correctly
- [ ] Loading indicators work
- [ ] Widgets display
- [ ] Navigation works
- [ ] Responsive design works

**Firefox:**
- [ ] All pages load correctly
- [ ] Loading indicators work
- [ ] Widgets display
- [ ] Navigation works
- [ ] Responsive design works

**Edge:**
- [ ] All pages load correctly
- [ ] Loading indicators work
- [ ] Widgets display
- [ ] Navigation works
- [ ] Responsive design works

**Safari** (if available):
- [ ] All pages load correctly
- [ ] Loading indicators work
- [ ] Widgets display
- [ ] Navigation works
- [ ] Responsive design works

### Performance Tests

**Page Load Speed:**
- [ ] standings.html loads in < 3 seconds
- [ ] schedule.html loads in < 3 seconds
- [ ] Widget data appears in < 5 seconds

**Console Check:**
- [ ] No errors on standings.html
- [ ] No errors on schedule.html
- [ ] No warnings related to CSS or HTML

### Acceptance Criteria

✅ **FIX-20 is complete if:**
- All visual polish elements visible and styled correctly
- Loading indicators work on both pages
- Page descriptions display correctly
- Cross-page consistency maintained
- All navigation works correctly
- Responsive design works on all screen sizes
- No console errors
- Cross-browser compatibility verified (at least Chrome + 1 other browser)

---

## Test 1: Widget Integration Test (2 min)

**URL**: http://localhost:8000/test-widget.html

### What to Check:
- [ ] Page loads without errors
- [ ] "Test 1: Games Widget" section shows fixtures
- [ ] "Test 2: Standings Widget" shows league table
- [ ] Dark theme is applied (black background)
- [ ] Team logos are visible
- [ ] No errors in browser console (F12)

**How to check console:**
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for red error messages (some warnings are OK)

---

## Test 2: Main Fixtures Page (5 min)

**URL**: http://localhost:8000/index.html

### Initial Load
- [ ] Page loads successfully
- [ ] Header shows "⚽ Fixtures App"
- [ ] Navigation shows: Fixtures | Standings | Schedule
- [ ] "Fixtures" is highlighted (green)
- [ ] Date selector shows "Tuesday, January 21, 2025"
- [ ] Loading indicator appears briefly
- [ ] Games widget loads (may show "No games" due to API date restrictions)

### Date Navigation - Previous Day
**Action**: Click the ← button

- [ ] Date changes to "Monday, January 20, 2025"
- [ ] Date picker input updates to 2025-01-20
- [ ] Widget refreshes (may show loading)
- [ ] Widget updates (or "No matches" if none scheduled)

### Date Navigation - Next Day
**Action**: Click the → button twice (to get to Jan 22)

- [ ] Date changes to "Wednesday, January 22, 2025"
- [ ] Date picker input updates to 2025-01-22
- [ ] Widget refreshes with new date

### Date Picker
**Action**: Click the date input, select a different date (try Feb 11, 2025)

- [ ] Date display updates to selected date
- [ ] Widget refreshes with new date

### Mobile Responsive Test
**Action**: Resize browser window to mobile size (or use DevTools device mode)

- [ ] Date selector buttons stack vertically
- [ ] Navigation remains usable
- [ ] Widgets remain readable
- [ ] No horizontal scrolling

---

## Test 3: Standings Page (2 min)

**Action**: Click "Standings" in navigation

- [ ] URL changes to standings.html
- [ ] "Standings" nav item is highlighted
- [ ] Page title shows "Champions League Standings"
- [ ] Standings widget loads
- [ ] League table displays with team positions
- [ ] Points, wins, draws, losses visible

---

## Test 4: Schedule Page (2 min)

**Action**: Click "Schedule" in navigation

- [ ] URL changes to schedule.html
- [ ] "Schedule" nav item is highlighted
- [ ] Page title shows "Full Champions League Schedule"
- [ ] League widget loads
- [ ] Full season schedule displays
- [ ] Matchdays are visible

---

## Test 5: Navigation Flow (1 min)

**Action**: Click through all pages

1. Click "Fixtures" → [ ] Returns to fixtures page
2. Click "Standings" → [ ] Shows standings
3. Click "Schedule" → [ ] Shows schedule
4. Click "Fixtures" → [ ] Back to fixtures

- [ ] All transitions work smoothly
- [ ] Active nav item updates correctly
- [ ] No broken links

---

## Test 6: Browser Console Check (2 min)

**Action**: Open DevTools (F12) → Console tab on each page

### index.html
- [ ] No red errors
- [ ] Widgets load successfully
- [ ] JavaScript runs without errors

### standings.html
- [ ] No red errors
- [ ] Standings widget loads

### schedule.html
- [ ] No red errors
- [ ] Schedule widget loads

---

## Test 7: Network Requests (Advanced - Optional)

**Action**: Open DevTools (F12) → Network tab

1. Reload index.html
2. Watch for requests

**Look for:**
- [ ] Requests to widgets.api-sports.io
- [ ] Requests return 200 status (success)
- [ ] No 404 or 500 errors
- [ ] CSS and JS files load correctly

---

## Common Issues & Solutions

### ❌ Widgets Don't Load
**Symptoms**: Empty spaces where widgets should be
**Solutions**:
- Check internet connection
- Verify API-Football service is online
- Check console for specific errors
- Wait 5-10 seconds (widgets take time to load)

### ❌ Date Navigation Doesn't Work
**Symptoms**: Clicking buttons does nothing
**Solutions**:
- Check console for JavaScript errors
- Verify js/date-selector.js loaded (check Network tab)
- Refresh the page

### ❌ Styling Looks Wrong
**Symptoms**: White background, no theme
**Solutions**:
- Verify css/styles.css loaded (check Network tab)
- Clear browser cache (Ctrl+Shift+R)
- Try different browser

### ❌ "No fixtures" Message
**Note**: This is normal! Not all dates have Champions League matches.
**Solutions**:
- Try different dates
- Champions League typically plays Tue/Wed
- Check schedule.html to see when matches are scheduled

---

## ✅ Success Criteria

**MVP is working if:**
- [x] All 3 pages load (fixtures, standings, schedule)
- [x] Widgets display data from API-Football
- [x] Date navigation works on fixtures page
- [x] Navigation between pages works
- [x] Responsive on mobile and desktop
- [x] No critical errors in console

---

## 📊 Test Results

### Bugs Found:
1. _______________________________
2. _______________________________
3. _______________________________

### Performance:
- Page load time: _________ seconds
- Widget load time: _________ seconds

### Browser Tested:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Devices Tested:
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

---

## Next Steps

✅ **If all tests pass**: Ready for FIX-13 (Additional Pages)
❌ **If issues found**: Report issues and fix before proceeding

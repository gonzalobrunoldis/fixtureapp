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
   - [ ] Span text shows "Tuesday, November 26, 2024"
   - [ ] Date picker input shows "2024-11-26"
   - [ ] Widget is requesting data for 2024-11-26

2. **Verify in browser console (F12 → Console)**:
   ```javascript
   console.log({
     spanText: document.getElementById('current-date').textContent,
     pickerValue: document.getElementById('date-picker').value,
     widgetDate: document.getElementById('fixtures-widget').getAttribute('data-date'),
     jsVariable: currentDate.toISOString().split('T')[0]
   });
   ```
   - [ ] All 4 values are identical: "2024-11-26"

### Test 2: Widget Data Loading (2 min)

**Action**: Verify fixtures widget displays Champions League match data

- [ ] Fixtures widget shows matches (not "No games available")
- [ ] Champions League matches are visible
- [ ] Team names and logos display
- [ ] Match times are shown
- [ ] Dark theme is applied

### Test 3: Date Navigation Synchronization (3 min)

**Action**: Test that all 3 displays update together

1. **Click ← (previous day)**:
   - [ ] Span updates to "Monday, November 25, 2024"
   - [ ] Date picker updates to "2024-11-25"
   - [ ] Widget refreshes with new date

2. **Click → (next day) twice**:
   - [ ] Span updates to "Wednesday, November 27, 2024"
   - [ ] Date picker updates to "2024-11-27"
   - [ ] Widget refreshes with new date

3. **Use date picker** to select "2024-12-10":
   - [ ] Span updates to "Tuesday, December 10, 2024"
   - [ ] All 3 displays synchronized to 2024-12-10
   - [ ] Widget shows fixtures for December 10

### Test 4: Multiple Matchday Dates (5 min)

**Action**: Test various Champions League dates to ensure widget data loads

Use date picker to navigate to these dates:
- [ ] **November 5, 2024** (Matchday 4) - Shows fixtures
- [ ] **November 26, 2024** (Matchday 5) - Shows fixtures
- [ ] **December 10, 2024** (Matchday 6) - Shows fixtures
- [ ] **January 21, 2025** (Knockout phase) - Shows fixtures or "No games"

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
- Fixtures widget displays Champions League match data
- Date navigation (buttons + picker) updates all 3 displays together
- No console errors
- Default date is November 26, 2024 (Matchday 5)

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
- [ ] Date selector shows "Wednesday, January 22, 2026"
- [ ] Loading indicator appears briefly
- [ ] Games widget loads and displays fixtures

### Date Navigation - Previous Day
**Action**: Click the ← button

- [ ] Date changes to "Tuesday, January 21, 2026"
- [ ] Date picker input updates to 2026-01-21
- [ ] Widget refreshes (may show loading)
- [ ] New fixtures appear (or "No matches" if none scheduled)

### Date Navigation - Next Day
**Action**: Click the → button twice (to get to Jan 23)

- [ ] Date changes to "Thursday, January 23, 2026"
- [ ] Date picker input updates to 2026-01-23
- [ ] Widget refreshes with new date

### Date Picker
**Action**: Click the date input, select a different date (try Feb 1, 2026)

- [ ] Date display updates to selected date
- [ ] Widget refreshes with new fixtures

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

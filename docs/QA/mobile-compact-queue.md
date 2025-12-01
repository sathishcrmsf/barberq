# QA Checklist: Mobile Compact Queue UI

**Feature Branch:** `feat/ui/mobile-compact-queue`  
**Date:** November 25, 2025  
**Tester:** _[Name]_

## Overview
This QA checklist covers the mobile compact queue UI update to match the reference design (after-vs-before.png). The update focuses on making the interface more compact, improving typography, and enhancing the mobile-first experience.

---

## Test Environment

- [ ] iPhone SE (375x667)
- [ ] iPhone 14/15 (390x844)
- [ ] iPhone 14/15 Pro Max (430x932)
- [ ] Android Pixel 5 (393x851)
- [ ] Android Pixel 7 (412x915)

---

## 1. Layout & Container

### Edge-to-Edge Mobile Layout
- [ ] **Pass/Fail**: Page uses full width on mobile devices
- [ ] **Pass/Fail**: No fixed centered container that creates boxed look
- [ ] **Pass/Fail**: Proper padding on left and right (px-4 sm:px-6)
- [ ] **Pass/Fail**: No horizontal scrolling occurs on any screen size

---

## 2. Queue Item Cards

### Density & Spacing
- [ ] **Pass/Fail**: Vertical padding reduced (py-2 instead of py-4)
- [ ] **Pass/Fail**: Gap between elements is 2 (gap-2 instead of gap-4)
- [ ] **Pass/Fail**: Cards are full width (w-full)
- [ ] **Pass/Fail**: Minimum tap area of 44x44px for actionable elements

### Visual Appearance
- [ ] **Pass/Fail**: Items look more compact compared to previous version
- [ ] **Pass/Fail**: Content is still readable and not cramped
- [ ] **Pass/Fail**: Proper border between items (border-b border-gray-200)

---

## 3. Primary Action Buttons (Start/Done)

### Button Styling
- [ ] **Pass/Fail**: Button height is 40px (h-10)
- [ ] **Pass/Fail**: Rounded corners are lg (rounded-lg)
- [ ] **Pass/Fail**: Full width on mobile (w-full)
- [ ] **Pass/Fail**: Green accent color maintained (bg-green-600)
- [ ] **Pass/Fail**: Font weight is semibold
- [ ] **Pass/Fail**: Icon + text are inline and centered

### Interaction
- [ ] **Pass/Fail**: Buttons have transition-opacity on tap
- [ ] **Pass/Fail**: Hover state works (hover:bg-green-700)
- [ ] **Pass/Fail**: Buttons are responsive and trigger correctly
- [ ] **Pass/Fail**: Minimum 44px tap target maintained

---

## 4. Delete Icon

### Icon Styling
- [ ] **Pass/Fail**: Icon size reduced to 20-22px (w-5 h-5)
- [ ] **Pass/Fail**: Icon is muted gray (text-gray-500)
- [ ] **Pass/Fail**: No strong border around icon
- [ ] **Pass/Fail**: Icon positioned to the right with spacing (ml-3 or gap-3)

### Interaction
- [ ] **Pass/Fail**: Delete icon has 44x44px tap area
- [ ] **Pass/Fail**: Hover effect shows gray background
- [ ] **Pass/Fail**: Aria-label present for accessibility
- [ ] **Pass/Fail**: Confirmation dialog appears before deletion

---

## 5. Section Headers

### Typography
- [ ] **Pass/Fail**: Text is xs size (text-xs)
- [ ] **Pass/Fail**: Font weight is semibold
- [ ] **Pass/Fail**: Letter spacing is wider (tracking-wider)
- [ ] **Pass/Fail**: Text is uppercase
- [ ] **Pass/Fail**: Count displays in parentheses (e.g., "WAITING (5)")

### Visual Styling
- [ ] **Pass/Fail**: Subtle background color (bg-gray-50/blue-50/green-50)
- [ ] **Pass/Fail**: Padding is compact (py-2 px-3)
- [ ] **Pass/Fail**: WAITING section: gray text on gray-50 background
- [ ] **Pass/Fail**: IN PROGRESS section: blue (#007AFF) text on blue-50 background
- [ ] **Pass/Fail**: COMPLETED section: green (#34C759) text on green-50 background

---

## 6. Add Customer Button (Sticky/Fixed)

### Position & Styling
- [ ] **Pass/Fail**: Button is fixed at bottom of viewport
- [ ] **Pass/Fail**: Position: bottom-4 left-4 right-4
- [ ] **Pass/Fail**: Button height is 48px (h-12)
- [ ] **Pass/Fail**: Background is black (bg-black)
- [ ] **Pass/Fail**: Text is white
- [ ] **Pass/Fail**: Rounded corners are xl (rounded-xl)
- [ ] **Pass/Fail**: Shadow is applied (shadow-lg)

### Visibility & Behavior
- [ ] **Pass/Fail**: Button visible without scrolling
- [ ] **Pass/Fail**: Button stays fixed when scrolling queue
- [ ] **Pass/Fail**: Button doesn't overlap content inappropriately
- [ ] **Pass/Fail**: Z-index ensures button appears above content
- [ ] **Pass/Fail**: Button navigates to /add route correctly

---

## 7. Typography

### Customer Names
- [ ] **Pass/Fail**: Names display in Title Case (e.g., "Sathish Kumar" not "sathish kumar")
- [ ] **Pass/Fail**: Font size is base (text-base)
- [ ] **Pass/Fail**: Font weight is semibold
- [ ] **Pass/Fail**: Text truncates properly if too long

### Service Labels
- [ ] **Pass/Fail**: Service text is sm size (text-sm)
- [ ] **Pass/Fail**: Text color is gray-600
- [ ] **Pass/Fail**: Service name displays correctly

### Notes (Optional)
- [ ] **Pass/Fail**: Notes text is xs size (text-xs)
- [ ] **Pass/Fail**: Text color is gray-500
- [ ] **Pass/Fail**: Italic style applied
- [ ] **Pass/Fail**: Notes only show when present

---

## 8. Status Badges

### Styling
- [ ] **Pass/Fail**: Badge padding is px-3 py-1
- [ ] **Pass/Fail**: Text size is sm (text-sm)
- [ ] **Pass/Fail**: Font weight is medium
- [ ] **Pass/Fail**: Border radius is full (rounded-full)
- [ ] **Pass/Fail**: Badge size is smaller and less prominent

### Color States
- [ ] **Pass/Fail**: WAITING: gray-100 background, gray-700 text
- [ ] **Pass/Fail**: IN PROGRESS: blue-50 background, #007AFF text
- [ ] **Pass/Fail**: COMPLETED: green-50 background, #34C759 text
- [ ] **Pass/Fail**: No borders on badges

---

## 9. Visual States

### Waiting Rows
- [ ] **Pass/Fail**: Default white background (bg-white)
- [ ] **Pass/Fail**: "Start" button displays
- [ ] **Pass/Fail**: Delete icon shows

### In-Progress Rows
- [ ] **Pass/Fail**: White background for items
- [ ] **Pass/Fail**: Section header has light blue band (bg-blue-50)
- [ ] **Pass/Fail**: Status badge shows #007AFF color
- [ ] **Pass/Fail**: "Done" button displays
- [ ] **Pass/Fail**: Delete icon shows

### Completed Rows
- [ ] **Pass/Fail**: White background for items
- [ ] **Pass/Fail**: Section header has light green band (bg-green-50)
- [ ] **Pass/Fail**: Status badge shows #34C759 color
- [ ] **Pass/Fail**: No action button displays
- [ ] **Pass/Fail**: Delete icon is hidden (disableDelete=true)

---

## 10. Responsive Behavior

### Breakpoints
- [ ] **Pass/Fail**: Layout works on smallest mobile (320px width)
- [ ] **Pass/Fail**: sm: breakpoint styles apply correctly on larger screens
- [ ] **Pass/Fail**: Mobile-first classes prioritized

### Scrolling
- [ ] **Pass/Fail**: Vertical scrolling works smoothly
- [ ] **Pass/Fail**: No horizontal overflow (overflow-x-hidden)
- [ ] **Pass/Fail**: Fixed Add Customer button doesn't interfere with scrolling
- [ ] **Pass/Fail**: Bottom padding prevents content from being hidden by fixed button

---

## 11. Accessibility

### ARIA Labels
- [ ] **Pass/Fail**: Start button has aria-label="Start service"
- [ ] **Pass/Fail**: Done button has aria-label="Complete service"
- [ ] **Pass/Fail**: Delete button has aria-label="Delete customer"
- [ ] **Pass/Fail**: Add Customer button has aria-label="Add customer to queue"

### Touch Targets
- [ ] **Pass/Fail**: All interactive elements minimum 44x44px
- [ ] **Pass/Fail**: Sufficient spacing between clickable elements
- [ ] **Pass/Fail**: No accidental taps occur

### Color Contrast
- [ ] **Pass/Fail**: Text has sufficient contrast with backgrounds
- [ ] **Pass/Fail**: Button text readable on button backgrounds
- [ ] **Pass/Fail**: Badge text readable on badge backgrounds
- [ ] **Pass/Fail**: Status colors distinguishable for color-blind users

---

## 12. Empty & Loading States

### Empty State
- [ ] **Pass/Fail**: "No customers in queue" message displays
- [ ] **Pass/Fail**: Helpful text shows: "Tap the button below to add a walk-in"
- [ ] **Pass/Fail**: Add Customer button still visible and functional

### Loading State
- [ ] **Pass/Fail**: "Loading..." message displays centered
- [ ] **Pass/Fail**: No layout shifts when data loads
- [ ] **Pass/Fail**: Transition is smooth

---

## 13. Integration & Functionality

### Queue Operations
- [ ] **Pass/Fail**: Adding customer updates list immediately
- [ ] **Pass/Fail**: Starting service changes status to "in-progress"
- [ ] **Pass/Fail**: Completing service changes status to "done"
- [ ] **Pass/Fail**: Deleting customer removes from list
- [ ] **Pass/Fail**: Toast notifications appear for all actions
- [ ] **Pass/Fail**: Section counts update correctly

### Navigation
- [ ] **Pass/Fail**: Add Customer button navigates to /add page
- [ ] **Pass/Fail**: Settings icon navigates to /services page
- [ ] **Pass/Fail**: Back navigation returns to queue
- [ ] **Pass/Fail**: Browser back button works correctly

---

## 14. Performance

- [ ] **Pass/Fail**: Page loads quickly (<1 second)
- [ ] **Pass/Fail**: No layout shifts after initial render
- [ ] **Pass/Fail**: Smooth animations and transitions
- [ ] **Pass/Fail**: No janky scrolling behavior

---

## 15. Visual Regression

### Comparison with Reference
- [ ] **Pass/Fail**: Layout matches "AFTER" side of reference image
- [ ] **Pass/Fail**: Spacing and density matches reference
- [ ] **Pass/Fail**: Button styles match reference
- [ ] **Pass/Fail**: Typography matches reference
- [ ] **Pass/Fail**: Colors match reference
- [ ] **Pass/Fail**: Overall minimalism maintained (Uber-style)

---

## Final Sign-Off

### Summary
- **Total Tests:** _[Count]_
- **Passed:** _[Count]_
- **Failed:** _[Count]_
- **Blocked:** _[Count]_

### Critical Issues Found
1. _[Issue description]_
2. _[Issue description]_

### Notes
_[Add any additional observations or comments]_

### Approval
- [ ] **Ready for Production**
- [ ] **Needs Fixes** (see issues above)

**Tester Signature:** _[Name]_  
**Date:** _[Date]_

---

## Testing Instructions

### How to Test Locally

1. **Start the development server:**
   ```bash
   cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
   npm run dev
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:3000/queue`

3. **Test on mobile devices:**
   - **Chrome DevTools:** Open DevTools (F12) > Toggle Device Toolbar (Ctrl+Shift+M)
   - **Responsive Design Mode:** Select different device profiles
   - **Physical Device:** Connect phone and use port forwarding or ngrok

4. **Test user flows:**
   - View empty queue
   - Add multiple customers
   - Start a service
   - Complete a service
   - Delete a customer
   - Test on different screen sizes

5. **Take screenshots:**
   - Before state (if available from main branch)
   - After state (current branch)
   - Compare side-by-side

### Device Emulation Settings

**iPhone SE:**
- Width: 375px
- Height: 667px
- DPR: 2

**iPhone 14/15:**
- Width: 390px
- Height: 844px
- DPR: 3

**Pixel 5:**
- Width: 393px
- Height: 851px
- DPR: 2.75




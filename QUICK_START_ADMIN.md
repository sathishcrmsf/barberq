# Quick Start Guide - New Admin Experience

## 🚀 Getting Started

The Services & Categories admin area has been completely refactored with a modern, intuitive interface. Here's how to use the new features:

---

## 📂 Category Management

### Accessing Categories
Navigate to: `/categories`

### Creating a Category
1. Click **"+ Add"** button in the top right
2. Fill in the modal form:
   - **Category Name** (required)
   - **Icon** - Choose from 16 beautiful icons
   - **Description** (optional)
   - **Display Order** - Lower numbers appear first
   - **Active Status** - Toggle visibility
3. See live preview at the bottom
4. Click **"Create"**

### Managing Categories
- **Edit:** Click "Edit" on any category card
- **Toggle Status:** Click "Deactivate" or "Activate"
- **Delete:** Click "Delete" (confirms before deletion)
- Categories show service count and display order

### Pro Tips:
- Use descriptive names (e.g., "Haircuts", "Coloring", "Treatments")
- Icons help customers quickly identify categories
- Display order determines listing priority

---

## ✂️ Service Management

### Accessing Services
Navigate to: `/services`

### Creating a Service (Multi-Step Wizard)

#### Step 1: Choose Category (Required)
- Select which category this service belongs to
- Categories are displayed with descriptions and service counts
- **Must select a category to proceed**

#### Step 2: Service Details
- **Service Name** (required) - e.g., "Men's Haircut"
- **Price** (required) - In USD, e.g., 25.00
- **Duration** (required) - In minutes, e.g., 30
- **Description** (optional) - Brief service description

#### Step 3: Assign Staff
- Select which staff members can perform this service
- Use "Select All" or "Deselect All" buttons
- Shows staff name and title
- **Optional:** Can assign staff later

#### Step 4: Additional Settings
- Placeholder for future features (tags, images, etc.)

#### Step 5: Review & Confirm
- Review all details before creating
- See summary of:
  - Category
  - Service details (name, price, duration, description)
  - Assigned staff members
- Click **"Create Service"** to finish

### Managing Services

#### Search & Filter
- **Search Bar:** Search by service name or description
- **Category Filter:** Show services from specific category
- **Status Filter:** Filter by Active/Inactive/All
- **Results Counter:** Shows filtered count

#### Actions Menu (Click ⋮ on service card)
- **Edit** - Opens drawer to modify service
- **Duplicate** - Creates a copy with "(Copy)" suffix
- **Archive/Activate** - Toggle service status
- **Delete** - Remove service (confirms first)

#### Service Stats Dashboard
View at top of page:
- **Total Services** - Count of all services
- **Avg Price** - Average service price
- **Avg Duration** - Average service duration

### Editing a Service
1. Click **⋮** menu on service
2. Select **"Edit"**
3. Drawer opens with pre-filled form
4. Make changes
5. Click **"Save Changes"**

### Duplicating a Service
1. Click **⋮** menu on service
2. Select **"Duplicate"**
3. New service created with "(Copy)" suffix
4. Edit the duplicate to customize

---

## 🎨 UI Features

### Empty States
- Beautiful placeholders when no data exists
- Clear call-to-action buttons
- Helpful descriptions

### Loading States
- Skeleton loaders instead of blank screens
- Smooth loading transitions
- No jarring layout shifts

### Feedback
- **Toast notifications** for success/error
- **Confirmation dialogs** for destructive actions
- **Inline validation** for form fields

### Mobile Responsive
- Touch-friendly buttons
- Sticky headers
- Floating action buttons
- Drawer panels on mobile

---

## 🔑 Key Improvements Over Old UI

### Before:
- ❌ Category optional (services got lost)
- ❌ No staff assignment during creation
- ❌ Basic form with all fields at once
- ❌ No search or filtering
- ❌ Separate pages for add/edit
- ❌ No duplicate feature
- ❌ Basic empty states

### After:
- ✅ **Category required** in guided wizard
- ✅ **Staff assignment** built into flow
- ✅ **5-step wizard** prevents errors
- ✅ **Advanced search & filters**
- ✅ **Modal/drawer workflow** (no navigation)
- ✅ **One-click duplicate**
- ✅ **Premium empty states** with CTAs

---

## 🛠️ For Developers

### Using Shared Components
```typescript
import { Modal, Drawer, Input, EmptyState } from '@/components/shared';
```

### Using Custom Hooks
```typescript
import { useCategories } from '@/hooks/useCategories';
import { useServices } from '@/hooks/useServices';
import { useStaff } from '@/hooks/useStaff';

// In component:
const { categories, createCategory, updateCategory } = useCategories();
const { services, createService, duplicateService } = useServices();
const { activeStaff } = useStaff();
```

### Component Structure
```
components/
├── shared/          → Reusable UI components
├── admin/           → Admin-specific components
│   ├── categories/  → Category management
│   └── services/    → Service management
└── ui/              → Base UI components (existing)
```

---

## 📊 Data Flow

### Service Creation Flow:
1. User opens drawer → **AddServiceDrawer**
2. Step 1: Select category → Validates before next step
3. Steps 2-4: Fill details → Live validation
4. Step 5: Review → Confirms all data
5. Submit → **useServices hook** → API call
6. Success → Toast notification + drawer closes
7. List auto-refreshes with new service

### Staff Assignment:
- Selected during service creation (Step 3)
- Sent as `staffIds` array to API
- API creates `StaffService` junction records
- Services display assigned staff count

---

## 🎯 Best Practices

### When Creating Services:
1. Always assign to a category (helps organization)
2. Write clear, descriptive names
3. Add descriptions for clarity
4. Assign appropriate staff members
5. Set realistic durations

### When Managing Categories:
1. Keep category names concise
2. Use display order strategically
3. Choose relevant icons
4. Don't delete categories with active services
5. Deactivate instead of delete when unsure

---

## 🐛 Troubleshooting

### "Cannot create service without category"
**Solution:** Select a category in Step 1 of the wizard

### "No categories available"
**Solution:** Create a category first via the Categories page

### Service not appearing
**Solution:** Check if it's filtered out (status/category filter)

### Cannot delete category
**Solution:** May have assigned services. Deactivate instead.

---

## 📱 Keyboard Shortcuts

- **ESC** - Close modal/drawer
- **Tab** - Navigate form fields
- **Enter** - Submit form (when focused)

---

## 🎓 Training Tips

### For New Users:
1. Start by creating 2-3 categories
2. Create a test service using the wizard
3. Try duplicating the test service
4. Practice filtering and searching
5. Edit a service to see the drawer workflow

### For Existing Users:
- Old functionality preserved
- New features are additive
- Previous services/categories unchanged
- Staff assignments are optional

---

## 🚀 What's Coming Next

### Planned Features:
- 📸 **Image uploads** - Service photos
- 🏷️ **Tags** - Popular, New, Trending badges
- 📊 **Analytics** - Service popularity tracking
- 🎨 **Drag-and-drop** - Reorder categories/services
- 💰 **Service variants** - Multiple pricing tiers
- 📅 **Scheduling** - Service-specific availability

---

## 📞 Need Help?

- Check the **ADMIN_REFACTOR_SUMMARY.md** for technical details
- Review component files for inline documentation
- All components have TypeScript interfaces for reference

---

**Happy Managing! 🎉**


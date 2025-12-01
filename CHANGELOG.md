# Changelog

All notable changes to the BarberQ MVP project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-24

### Added
- **Status-based UI grouping**: Queue now displays customers organized into three distinct sections:
  - Waiting section (gray header)
  - In Progress section (blue header)
  - Completed section (green header)
- **Section headers**: Each section shows count of customers (e.g., "Waiting (3)")
- **Delete protection**: Completed customers can no longer be deleted
  - Delete button hidden in UI for completed customers
  - Backend API returns 403 error when attempting to delete completed customers
- **Visual hierarchy**: Sections ordered by priority (Waiting → In Progress → Completed)
- **Color coding**: Each section has distinct background colors for better visual separation

### Changed
- Queue page layout reorganized to display sections instead of single list
- QueueItem component now accepts `disableDelete` prop
- DELETE API endpoint validates customer status before allowing deletion
- Updated README to reflect v1.1 features

### Technical Details
- Modified: `app/(mobile)/queue/page.tsx` - Added status-based filtering and section rendering
- Modified: `components/ui/queue-item.tsx` - Added conditional delete button rendering
- Modified: `app/api/walkins/[id]/route.ts` - Added delete protection logic
- Added: `BRD_V1.1_CHANGES.md` - Comprehensive implementation documentation
- Updated: `README.md` - Added v1.1 feature highlights

### Database
- No schema changes required (backward compatible)

## [1.0.0] - 2025-11-24

### Added
- Initial MVP release
- Mobile-first queue management interface
- Add walk-in customer functionality
- Customer form with validation (name, service, optional notes)
- Status tracking system (waiting, in-progress, done)
- Queue page with real-time display
- Status update functionality (Start, Done actions)
- Delete customer functionality
- Empty state handling
- Toast notifications for user feedback
- Sticky header and bottom action button (thumb-zone optimization)
- Mobile-optimized UI with large touch targets
- API endpoints:
  - GET /api/walkins - Fetch all walk-ins
  - POST /api/walkins - Create new walk-in
  - PATCH /api/walkins/[id] - Update walk-in status
  - DELETE /api/walkins/[id] - Delete walk-in
- Database schema with Prisma ORM
- SQLite support for local development
- PostgreSQL support for production
- Comprehensive documentation:
  - README.md
  - DEPLOYMENT.md
  - DATABASE_SETUP.md
  - VERCEL_FIX.md
  - TESTING_RESULTS.md
  - PROJECT_SUMMARY.md

### Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Prisma ORM
- SQLite (development)
- PostgreSQL (production)
- Vercel (deployment)

### Design
- Uber-style minimalistic interface
- Mobile-first responsive design
- Touch-friendly controls (44px+ touch targets)
- Clean typography and spacing
- Monochrome palette with accent colors

## [1.4.0] - 2025-12-01

### Added
- **Customer Management System**:
  - New `Customer` model in database schema (phone-based identification)
  - Customer management page (`/customers`) with segmentation
  - Customer API endpoints (GET, POST, PATCH, DELETE)
  - Customer segmentation: VIP (10+ visits), Regular (3-9 visits), New (1-2 visits), At-Risk (30+ days)
  - Quick stats dashboard: Total Customers, Active Customers, Total LTV, Average Visits
  - One-tap "Add to Queue" from customer list (pre-fills form)
  - Direct phone call links from customer cards
  - Real-time search by name or phone number
  - Filter chips for segment-based filtering
  - Visual customer cards with avatars, stats, and action buttons

- **Enhanced Service Management**:
  - Advanced search and filtering in service table
  - Sort by name, price, duration, or creation date
  - Status filter (All, Active, Inactive)
  - Service count display (filtered vs total)
  - Improved loading states with per-action indicators
  - Enhanced error handling with rollback on failures

- **Dashboard Improvements**:
  - Enhanced dashboard analytics
  - Better data visualization
  - Improved performance metrics

- **Walk-In Enhancements**:
  - Customer relationship linking (WalkIn → Customer)
  - Backward compatibility with legacy customerName field
  - Customer lookup in add form via query parameters

### Changed
- **Database Schema**:
  - Added `Customer` model with phone-based unique identification
  - Updated `WalkIn` model to link to `Customer` via `customerId`
  - Maintained backward compatibility with `customerName` field
  - Cascade delete: Deleting customer removes associated walk-ins

- **Add Customer Form**:
  - Enhanced to support customer lookup via phone
  - Pre-fill capability from customer list
  - Query parameter support for quick add flow

- **Queue Management**:
  - Improved customer data display
  - Better integration with customer records

### Technical Details
- Created: `app/(mobile)/customers/page.tsx` - Customer management interface
- Created: `app/api/customers/route.ts` - Customer CRUD API
- Created: `app/api/customers/[id]/route.ts` - Individual customer operations
- Modified: `prisma/schema.prisma` - Added Customer model and relationships
- Modified: `app/(mobile)/add/page.tsx` - Added customer lookup support
- Modified: `app/(mobile)/queue/page.tsx` - Enhanced customer display
- Modified: `components/admin/services/service-table.tsx` - Added search, filter, sort
- Modified: `hooks/useServices.ts` - Enhanced with better error handling
- Modified: `app/api/walkins/route.ts` - Customer relationship support
- Modified: `app/api/walkins/[id]/route.ts` - Customer-aware updates
- Added: `CUSTOMER_UX_REDESIGN_IMPLEMENTED.md` - Implementation documentation
- Added: `TODAYS_CHANGES.md` - Development changelog
- Added: `DAILY_SUMMARY_DEC_1_2025.md` - Daily summary

### UI/UX Improvements
- **Customer Page**:
  - Gradient cards for each customer segment
  - Visual hierarchy with color coding
  - Touch-friendly action buttons (48px+)
  - Responsive grid layouts
  - Empty states with helpful guidance
  - Loading skeleton states

- **Service Table**:
  - Advanced search with real-time filtering
  - Collapsible filter panel
  - Sort indicators (ascending/descending)
  - Clear filters button
  - Result count display

### Database
- **Migration Required**: New `Customer` table added
- **Backward Compatibility**: Existing walk-ins maintain `customerName` field
- **Data Migration**: Existing walk-ins can be linked to customers via phone matching

### Migration Guide
1. Run database migration: `npx prisma migrate dev`
2. Generate Prisma client: `npx prisma generate`
3. Optionally migrate existing walk-ins to customer records
4. Deploy updated schema

## [1.3.0] - 2025-12-01

### Added
- **Service Management Refactor**:
  - New `ServiceTable` component with card-based layout
  - Multi-step service creation drawer with 5-step workflow
  - Service duplication feature
  - Toggle service active/inactive status
  - Stats dashboard (Total Services, Avg Price, Avg Duration)
  - Empty states with actionable CTAs
  - Loading skeleton states
  
- **Category Management Enhancement**:
  - Active/Inactive category separation
  - Icon mapping system for category visuals
  - Gradient backgrounds for category icons
  - Inline toggle for status changes
  - Service count per category
  - Display order indicator
  - Pro tip cards for user guidance

- **Enhanced Data Management**:
  - `duplicateService()` function in useServices hook
  - `toggleServiceStatus()` function in useServices hook
  - Enhanced error handling (409, 403 status codes)
  - Computed properties for active/inactive services
  - Usage tracking support

### Changed
- Refactored `app/(mobile)/services/page.tsx` with modern UI
- Enhanced `app/(mobile)/categories/page.tsx` with better UX
- Improved `hooks/useServices.ts` with new CRUD operations
- Updated service creation workflow to multi-step process

### Technical Details
- Created: `components/admin/services/service-table.tsx`
- Created: `components/admin/services/add-service-drawer.tsx`
- Modified: `app/(mobile)/services/page.tsx`
- Modified: `app/(mobile)/categories/page.tsx`
- Modified: `hooks/useServices.ts`
- Added: `TODAYS_CHANGES.md` - Comprehensive documentation

### UI/UX Improvements
- Card-based layouts for better mobile experience
- Color-coded status indicators
- Hover states with shadow transitions
- Touch-friendly button sizes (44px minimum)
- Responsive grid layouts
- Sticky headers for context retention
- Smooth animations and transitions

### Database
- No schema changes required (backward compatible)

## [Unreleased]

### Planned for Future Versions
- Drag-and-drop reordering for categories and services
- Service image uploads
- Tags and custom fields
- Advanced filtering (by category, price, staff)
- Bulk actions for services
- Archive/hide completed customers
- Date-based filtering
- Search functionality
- Customer website portal
- Online booking integration
- Payment processing
- SMS reminders
- Manager dashboard
- Multi-location support
- Revenue tracking
- Staff accounts and permissions
- Kiosk mode
- Wait-time estimation
- AI recommendations

---

## Version Compatibility

| Version | Next.js | React | Node.js | Database |
|---------|---------|-------|---------|----------|
| 1.4.0   | 16.0.3  | 19    | 18+     | PostgreSQL |
| 1.3.0   | 16.0.3  | 19    | 18+     | PostgreSQL |
| 1.1.0   | 16.0.3  | 19    | 18+     | SQLite/PostgreSQL |
| 1.0.0   | 16.0.3  | 19    | 18+     | SQLite/PostgreSQL |

---

## Migration Guides

### Upgrading from v1.0 to v1.1

No database migration required. Changes are UI and API logic only.

**Steps:**
1. Pull latest code
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Deploy

**Breaking Changes:**
- DELETE API now returns 403 for completed customers (was 200)
- UI structure changed (sections instead of single list)

**Backward Compatibility:**
- All v1.0 API endpoints remain functional
- Database schema unchanged
- No data migration needed

---

## Support

For questions, issues, or feature requests:
- Review documentation in `/Docs` folder
- Check `BRD_V1.1_CHANGES.md` for v1.1 implementation details
- Follow bug reporting format in `Bug_Tracking.md`

---

**Maintained by:** BarberQ Development Team  
**Last Updated:** December 1, 2025




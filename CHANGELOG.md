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

## [Unreleased]

### Planned for Future Versions
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
**Last Updated:** November 24, 2025




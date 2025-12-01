# 🎭 Demo Data Reference Guide

## Overview
Your BarberQ MVP is now populated with realistic test data for a compelling demo!

---

## 📁 Categories (4)

1. **Haircuts** - Classic and modern haircut styles
2. **Beard & Shave** - Grooming services for facial hair
3. **Hair Treatments** - Professional hair care treatments
4. **Styling** - Special occasion styling services

---

## ✂️ Services (10)

### Haircuts
- **Classic Haircut** - $35 (30 min)
- **Premium Fade** - $45 (45 min)
- **Buzz Cut** - $25 (20 min)
- **Kids Haircut** - $28 (25 min)

### Beard & Shave
- **Beard Trim** - $20 (20 min)
- **Hot Towel Shave** - $40 (35 min)
- **Beard & Haircut Combo** - $55 (50 min)

### Hair Treatments
- **Hair Coloring** - $80 (90 min)
- **Scalp Treatment** - $50 (40 min)

### Styling
- **Hair Styling** - $35 (30 min)

---

## 👨‍💼 Staff Members (4)

### Marcus Thompson - Master Barber
- 15 years experience
- Specializes in: Premium Fade, Classic Haircut, Beard Trim
- Email: marcus@barberq.com
- Phone: (555) 123-4567

### Diego Rodriguez - Senior Stylist
- 10 years experience
- Specializes in: Classic Haircut, Beard services, Hot Towel Shave
- Email: diego@barberq.com
- Phone: (555) 234-5678

### James Chen - Hair Colorist
- 8 years experience
- Specializes in: Hair Coloring, Scalp Treatment, Hair Styling
- Email: james@barberq.com
- Phone: (555) 345-6789

### Alex Williams - Barber
- 5 years experience
- Specializes in: Kids Haircut, Buzz Cut, Classic Haircut
- Email: alex@barberq.com
- Phone: (555) 456-7890

---

## 🚶 Current Queue Status (9 Walk-Ins)

### 🟢 In Progress (2)
1. **Michael Johnson** - Premium Fade with Marcus Thompson
   - Started 10 mins ago
   - Note: "Wants a skin fade with textured top"

2. **Sarah Martinez** - Hair Coloring with James Chen
   - Started 35 mins ago
   - Note: "Ash blonde highlights"

### ⏳ Waiting (4)
3. **David Lee** - Classic Haircut (assigned to Diego)
   - Waiting 8 mins
   - Note: "Regular customer, knows the style"

4. **Tommy Anderson** - Kids Haircut (assigned to Alex)
   - Waiting 5 mins
   - Note: "First time, age 7"

5. **Robert Wilson** - Beard & Haircut Combo
   - Waiting 3 mins
   - Note: "No rush, wants full service"

6. **Chris Brown** - Buzz Cut
   - Waiting 2 mins
   - Note: "Quick trim, #2 all over"

### ✅ Completed (3) - For Analytics
7. **Jason Taylor** - Hot Towel Shave (Diego) - Completed 90 mins ago
8. **Kevin White** - Premium Fade (Marcus) - Completed 2 hrs ago
9. **Daniel Harris** - Beard Trim (Marcus) - Completed 2.25 hrs ago

---

## 💡 Demo Flow Suggestions

### 1. **Queue Management Demo**
- Show the active queue with 2 in-progress and 4 waiting
- Mark Michael Johnson as "completed" 
- Start service for David Lee
- Show real-time status updates

### 2. **Add New Customer Demo**
- Click "Add Walk-In"
- Add customer: "John Smith"
- Select service: "Classic Haircut"
- Assign to available staff
- Watch them appear in queue

### 3. **Services Management Demo**
- Navigate to Services section
- Show all 10 services organized by category
- Demonstrate adding a new service
- Show service details (price, duration, description)

### 4. **Staff Management Demo**
- View all 4 staff members
- Show staff-service assignments
- Highlight specializations (primary skills)
- Show years of experience

### 5. **Analytics Demo** (if implemented)
- Show completed appointments
- Revenue tracking
- Popular services
- Staff performance metrics

---

## 🎯 Key Demo Points

1. **Mobile-First Design** - Show responsiveness on phone/tablet
2. **Real-Time Updates** - Status changes update instantly
3. **Staff Assignment** - Smart matching based on skills
4. **Service Organization** - Clear categorization for easy navigation
5. **Professional UX** - Uber-style minimalism and clarity

---

## 🔄 Resetting Demo Data

If you need to reset the data during demo:

```bash
npm run db:seed
```

This will:
- Clear all existing data
- Recreate fresh test data
- Reset queue to initial state

---

## 📝 Quick Test Scenarios

### Scenario 1: Busy Morning Rush
- **Current State**: 2 active, 4 waiting (realistic morning rush)
- **Action**: Complete services, start next in queue
- **Shows**: Queue efficiency, staff utilization

### Scenario 2: Walk-In Customer
- **Action**: Add new customer "Emma Davis" for "Hair Styling"
- **Shows**: Quick onboarding, service selection

### Scenario 3: Service Management
- **Action**: Add new service "Senior Discount Haircut" at $30
- **Shows**: Easy service catalog updates

### Scenario 4: Staff Flexibility
- **Action**: Assign unassigned customer to best available staff
- **Shows**: Staff-service skill matching

---

## 🎬 Opening Line for Demo

> "Welcome to BarberQ! We're currently managing a typical Saturday morning at the shop - we have Marcus and James actively serving customers, with 4 more waiting in the queue. Let me show you how easily we can manage this..."

---

## 📞 Support

If you need to modify test data or add more scenarios, edit:
`/prisma/seed.ts`

Then run:
```bash
npm run db:seed
```

**Happy Demoing! 🚀**


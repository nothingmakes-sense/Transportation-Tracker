# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.


**A modern, full-stack school bus management platform built for safe, real-time student transportation. Family-owned values meet enterprise-grade technology.**

**Live GPS tracking • Automated pickup confirmation • Driver shift management • Admin analytics • Parent portal ready**

---

## ✨ Features

### 👨‍👩‍👧‍👦 **Parent & Child Management**
- Full parent/child CRUD (admin)
- Automatic address pre-fill from parent profile
- Bus route assignment
- 24-hour absence notices (greys out child for driver)

### 🚌 **Route & Fleet Management**
- Create/manage bus routes
- Assign drivers (1:1 driver-to-bus)
- Assign/unassign children to routes
- Searchable admin views

### ⏰ **Driver Experience**
- Clock In / Clock Out with shift tracking
- Real-time GPS location sharing (`LiveLocation` + `DriverLocation`)
- Live list of assigned children with absence awareness
- One-tap "Mark Picked Up" with timestamp + driver attribution
- Undo pickup capability

### 📊 **Admin Dashboard**
- User & role management (Parent / Driver / Admin)
- Routes + Children overview
- Parents & Children management
- Reports:
  - Daily pickup completion (CSV export)
  - Driver hours & clock data (CSV export)
- **Live Fleet Tracking** (`LiveAdminDashboard`)

### 🔒 **Security & Auth**
- Better Auth (email/password + sessions)
- Role-based access control
- Email verification support
- Secure session tokens

### 📍 **Live Tracking**
- Real-time driver location updates
- Accuracy + timestamp tracking
- Admin live fleet view
- Persistent driver location table

### 📅 **Data Integrity**
- Date-based pickup records (UTC-safe)
- Unique constraints (`childId + date`)
- Driver shift uniqueness per day
- Full audit-ready timestamps

---

## 🛠 Tech Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| **Framework**  | Next.js 15 (App Router)                         |
| **Language**   | TypeScript                                      |
| **Styling**    | Tailwind CSS + custom gradient theme            |
| **Database**   | PostgreSQL + Prisma ORM                         |
| **Auth**       | Better Auth                                     |
| **API**        | tRPC + Next.js Route Handlers                   |
| **Deployment** | Ready for Vercel / Docker / Railway / etc.      |
| **Realtime**   | Live location polling + future WebSocket ready  |

**Prisma Schema Location**: `prisma/schema.prisma`

---

## 📋 Prerequisites

- Node.js ≥ 20
- PostgreSQL (16+ recommended)
- pnpm (recommended) or npm/yarn
- git bash
- docker (cli or desktop)

---

## 🚀 Installation & Setup

### 1. Clone & Install
```bash
git clone https://github.com/nothingmakes-sense/Transportation-Tracker
cd Transportation-Tracker
docker compose up
```
## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

**Created By Kasra Pratt using the T3 Boilerplate**
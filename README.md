# DukaPro — Smart Shop Manager for Kenyan Businesses 🛒🇰🇪

DukaPro is a real-time retail management platform for Kenyan shop owners. It replaces manual notebooks with a mobile-first web app for tracking **stock, sales, expenses, and daily performance**, with live data sync and a daily report shop owners can act on immediately.

## Why this project exists

Most small shop owners in Kenya track stock and money in exercise books or memory. That makes it hard to answer basic but important questions: *Did today's stock match what I sold? Am I actually profitable this week? Which items are running low?*

DukaPro answers those questions automatically, in real time, by turning day-to-day transactions into structured data.

## Core data & reporting features

- **Live Dashboard** — real-time sales, M-Pesa vs cash split, expenses, and profit, powered by Firestore's `onSnapshot` listeners (`js/db.js`) so the UI updates the instant new data comes in — no manual refresh.
- **Weekly Sales Chart** — a 7-day revenue bar chart computed from raw sales records (`renderWeeklyChart` in `js/dashboard.js`).
- **Low Stock Alerts** — automatically flags items at 5 units or fewer directly on the dashboard.
- **Closing Stock Reconciliation** — compares expected stock (opening − sold) against a physical count and flags discrepancies (`js/closing.js`).
- **Daily Report + PDF Export** — a printable/exportable summary of sales, stock, and expenses for any given day (`js/report.js`).
- **Shop Profile Management** — owners can update their shop name, phone, location, and business type, and change their password, all synced to Firestore (`js/auth.js`).
- **Password Reset** — self-serve "Forgot Password" flow via Firebase Auth's email reset link.

## Architecture

The app is a client-side app backed by Firebase, structured as small, single-purpose modules:

```
dukapro/
├── index.html                 → page markup only
├── css/
│   └── styles.css             → all styling (design tokens, layout, components)
└── js/
    ├── firebase-config.js     → Firebase app initialization
    ├── state.js               → shared app state, date/number formatters, splash + screen switching
    ├── auth.js                → auth state listener, login/signup/Google, password reset & change, shop profile load/save
    ├── app.js                 → app init, sidebar navigation, page routing, toast notifications
    ├── db.js                  → real-time Firestore listeners (onSnapshot) + CRUD helpers + badge counts
    ├── stock.js               → opening stock intake & stock list rendering
    ├── sales.js                → sale recording, item select, payment toggle, sales history
    ├── expenses.js              → expense recording & history
    ├── dashboard.js              → live dashboard summary, weekly chart, low-stock alerts
    ├── history.js                 → day-by-day history list
    ├── closing.js                  → closing stock count vs. expected discrepancy check
    └── report.js                    → daily report view, PDF export, day-data deletion
```

**Data flow:** Firestore `onSnapshot` listeners in `db.js` keep an in-memory cache (`_data`) live-synced with the database. Every render function (`renderDashboard`, `renderStock`, `renderSales`, etc.) reads from that cache, so any change — from this device or another — reflects instantly across the whole UI without manual polling.

## Tech stack

- **Frontend:** Vanilla JavaScript, HTML, CSS (no framework — kept deliberately lightweight for low-end Android devices and slow connections)
- **Backend:** Firebase Authentication + Firestore, with real-time listeners for live data sync
- **Icons:** Font Awesome
- **Fonts:** Plus Jakarta Sans, JetBrains Mono
- **Deployment:** Static hosting (Netlify)

## Running locally

No build step required — it's static HTML/CSS/JS.

```bash
git clone <this-repo>
cd dukapro
python3 -m http.server 8000
# visit http://localhost:8000
```

Add your own Firebase project credentials in `js/firebase-config.js` to connect to a live backend.

## Notes on this repo structure

This project was originally built and shipped as a single HTML file for fast iteration and simple Netlify deployment. It has since been split into separate CSS/JS modules (as shown above) purely for readability and to make the real-time data layer (`db.js`), reporting (`report.js`, `dashboard.js`), and auth/profile logic (`auth.js`) easier to review independently. Functionality is unchanged — verified against the original single-file version line-by-line.

---
Built by **Favour Michael** — MYKETECH Web Solutions.

# NOMADIC — Kevin Jones, The Nomadic Barber

Official website for Kevin Jones, Master Barber at The Cutt'n Edge Barbershop in San Diego, CA.

**Live site:** [thecuttnedgesd.com](https://thecuttnedgesd.com)
**Book a cut:** [getsquire.com/booking/book/nomadic-barbering-san-diego/barber/kevin-j-18/services](https://getsquire.com/booking/book/nomadic-barbering-san-diego/barber/kevin-j-18/services)
**Instagram:** [@theenomadicbarber](https://www.instagram.com/theenomadicbarber)

---

## Stack

- **Vite + React** — fast dev/build
- **Vanilla CSS** — no UI framework, full custom design
- **localStorage** — admin-editable content (services, bio, gallery, bookings)
- **Vercel** — deployment target

---

## Features

- **Intro animation** — NOMADIC logo revealed by a pair of clippers carving left to right
- **THE CUTZ** — masonry gallery of Kevin's work with lightbox viewer
- **THE MENU** — full service list with prices and durations pulled from his Squire menu
- **THE BARBER** — bio, photo, contact info (Instagram + cell)
- **BOOK YOUR CUT** — booking request form + direct link to Squire booking
- **Admin panel** — hidden behind 5 clicks on the footer logo, password protected

---

## Admin Panel

Click the **NOMADIC logo in the footer 5 times quickly** → enter password → manage everything.

| Tab | What it does |
|---|---|
| Services | Edit/add/delete menu items and prices |
| About | Edit Kevin's bio |
| Gallery | Add or remove photos |
| Bookings | View requests, update status (Pending / Confirmed / Cancelled) |

**Password:** `nomadic2025`

---

## Local Dev

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`

---

## Deploy to Vercel

```bash
npx vercel
```

`vercel.json` is already configured for SPA routing. Vite is auto-detected.

---

## Contact

Kevin Jones — The Nomadic Barber
The Cutt'n Edge Barbershop
6485 El Cajon Blvd, San Diego, CA 92115
(804) 929-1680

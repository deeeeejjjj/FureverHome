# 🐾 Furever Home — Pet Adoption Management System

A full-stack web application for managing pet adoptions in Marinduque, Philippines.

---

## 👥 Group Members

| Name | Role |
|------|------|
| *(Daniel Luto)* | Frontend Developer — HTML, CSS, Bootstrap UI |
| *(Keanle Federnal)* | Backend Developer — PHP API, MySQL PDO |
| *(Andrea Calalang)* | Integrator — JavaScript Fetch, API wiring, Testing |
| *(Jessica Niduaza)* | Documentation, Version Control, Deployment |

---

## 📋 Project Description

**Furever Home** is a pet adoption management system for animal shelters and rescuers across the six municipalities of Marinduque (Boac, Gasan, Mogpog, Santa Cruz, Buenavista, Torrijos).

**Problem it solves:** Animal shelters in Marinduque lack a unified digital platform to manage available pets, process adoption applications, and connect rescuers with prospective adopters. Furever Home centralizes all of this into a responsive web application with role-based access for users, rescuers, and administrators.

---

## ✅ Functionalities

### Public
- Browse & filter available pets (type, age, gender, municipality, search)
- Featured pets on homepage
- Pet detail profiles (photos, health status, tags)
- Rescuer directory
- Contact form + newsletter subscription

### Registered Users
- Submit adoption applications with home/lifestyle questionnaire
- Track application status and receive notifications
- Save / favourite pets
- Record donations (GCash, PayMaya, bank, cash)
- Edit profile, change password, manage notification preferences

### Admin
- **Create / Read / Update / Delete — Pets**
- **Create / Read / Update / Delete — Adoption Requests** (approve / reject)
- **Read / Update — Users** (deactivate / reactivate)
- **Create / Read — Shelters**
- **Read / Update — Contact Messages** (resolve)
- Dashboard stats + analytics (adoptions by month, pet distribution)

---

## 🛠️ Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Bootstrap 5, Custom CSS |
| JavaScript | Vanilla JS — Fetch API (GET & POST/PUT/DELETE) |
| Backend | **PHP 8.x** with no frameworks |
| Database | **MySQL** via **PDO** with prepared statements |
| Auth | JWT (HS256, hand-rolled — no third-party library) |
| Passwords | `password_hash()` BCrypt cost-11 |
| Version Control | GitHub |

---

## 🗂️ Project Structure

```
furever-home/
├── frontend/
│   ├── index.html
│   ├── pages/          ← login, register, pets, adopt-form,
│   │                      user-dashboard, admin-dashboard,
│   │                      rescuers, tips, about, contact
│   ├── js/
│   │   └── api.js      ← All Fetch API calls (GET + POST)
│   ├── css/
│   └── images/
│
├── backend-php/        ← ✅ PHP + MySQL (PDO) Backend
│   ├── api.php         ← Single entry-point router
│   ├── database.sql    ← Full schema + seed data
│   ├── seed.php        ← Run once to hash demo passwords
│   ├── .htaccess
│   ├── config/
│   │   └── db.php      ← PDO connection
│   ├── helpers/
│   │   ├── jwt.php     ← JWT encode/decode/requireAuth()
│   │   └── response.php
│   └── api/
│       ├── auth.php         register · login · me
│       ├── pets.php         CRUD pets (admin)
│       ├── adoptions.php    apply · list · review
│       ├── users.php        profile · password · notifs · delete
│       ├── rescuers.php     list · apply
│       ├── contact.php      send message
│       ├── donations.php    donate · my donations
│       ├── notifications.php list · read · dismiss
│       ├── saved_pets.php   save · unsave · list
│       ├── newsletter.php   subscribe
│       └── admin.php        stats · users · shelters · messages ·
│                            donations · analytics
└── README.md
```
---

## 🔌 API Endpoints (JSON)

All requests go through `backend-php/api.php`:

| Action | Route params | Method |
|--------|-------------|--------|
| Register | `?route=auth&action=register` | POST |
| Login | `?route=auth&action=login` | POST |
| List pets | `?route=pets` | GET |
| Get pet | `?route=pets&id=5` | GET |
| Create pet (admin) | `?route=pets` | POST |
| Update pet (admin) | `?route=pets&id=5` | PUT |
| Delete pet (admin) | `?route=pets&id=5` | DELETE |
| Apply for adoption | `?route=adoptions` | POST |
| My applications | `?route=adoptions&action=my` | GET |
| Review application | `?route=adoptions&id=3&action=review` | PUT |
| Admin stats | `?route=admin&action=stats` | GET |

All responses return **JSON**. Protected routes require header:
`Authorization: Bearer <token>`

---

## 📊 CRUD Summary

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Pets | ✅ Admin | ✅ Public | ✅ Admin | ✅ Admin |
| Adoption Requests | ✅ User | ✅ User/Admin | ✅ Admin | — |
| Users | ✅ Register | ✅ User/Admin | ✅ User | ✅ User |
| Rescuers | ✅ Apply | ✅ Public | — | — |
| Saved Pets | ✅ User | ✅ User | — | ✅ User |
| Donations | ✅ User | ✅ User/Admin | — | — |
| Notifications | Auto | ✅ User | ✅ User | ✅ User |
| Contact Msgs | ✅ Public | ✅ Admin | ✅ Admin | — |
| Shelters | ✅ Admin | ✅ Admin | — | — |

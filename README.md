# 🔔 Multi-Channel Notification System

A full-stack, enterprise-grade event-driven notification management system. Allows admins to manage all **WhatsApp (Meta Cloud API Sandbox)**, **Email (Postmark / Brevo)**, and **Web Push (OneSignal)** templates from a **single unified admin panel matrix screen**.

---

## 🌟 Key Highlights & Architectural Features

- **Single Screen Admin Panel**: Zero need to navigate external provider websites (WhatsApp, Postmark, OneSignal) to manage templates. Create, edit, toggle on/off, and test-send directly from the UI table matrix.
- **Event-Driven Triggers**: Includes built-in event triggers (`login`, `logout`) and supports unlimited custom triggers (`not_logged_in_1_day`, `not_logged_in_1_week`, `password_reset`, `order_placed`).
- **Dynamic Variable Placeholders**: Supports dynamic tags `{username}`, `{first_name}`, `{email}`, `{phone_number}`, `{time}` rendered automatically at runtime.
- **Granular Channel Toggles**: Instantly enable or disable any channel per trigger with live status indicators.
- **WhatsApp Sandbox & Web Push Ready**: Native support for Meta Cloud API Sandbox, Postmark REST API, and OneSignal browser push SDK.

---

## 📂 Project Architecture

```text
notification-system/
├── backend/                         # Django REST Framework (Deploy on Render)
│   ├── manage.py
│   ├── requirements.txt             # Django, DRF, CorsHeaders, WhiteNoise, gunicorn, dj-database-url
│   ├── .env                         # Secrets (SECRET_KEY, DATABASE_URL, API keys)
│   ├── config/                      # Core Django settings, URLs & WSGI
│   ├── accounts/                    # Profile model & Auth APIs (login/logout triggers)
│   └── notifications/               # Trigger & Template models, Dispatcher & 3 Service adapters
│       └── services/
│           ├── whatsapp.py          # WhatsApp Cloud API Graph request service
│           ├── email.py             # Postmark REST API email service
│           └── webpush.py           # OneSignal REST API push notification service
│
└── frontend/                        # React + Vite (Deploy on Vercel)
    ├── package.json
    ├── .env                         # VITE_API_URL & VITE_ONESIGNAL_APP_ID
    ├── public/
    │   └── OneSignalSDKWorker.js    # OneSignal Service Worker for Web Push
    └── src/
        ├── api/client.js            # Unified API Client for backend endpoints
        ├── pages/
        │   ├── Login.jsx            # Auth page firing 'login' & 'logout' triggers
        │   ├── Home.jsx             # User portal with OneSignal Web Push button
        │   └── NotificationSettings.jsx # One-screen Admin Matrix Table
        └── components/
            ├── TriggerTable.jsx     # Matrix Table (Rows = Triggers, Columns = Channels)
            ├── TemplateModal.jsx    # Modal editor with variable tag inserters
            └── ChannelCell.jsx      # Channel cell with toggles, status & test send
```

---

## 🛠 Quickstart Guide (Local Development)

### 1. Backend Setup (Django)
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (seeds default 'login' and 'logout' triggers)
python manage.py migrate

# Create Admin Superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```
*Backend server runs at `http://localhost:8000`.*

### 2. Frontend Setup (React + Vite)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
```env
SECRET_KEY=django-insecure-secret-key-here
DEBUG=True
ALLOWED_HOSTS=*
DATABASE_URL=sqlite:///db.sqlite3

# WhatsApp Cloud API Sandbox
WHATSAPP_ACCESS_TOKEN=your_meta_whatsapp_test_token
PHONE_NUMBER_ID=your_whatsapp_phone_number_id

# Email (Postmark or Brevo)
POSTMARKAPP_TOKEN=your_postmark_server_token
POSTMARK_FROM_EMAIL=your_verified_sender@example.com

# Web Push (OneSignal)
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
```

---

## 📝 Task D — Assignment Q&A

### Q1: What is a trigger? Give 3 examples (not only login).
> **Answer**: A trigger is any system event or condition on the website that automatically fires a notification. 
> **Examples**:
> 1. `Login`: Fired when a user signs in.
> 2. `Not logged in for 1 week`: Fired by a background job when a user hasn't visited in 7 days.
> 3. `Password Reset`: Fired when a user requests a password reset link.

### Q2: What are the three channels?
> **Answer**: 
> 1. **WhatsApp**: Message delivered to recipient's phone via Meta WhatsApp Cloud API.
> 2. **Email**: Transactional email delivered via Postmark (or Brevo/Resend) API.
> 3. **Web Push**: Instant pop-up notification delivered to the user's browser via OneSignal REST API.

### Q3: Why create templates in admin panel instead of Postmark / WhatsApp site?
> **Answer**: Creating templates in the admin panel centralizes message management in one single dashboard. Admins don't need to log into three different vendor portals, manage separate API schemas, or re-deploy backend code when tweaking text or dynamic variables (`{first_name}`, `{time}`).

### Q4: What is Web Push?
> **Answer**: Web Push is a browser-native notification technology that delivers real-time pop-up alerts directly to desktop or mobile browsers via standard push service workers (e.g. OneSignal), even when the user is browsing another tab.

---

## 🎬 Video Walkthrough Script (for Loom / YouTube recording)

1. **Admin Login**: Log into the application using your admin credentials.
2. **Notification Matrix**: Navigate to **Trigger Matrix (Admin)** (`/settings`). Show the single-screen table with triggers as rows and WhatsApp/Email/Web Push as columns.
3. **Template Editing & Toggling**:
   - Click **Edit** on a channel cell (e.g., WhatsApp for `Login`).
   - Modify the body text and insert variable placeholders (e.g., `{first_name}`).
   - Toggle the channel ON/OFF to demonstrate instant matrix state updates.
4. **Testing Channels (Task A & Task B)**:
   - Click **Test Send** for WhatsApp -> receive test message on phone.
   - Click **Test Send** for Email -> receive test email in inbox.
   - Click **Subscribe Browser to Web Push** in User Portal -> Click **Test Send** for Web Push -> receive desktop push notification!
5. **Event Trigger Demo**: Log out and log back in, showing automatic dispatch execution in the logs!

---

## 🚀 Deployment Instructions

### Deploy Backend to Render
1. Create a Web Service on Render and point to `backend/`.
2. Environment: `Python 3`.
3. Build Command: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
4. Start Command: `gunicorn config.wsgi:application`
5. Add all `.env` variables in Render Settings.

### Deploy Frontend to Vercel
1. Import project into Vercel and set Root Directory to `frontend`.
2. Framework Preset: `Vite`.
3. Environment Variables: `VITE_API_URL` (your Render backend URL) & `VITE_ONESIGNAL_APP_ID`.
4. Deploy!

# Multi-Channel Notification System Backend (Django REST Framework)

This repository serves as the centralized multi-channel notification backend supporting **WhatsApp (Meta Cloud API)**, **Email (Resend API)**, and **Web Push (OneSignal)** dispatch.

---

## 🛠 Features & Triggers Built

- **Event-Driven Dispatcher**: Automatically triggers notifications across channels when system events occur (`fire_trigger(key, user)`).
- **Triggers Built**:
  1. **`login`**: Triggered when a user logs into the system. Sends welcome/login alerts via active channels.
  2. **`logout`**: Triggered when a user logs out of the system. Sends session end notifications via active channels.
- **Admin Management APIs**:
  - Full matrix management for listing triggers, associated channel templates, and dynamic placeholders `{username}`, `{first_name}`, `{email}`, `{phone_number}`, `{time}`.
  - Interactive **On/Off Toggle** (`/api/notifications/templates/<id>/toggle/`) for instantly disabling or enabling channels.
  - Live **Test Send API** (`/api/notifications/templates/<id>/test-send/`) to preview notification deliveries on-demand.

---

## 🔑 Required Environment Variables (`backend/.env`)

| Variable Name | Description | Default / Sandbox Value |
|---|---|---|
| `SECRET_KEY` | Django secret key | `django-insecure-secret-key...` |
| `DEBUG` | Debug mode toggle | `True` |
| `ALLOWED_HOSTS` | Comma-separated host domains | `*` |
| `DATABASE_URL` | Database connection URL | `sqlite:///db.sqlite3` or PostgreSQL URL |
| `WHATSAPP_ACCESS_TOKEN` | Meta Graph API access token | `EAAG...` |
| `PHONE_NUMBER_ID` | WhatsApp Business Phone ID | `100000000000000` |
| `RESEND_API_KEY` | Resend API Key | `re_...` |
| `RESEND_FROM_EMAIL` | Verified sender email | `onboarding@resend.dev` |
| `ONESIGNAL_APP_ID` | OneSignal App ID | `your-onesignal-app-id` |
| `ONESIGNAL_REST_API_KEY` | OneSignal REST API Key | `your-onesignal-rest-key` |

> ⚠️ **Security Notice**: Never commit `.env` to GitHub. It is ignored via `.gitignore`.

---

## 🚀 Local Quickstart Guide

1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Create Admin / Superuser Account:
   ```bash
   python manage.py createsuperuser
   ```
   *Follow prompts to set username (e.g. `admin`) and password.*

6. Start Django Development Server:
   ```bash
   python manage.py runserver
   ```
   *Server runs at `http://localhost:8000`.*

---

## 🔐 How to Log In as Admin

- **Django Admin Interface**: Go to `http://localhost:8000/admin/` and enter your superuser credentials.
- **Frontend Admin View**: Log in through the React frontend using your admin account (`admin`). Staff/superuser users automatically have full access to the **Notification Matrix Settings Page** (`/settings`).

---

## 🌐 Deployment on Render

1. Create a **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository and set **Root Directory** to `backend`.
3. Set **Environment**: `Python 3`.
4. Set **Build Command**:
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```
5. Set **Start Command**:
   ```bash
   gunicorn config.wsgi:application
   ```
6. Add all Environment Variables (`DATABASE_URL`, `SECRET_KEY`, `ALLOWED_HOSTS`, `WHATSAPP_ACCESS_TOKEN`, etc.) in the Render dashboard.

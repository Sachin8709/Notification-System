# Notification System

A full-stack, multi-channel notification dashboard built with Django and React. Route messages to WhatsApp, Email, and Web Push notifications instantly.

## 🔐 How to Login as Admin

1. Make sure both your backend and frontend are running.
2. Go to your frontend URL (e.g. `https://notification-system-opal.vercel.app/` or your Vercel URL).
3. **Create an Account:**
   - Click on the "Register" tab to create your new admin account (e.g. Username, Phone, Email, Password).
4. **Login & Access Dashboard:**
   - After registering, use those same credentials to log in.
   - Once logged in, click the **Settings (Gear Icon)** in the top navigation to access the Notification Triggers Dashboard!

## ⚡ Triggers Built

The system currently supports the following global event triggers:

1. **`login`** - Fired automatically when a user logs into the system.
2. **`logout`** - Fired automatically when a user logs out.
3. **`registration`** - Fired when a new user signs up.

*(Note: The Password Reset trigger was intentionally removed).*

You can toggle WhatsApp, Email (Resend), or Web Push (OneSignal) deliveries independently for each of these triggers from the Admin Dashboard!

## 🔑 Environment Variables Needed

You must provide the following API keys and settings in your environment variables to make the system work:

### Backend (`backend/.env`)
```ini
SECRET_KEY=your_django_secret_key
DEBUG=False
ALLOWED_HOSTS=*

# Resend Email Integration
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev

# WhatsApp Integration
WHATSAPP_API_TOKEN=your_whatsapp_token

# OneSignal Web Push Integration
ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_API_KEY=your_onesignal_api_key
```

### Frontend (`frontend/.env`)
```ini
# The URL where your backend is running
VITE_API_BASE_URL=https://your-backend-url.com

# OneSignal Web Push Integration
VITE_ONESIGNAL_APP_ID=your_onesignal_app_id
```

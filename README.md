# Notification System

A full-stack, multi-channel notification and alert system built with **Django** and **React**. This system allows users and administrators to trigger and route notifications dynamically across **WhatsApp**, **Email (Resend)**, and **Web Push (OneSignal)**.

## 🚀 Features

- **Multi-Channel Delivery:** Send messages via WhatsApp, Email, and Web Push notifications from a central hub.
- **Dynamic Trigger Matrix:** A modern, fully responsive dashboard matrix where you can toggle active channels on or off for specific system events (e.g., `login`, `logout`).
- **Template Customization:** Edit and customize the message templates sent to users for each channel.
- **Live Testing Simulator:** Safely fire test notifications to specific channels or simulate full global triggers straight from the dashboard.
- **Optimistic React UI:** A sleek, glassmorphic UI built with React, Vite, and Lucide Icons that natively adapts to desktop and mobile layouts.

## 🛠 Tech Stack

- **Frontend:** React (Vite), vanilla CSS (Glassmorphism design system)
- **Backend:** Python, Django, Django REST Framework
- **Database:** SQLite (dev) / PostgreSQL (prod ready)
- **Integrations:**
  - OneSignal (Web Push Notifications)
  - Resend (Email Delivery)
  - Interakt / WhatsApp API (WhatsApp Messaging)

## 📦 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sachin8709/Notification-System.git
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   
   # Setup your backend/.env file with API Keys!
   
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   
   # Setup your frontend/.env file with VITE_API_BASE_URL
   
   npm run dev
   ```

## 🔒 Security Note
**No API keys or sensitive credentials are included in this repository.** All sensitive data must be managed locally using `.env` files, which are strictly ignored via `.gitignore`. 

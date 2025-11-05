# Backend Setup Guide

## 🎯 Two Backend Options

You now have **TWO** independent backends that work with the same frontend:

1. **Django Backend** (Python) - Located in `/backend`
2. **Node.js Backend** (JavaScript) - Located in `/backendnode`

Both backends run on **port 8000** and provide the same API endpoints.

---

## 🚀 Quick Start

### Option 1: Using Django Backend

```bash
# Navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run server
python manage.py runserver
```

### Option 2: Using Node.js Backend

```bash
# Navigate to backendnode
cd backendnode

# Install dependencies (first time only)
npm install

# Seed database (first time only)
npm run seed

# Run server
npm run dev
```

---

## 📊 Important Notes

### Same Port (8000)
Both backends run on **http://localhost:8000** - you can only run ONE at a time!

### Frontend Configuration
The frontend (`client/src/lib/apiService.ts`) is configured to use:
```typescript
const API_BASE_URL = 'http://localhost:8000/api';
```

This works with **both** backends without any code changes!

### To Switch Backends:
1. **Stop** the currently running backend (Ctrl+C)
2. **Start** the other backend
3. **No frontend changes needed!** Just refresh your browser.

---

## 🗄️ Database

### Django Backend
- Uses: `backend/db.sqlite3`
- Sample data: 6 team members, 5 services, 5 customers, 7 appointments

### Node.js Backend
- Uses: `backendnode/database.sqlite`
- Sample data: 5 team members, 5 services, 5 customers, 6 appointments

**Note:** Each backend has its own separate database. Data is NOT shared between them.

---

## 🔌 API Endpoints (Both Backends)

Both provide identical endpoints:

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/customers` | GET, POST, PUT, DELETE | Customer management |
| `/api/services` | GET, POST, PUT, DELETE | Service management |
| `/api/appointments` | GET, POST, PUT, DELETE | Appointment management |
| `/api/team-members` | GET, POST, PUT, DELETE | Team member management |
| `/api/onboarding/business` | GET, POST, PUT | Onboarding flow |
| `/api/analytics/dashboard` | GET | Dashboard stats |

---

## ✅ Verification

### Check if Backend is Running

```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/api/health"
```

**Django Response:**
```json
{
  "status": "ok",
  "backend": "Django"
}
```

**Node.js Response:**
```json
{
  "status": "ok",
  "message": "Node.js backend is running"
}
```

### Test Appointments Endpoint

```bash
# PowerShell
$appt = Invoke-RestMethod -Uri "http://localhost:8000/api/appointments/"
$appt.results[0]
```

Both backends return:
- `customer` (ID)
- `customer_name` (Name)
- `service` (ID)
- `service_name` (Name)

---

## 🛠️ Development

### Django Backend
- **Framework**: Django 5.0.1 + Django REST Framework
- **Language**: Python 3.x
- **ORM**: Django ORM
- **Location**: `/backend`

### Node.js Backend
- **Framework**: Express.js 4.x
- **Language**: JavaScript (ES Modules)
- **Database**: better-sqlite3
- **Location**: `/backendnode`

---

## 🎨 Frontend Integration

The frontend is **completely backend-agnostic**. It only knows:
- API is at `http://localhost:8000/api`
- Responses are paginated: `{ count, next, previous, results }`
- Appointments include both IDs and names

**No frontend changes needed when switching backends!**

---

## 🔄 Migration Tips

### From Django to Node.js:
1. Stop Django: `Ctrl+C` in Django terminal
2. Start Node: `npm run dev` in backendnode folder
3. Refresh frontend browser

### From Node.js to Django:
1. Stop Node: `Ctrl+C` in Node terminal
2. Activate venv: `.\venv\Scripts\Activate.ps1`
3. Start Django: `python manage.py runserver`
4. Refresh frontend browser

---

## 📝 Commands Cheat Sheet

### Django
```bash
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver              # Start server
python manage.py makemigrations         # Create migrations
python manage.py migrate                # Apply migrations
python manage.py populate_sample_data   # Seed data
```

### Node.js
```bash
cd backendnode
npm install           # Install dependencies
npm run seed          # Seed database
npm run dev           # Start with nodemon (auto-reload)
npm start             # Start production mode
```

### Frontend
```bash
cd frontend
npm install           # Install dependencies
npm run dev           # Start Vite dev server (port 5173)
```

---

## 🎯 Which Backend Should I Use?

**Use Django if:**
- You prefer Python
- You need Django admin panel
- You want built-in ORM features
- You're familiar with Django ecosystem

**Use Node.js if:**
- You prefer JavaScript
- You want faster startup times
- You prefer Express simplicity
- You want full-stack JavaScript

**Both are production-ready and feature-complete!**

---

## 🚦 Current Status

✅ Django Backend: Fully functional with 7 appointments
✅ Node.js Backend: Fully functional with 6 appointments
✅ Frontend: Working with both backends
✅ API Compatibility: 100% identical endpoints
✅ Response Format: Matching pagination and data structure

---

## 📞 Support

If you encounter issues:

1. **Check backend is running**: Visit `http://localhost:8000/api/health`
2. **Check CORS**: Both backends allow `http://localhost:5173`
3. **Check database**: Each backend has its own SQLite file
4. **Check terminal**: Look for error messages in backend terminal

---

**Happy Coding! 🎉**

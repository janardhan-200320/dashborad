# Zervos Booking Dashboard - Node.js Backend

A modern Node.js/Express backend for the Zervos booking management system.

## 🚀 Features

- ✅ RESTful API with Express.js
- ✅ SQLite database with better-sqlite3
- ✅ CORS enabled for frontend integration
- ✅ Full CRUD operations for all entities
- ✅ Pagination support
- ✅ Search and filtering
- ✅ Automatic timestamps
- ✅ Foreign key relationships

## 📦 Installation

```bash
# Install dependencies
npm install

# Seed database with sample data
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

## 🔌 API Endpoints

### Customers
- `GET    /api/customers` - List all customers (paginated)
- `GET    /api/customers/:id` - Get single customer
- `POST   /api/customers` - Create customer
- `PUT    /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Services
- `GET    /api/services` - List all services (paginated)
- `GET    /api/services/active` - Get active services
- `GET    /api/services/:id` - Get single service
- `POST   /api/services` - Create service
- `PUT    /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `POST   /api/services/:id/toggle_enabled` - Toggle service status

### Appointments
- `GET    /api/appointments` - List all appointments (paginated)
- `GET    /api/appointments/upcoming` - Get upcoming appointments
- `GET    /api/appointments/today` - Get today's appointments
- `GET    /api/appointments/stats` - Get appointment statistics
- `GET    /api/appointments/:id` - Get single appointment
- `POST   /api/appointments` - Create appointment
- `PUT    /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `POST   /api/appointments/:id/complete` - Mark as completed
- `POST   /api/appointments/:id/cancel` - Mark as cancelled

### Team Members
- `GET    /api/team-members` - List all team members (paginated)
- `GET    /api/team-members/active` - Get active team members
- `GET    /api/team-members/:id` - Get single team member
- `POST   /api/team-members` - Create team member
- `PUT    /api/team-members/:id` - Update team member
- `DELETE /api/team-members/:id` - Delete team member
- `POST   /api/team-members/:id/toggle_active` - Toggle active status

### Onboarding
- `GET    /api/onboarding/business` - List all onboarding records
- `GET    /api/onboarding/business/:id` - Get single record
- `POST   /api/onboarding/business` - Create onboarding
- `PUT    /api/onboarding/business/:id` - Update onboarding

### Analytics
- `GET    /api/analytics/dashboard` - Get dashboard statistics

## 🗄️ Database Schema

### Customers
- id, name, email, phone, notes, total_bookings, last_appointment, timestamps

### Services
- id, name, description, duration, price, category, is_enabled, timestamps

### Appointments
- id, customer_id, service_id, staff, date, time, status, notes, meeting_platform, meeting_link, timestamps

### Team Members
- id, name, email, role, avatar, color, is_active, timestamps

### Business Onboarding
- id, business_name, website_url, currency, industries, business_needs, timezone, available_days, time slots, labels, timestamps

## 🔧 Configuration

Edit `.env` file:

```env
PORT=8000
NODE_ENV=development
DB_PATH=./database.sqlite
CORS_ORIGIN=http://localhost:5173
```

## 📝 Sample Data

Run `npm run seed` to populate the database with:
- 5 customers
- 5 services
- 6 appointments
- 5 team members

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Middleware**: CORS, Morgan (logging)

## 🚦 Running

1. Install dependencies: `npm install`
2. Seed database: `npm run seed`
3. Start server: `npm run dev`
4. Server runs on: `http://localhost:8000`

## 🔄 Migration from Django

This Node.js backend is a drop-in replacement for the Django backend. All API endpoints maintain the same structure and response format.

To switch:
1. Stop Django server
2. Start Node server: `npm run dev`
3. Frontend will work without any code changes!

## 📊 Response Format

All list endpoints return paginated responses:

```json
{
  "count": 10,
  "next": "?page=2&limit=100",
  "previous": null,
  "results": [...]
}
```

## ⚡ Performance

- Synchronous SQLite operations for simplicity
- In-memory database option for testing
- Efficient indexing on foreign keys
- Automatic timestamp updates

## 🔒 Security

- CORS configured for specific origin
- SQL injection protection via prepared statements
- Input validation on required fields
- Foreign key constraints enforced

## 📚 Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "better-sqlite3": "^9.2.2",
  "dotenv": "^16.3.1",
  "morgan": "^1.10.0"
}
```

## 🤝 Contributing

This backend replicates Django functionality in Node.js. Maintain API compatibility when adding features.

## 📄 License

MIT

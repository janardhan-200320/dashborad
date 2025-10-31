import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, '..', 'database.sqlite');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  console.log('🔧 Initializing database...');

  // Create customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      notes TEXT,
      total_bookings INTEGER DEFAULT 0,
      last_appointment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      duration TEXT NOT NULL,
      price TEXT,
      category TEXT DEFAULT 'other',
      is_enabled BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create appointments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      service_id INTEGER,
      staff TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'upcoming',
      notes TEXT,
      meeting_platform TEXT,
      meeting_link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
    )
  `);

  // Create team_members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'salesperson',
      avatar TEXT,
      color TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create onboarding table
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_onboarding (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_name TEXT NOT NULL,
      website_url TEXT,
      currency TEXT DEFAULT 'INR',
      industries TEXT,
      business_needs TEXT,
      timezone TEXT,
      available_days TEXT,
      available_time_start TEXT,
      available_time_end TEXT,
      event_type_label TEXT,
      team_member_label TEXT,
      is_completed BOOLEAN DEFAULT 0,
      current_step INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create organization_settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS organization_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      industry TEXT,
      email TEXT,
      phone TEXT,
      logo TEXT,
      brand_color TEXT DEFAULT '#6366f1',
      timezone TEXT DEFAULT 'Asia/Kolkata',
      working_days TEXT,
      working_hours_start TEXT DEFAULT '09:00',
      working_hours_end TEXT DEFAULT '18:00',
      booking_url TEXT,
      meta_title TEXT,
      meta_description TEXT,
      allow_guest_booking BOOLEAN DEFAULT 1,
      require_login BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create workspaces table
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      members_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      settings TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create resources table
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      is_available BOOLEAN DEFAULT 1,
      location_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
    )
  `);

  // Create locations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      postal_code TEXT,
      directions TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create integrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      is_connected BOOLEAN DEFAULT 0,
      api_key TEXT,
      settings TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create custom_labels table
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label_type TEXT NOT NULL,
      label_value TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create roles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      permissions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized successfully');
}

export default db;

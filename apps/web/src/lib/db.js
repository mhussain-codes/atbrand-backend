import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local embedded fallback database for 100% offline & reliable development/deployment
const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const sqliteDb = new Database(path.join(dbDir, 'atbrand.db'));

// Initialize local schema
sqliteDb.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT DEFAULT 'Men',
    season TEXT DEFAULT '4 Season',
    price REAL NOT NULL,
    original_price REAL,
    cost_price REAL DEFAULT 0,
    fabric TEXT,
    images TEXT DEFAULT '[]',
    colors TEXT DEFAULT '[]',
    is_new INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,
    in_stock INTEGER DEFAULT 1,
    stock_quantity INTEGER DEFAULT 10,
    low_stock_threshold INTEGER DEFAULT 3,
    sku TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    section TEXT NOT NULL DEFAULT 'men',
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Sargodha',
    items TEXT NOT NULL DEFAULT '[]',
    subtotal REAL NOT NULL DEFAULT 0,
    delivery_charge REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'Unpaid',
    status TEXT DEFAULT 'Pending',
    courier_name TEXT,
    tracking_number TEXT,
    customer_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stitching_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    address TEXT NOT NULL,
    city TEXT DEFAULT 'Sargodha',
    unit TEXT DEFAULT 'inches',
    style_selections TEXT DEFAULT '{}',
    measurements TEXT NOT NULL DEFAULT '{}',
    fabric_choice TEXT,
    special_instructions TEXT,
    status TEXT DEFAULT 'Pending',
    stitching_price REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS measurement_profiles (
    id TEXT PRIMARY KEY,
    profile_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    unit TEXT DEFAULT 'inches',
    measurements TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT DEFAULT '{}',
    performed_by TEXT DEFAULT 'Admin',
    ip_address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    city TEXT DEFAULT 'Sargodha',
    rating INTEGER DEFAULT 5,
    comment TEXT NOT NULL,
    suit_name TEXT,
    is_approved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed authentic customer reviews if table is empty
const reviewCount = sqliteDb.prepare('SELECT count(*) as c FROM reviews').get().c;
if (reviewCount === 0) {
  const seedReviews = [
    {
      id: 'rev-1',
      customer_name: 'Chaudhry Kamran',
      city: 'Sargodha',
      rating: 5,
      comment: 'MashaAllah Ahmad Cotton ka fall aur finishing kamal hai. Tali Chowk shop se pehle leta tha ab online mangwaya, same 100% original quality mili.',
      suit_name: 'Ahmad Cotton Royal White',
      is_approved: 1
    },
    {
      id: 'rev-2',
      customer_name: 'Malik Zeeshan Tariq',
      city: 'Lahore',
      rating: 5,
      comment: 'Washing k baad bhi kapray ki chamak aur graceful fall bilkul fresh rahi. Rashid Cotton winter suit ki warm feel bohot umdah hai. Highly recommended!',
      suit_name: 'Rashid Cotton Winter Grey',
      is_approved: 1
    },
    {
      id: 'rev-3',
      customer_name: 'Haji Abdul Rehman',
      city: 'Rawalpindi',
      rating: 5,
      comment: 'ماشاءاللہ بہت نفیس اور پائیدار کپڑا ہے۔ سلائی کے بعد سوٹ کی خوبصورتی مزید نکھر گئی۔ سرگودھا کا سب سے قابلِ اعتماد برانڈ ہے۔',
      suit_name: 'Executive Boski Fall',
      is_approved: 1
    },
    {
      id: 'rev-4',
      customer_name: 'Usman Farooq',
      city: 'Islamabad',
      rating: 5,
      comment: 'Cash on delivery par 2 din me parcel mil gya. Fabric box packaging bht premium thi. Wash & Wear daily use k lye perfect hai, wrinkles bilkul nhi parte.',
      suit_name: 'Premium Wash & Wear Cream',
      is_approved: 1
    },
    {
      id: 'rev-5',
      customer_name: 'Bilal Ahmad Gujjar',
      city: 'Faisalabad',
      rating: 5,
      comment: 'Silai k sath order kya tha, master tailor ki cutting aur sherwani ban fitting bilkul exact standard size k mutabiq aayi. Bohat shukriya Arslan bhai!',
      suit_name: 'Ahmad Cotton Sky Blue',
      is_approved: 1
    },
    {
      id: 'rev-6',
      customer_name: 'Syed Hamza Ali',
      city: 'Multan',
      rating: 5,
      comment: 'Lattha aur cotton dono mangwaye thay. 100% pure cotton feel hai, garmiyon me pehnne k lye nihayat thanda aur aaramdeh fabric.',
      suit_name: 'Pure Egyptian Lattha White',
      is_approved: 1
    }
  ];

  const insertRev = sqliteDb.prepare(`
    INSERT INTO reviews (id, customer_name, city, rating, comment, suit_name, is_approved)
    VALUES (@id, @customer_name, @city, @rating, @comment, @suit_name, @is_approved)
  `);
  seedReviews.forEach(r => insertRev.run(r));
}

// Supabase client instance
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://mgolzolmhfqsjziuuauq.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nb2x6b2xtaGZxc2p6aXV1YXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNDc3NjUsImV4cCI6MjEwNzgyMzc2NX0.vjYe2I5X6cmVuLy7R5q4ibIi_MDi-xurympVa8ikhMY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

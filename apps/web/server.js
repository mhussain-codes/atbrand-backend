import express from 'express';
import cors from 'cors';
import { sqliteDb, supabase } from './src/lib/db.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { getSeoPage, NOINDEX_PATHS } from './src/data/seoPages.js';
import { PRODUCTS } from './src/data/products.js';
import { getProductSeo } from './src/data/productSeo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads folder exists
const uploadsDir = path.resolve('public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${cleanName}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit

// Multiple Image Upload Endpoint
app.post('/api/upload', upload.array('images', 20), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No image files uploaded' });
  }
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ success: true, urls });
});

const JWT_SECRET = process.env.JWT_SECRET || 'atbrand_secure_admin_jwt_secret_key_2026';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'atbrandAdmin2026!', 10);

// Auth Middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Admin token required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if ((username === 'admin' || username === 'atbrand00@gmail.com') && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    const token = jwt.sign({ username: 'admin', role: 'superadmin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token, user: { name: 'ARSLAN TARIQ', email: 'atbrand00@gmail.com', role: 'ADMIN' } });
  }
  return res.status(401).json({ error: 'Invalid username or password' });
});

// ----------------------------------------------------
// PRODUCTS ENDPOINTS
// ----------------------------------------------------
app.get('/api/products', (req, res) => {
  const { category, type, section, featured, is_new } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = {};

  if (category && category !== 'all') {
    query += ' AND (category = @category OR type = @category)';
    params.category = category;
  }
  if (type && type !== 'all') {
    query += ' AND type = @type';
    params.type = type;
  }
  if (featured === 'true') {
    query += ' AND featured = 1';
  }
  if (is_new === 'true') {
    query += ' AND is_new = 1';
  }

  query += ' ORDER BY created_at DESC';
  const rows = sqliteDb.prepare(query).all(params);
  const products = rows.map(r => ({
    ...r,
    images: JSON.parse(r.images || '[]'),
    colors: JSON.parse(r.colors || '[]'),
    isNew: Boolean(r.is_new),
    featured: Boolean(r.featured),
    in_stock: Boolean(r.in_stock),
    originalPrice: r.original_price
  }));

  res.json({ success: true, count: products.length, products });
});

app.get('/api/products/:id', (req, res) => {
  const row = sqliteDb.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json({
    success: true,
    product: {
      ...row,
      images: JSON.parse(row.images || '[]'),
      colors: JSON.parse(row.colors || '[]'),
      isNew: Boolean(row.is_new),
      featured: Boolean(row.featured),
      in_stock: Boolean(row.in_stock),
      originalPrice: row.original_price
    }
  });
});

app.post('/api/products', requireAdmin, (req, res) => {
  const p = req.body;
  const id = p.id || `at-${Date.now()}`;
  const stmt = sqliteDb.prepare(`
    INSERT INTO products (
      id, name, type, category, season, price, original_price, cost_price, fabric, images, colors, is_new, featured, in_stock, stock_quantity, low_stock_threshold, sku
    ) VALUES (
      @id, @name, @type, @category, @season, @price, @original_price, @cost_price, @fabric, @images, @colors, @is_new, @featured, @in_stock, @stock_quantity, @low_stock_threshold, @sku
    )
  `);

  stmt.run({
    id,
    name: p.name,
    type: p.type || 'Unstitched',
    category: p.category || 'Men',
    season: p.season || '4 Season',
    price: Number(p.price) || 0,
    original_price: p.originalPrice ? Number(p.originalPrice) : null,
    cost_price: p.cost_price ? Number(p.cost_price) : 0,
    fabric: p.fabric || '',
    images: JSON.stringify(p.images || []),
    colors: JSON.stringify(p.colors || []),
    is_new: p.isNew ? 1 : 0,
    featured: p.featured ? 1 : 0,
    in_stock: p.in_stock !== false ? 1 : 0,
    stock_quantity: Number(p.stock_quantity) || 10,
    low_stock_threshold: Number(p.low_stock_threshold) || 3,
    sku: p.sku || `AT-SKU-${id.toUpperCase()}`
  });

  res.json({ success: true, id, message: 'Product created successfully' });
});

app.put('/api/products/:id', requireAdmin, (req, res) => {
  const p = req.body;
  const stmt = sqliteDb.prepare(`
    UPDATE products SET
      name = @name, type = @type, category = @category, season = @season, price = @price,
      original_price = @original_price, cost_price = @cost_price, fabric = @fabric,
      images = @images, colors = @colors, is_new = @is_new, featured = @featured,
      in_stock = @in_stock, stock_quantity = @stock_quantity, low_stock_threshold = @low_stock_threshold,
      sku = @sku, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  stmt.run({
    id: req.params.id,
    name: p.name,
    type: p.type || 'Unstitched',
    category: p.category || 'Men',
    season: p.season || '4 Season',
    price: Number(p.price) || 0,
    original_price: p.originalPrice ? Number(p.originalPrice) : null,
    cost_price: p.cost_price ? Number(p.cost_price) : 0,
    fabric: p.fabric || '',
    images: JSON.stringify(p.images || []),
    colors: JSON.stringify(p.colors || []),
    is_new: p.isNew ? 1 : 0,
    featured: p.featured ? 1 : 0,
    in_stock: p.in_stock !== false ? 1 : 0,
    stock_quantity: Number(p.stock_quantity) || 10,
    low_stock_threshold: Number(p.low_stock_threshold) || 3,
    sku: p.sku || `AT-SKU-${req.params.id.toUpperCase()}`
  });

  res.json({ success: true, message: 'Product updated successfully' });
});

app.patch('/api/products/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const existing = sqliteDb.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const fields = [];
  const params = { id };

  if (updates.name !== undefined) {
    fields.push('name = @name');
    params.name = updates.name;
  }
  if (updates.type !== undefined) {
    fields.push('type = @type');
    params.type = updates.type;
  }
  if (updates.price !== undefined) {
    fields.push('price = @price');
    params.price = Number(updates.price);
  }
  if (updates.stock_quantity !== undefined) {
    fields.push('stock_quantity = @stock_quantity');
    params.stock_quantity = Number(updates.stock_quantity);
  }
  if (updates.in_stock !== undefined) {
    fields.push('in_stock = @in_stock');
    params.in_stock = updates.in_stock ? 1 : 0;
  }

  if (fields.length === 0) {
    return res.json({ success: true, message: 'No fields to update' });
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = @id`;
  sqliteDb.prepare(sql).run(params);

  res.json({ success: true, message: 'Product updated successfully' });
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
  sqliteDb.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

// ----------------------------------------------------
// ORDERS ENDPOINTS
// ----------------------------------------------------
app.post('/api/orders', (req, res) => {
  const { customer_name, phone, address, city, items, total_amount, subtotal, delivery_charge, discount, payment_method, customer_notes } = req.body;
  
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  const order_number = `AT-${rand}`;
  const id = crypto.randomUUID();

  // Deduct inventory transactionally
  const insertOrder = sqliteDb.transaction(() => {
    sqliteDb.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, phone, address, city, items, subtotal, delivery_charge, discount, total_amount, payment_method, customer_notes
      ) VALUES (
        @id, @order_number, @customer_name, @phone, @address, @city, @items, @subtotal, @delivery_charge, @discount, @total_amount, @payment_method, @customer_notes
      )
    `).run({
      id,
      order_number,
      customer_name: (customer_name || '').trim(),
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      city: city || 'Sargodha',
      items: JSON.stringify(items || []),
      subtotal: Number(subtotal) || Number(total_amount) || 0,
      delivery_charge: Number(delivery_charge) || 0,
      discount: Number(discount) || 0,
      total_amount: Number(total_amount) || 0,
      payment_method: payment_method || 'COD',
      customer_notes: customer_notes || ''
    });

    if (Array.isArray(items)) {
      const updateStock = sqliteDb.prepare(`
        UPDATE products SET 
          stock_quantity = MAX(0, stock_quantity - @qty),
          in_stock = CASE WHEN stock_quantity - @qty <= 0 THEN 0 ELSE 1 END
        WHERE id = @pid
      `);
      items.forEach(it => {
        if (it.product_id || it.id) {
          updateStock.run({ pid: it.product_id || it.id, qty: Number(it.quantity) || 1 });
        }
      });
    }
  });

  insertOrder();

  res.json({
    success: true,
    data: {
      id,
      order_id: order_number,
      order_number,
      status: 'Pending',
      total_amount
    }
  });
});

app.get('/api/orders/track/:orderNumber', (req, res) => {
  const order = sqliteDb.prepare('SELECT * FROM orders WHERE UPPER(order_number) = UPPER(?)').get(req.params.orderNumber.trim());
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({
    success: true,
    order: {
      ...order,
      items: JSON.parse(order.items || '[]')
    }
  });
});

app.get('/api/orders', requireAdmin, (req, res) => {
  const rows = sqliteDb.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json({
    success: true,
    orders: rows.map(r => ({
      ...r,
      items: JSON.parse(r.items || '[]')
    }))
  });
});

app.patch('/api/orders/:id/status', requireAdmin, (req, res) => {
  const { status, courier_name, tracking_number } = req.body;
  sqliteDb.prepare(`
    UPDATE orders SET 
      status = COALESCE(@status, status),
      courier_name = COALESCE(@courier_name, courier_name),
      tracking_number = COALESCE(@tracking_number, tracking_number),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({ id: req.params.id, status, courier_name, tracking_number });

  res.json({ success: true, message: 'Order status updated' });
});

// ----------------------------------------------------
// STITCHING ENDPOINTS
// ----------------------------------------------------
app.post('/api/stitching', (req, res) => {
  const { customer_name, phone, whatsapp, address, city, unit, style_selections, measurements, fabric_choice, special_instructions } = req.body;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  const request_number = `ST-${rand}`;
  const id = crypto.randomUUID();

  sqliteDb.prepare(`
    INSERT INTO stitching_requests (
      id, request_number, customer_name, phone, whatsapp, address, city, unit, style_selections, measurements, fabric_choice, special_instructions
    ) VALUES (
      @id, @request_number, @customer_name, @phone, @whatsapp, @address, @city, @unit, @style_selections, @measurements, @fabric_choice, @special_instructions
    )
  `).run({
    id,
    request_number,
    customer_name: (customer_name || '').trim(),
    phone: (phone || '').trim(),
    whatsapp: whatsapp || '',
    address: (address || '').trim(),
    city: city || 'Sargodha',
    unit: unit || 'inches',
    style_selections: JSON.stringify(style_selections || {}),
    measurements: JSON.stringify(measurements || {}),
    fabric_choice: fabric_choice || '',
    special_instructions: special_instructions || ''
  });

  res.json({ success: true, request_number, id });
});

app.get('/api/stitching', requireAdmin, (req, res) => {
  const rows = sqliteDb.prepare('SELECT * FROM stitching_requests ORDER BY created_at DESC').all();
  res.json({
    success: true,
    requests: rows.map(r => ({
      ...r,
      style_selections: JSON.parse(r.style_selections || '{}'),
      measurements: JSON.parse(r.measurements || '{}')
    }))
  });
});

// ----------------------------------------------------
// REVIEWS ENDPOINTS
// ----------------------------------------------------
app.get('/api/reviews', (req, res) => {
  const reviews = sqliteDb.prepare('SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC').all();
  res.json({ success: true, count: reviews.length, reviews });
});

app.post('/api/reviews', (req, res) => {
  const { customer_name, city, rating, comment, suit_name } = req.body;
  if (!customer_name || !comment) {
    return res.status(400).json({ error: 'Customer name and comment are required' });
  }

  const id = `rev-${Date.now()}`;
  sqliteDb.prepare(`
    INSERT INTO reviews (id, customer_name, city, rating, comment, suit_name, is_approved)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `).run(
    id,
    customer_name.trim(),
    (city || 'Sargodha').trim(),
    Number(rating) || 5,
    comment.trim(),
    (suit_name || '').trim()
  );

  res.json({ success: true, message: 'Review submitted for approval. Shukriya!', id });
});

app.get('/api/admin/reviews', requireAdmin, (req, res) => {
  const reviews = sqliteDb.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json({ success: true, count: reviews.length, reviews });
});

app.patch('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const { is_approved } = req.body;
  sqliteDb.prepare('UPDATE reviews SET is_approved = ? WHERE id = ?').run(
    is_approved ? 1 : 0,
    req.params.id
  );
  res.json({ success: true, message: `Review ${is_approved ? 'approved' : 'rejected'}` });
});

app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  sqliteDb.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Review deleted' });
});

// ----------------------------------------------------
// DASHBOARD ANALYTICS ENDPOINT
// ----------------------------------------------------
app.get('/api/admin/dashboard-stats', requireAdmin, (req, res) => {
  const totalOrders = sqliteDb.prepare('SELECT COUNT(*) as count FROM orders').get().count;
  const totalRevenue = sqliteDb.prepare("SELECT SUM(total_amount) as total FROM orders WHERE status != 'Cancelled'").get().total || 0;
  const activeProducts = sqliteDb.prepare('SELECT COUNT(*) as count FROM products WHERE in_stock = 1').get().count;
  const pendingOrders = sqliteDb.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'").get().count;
  
  const lowStockProducts = sqliteDb.prepare('SELECT * FROM products WHERE stock_quantity <= low_stock_threshold ORDER BY stock_quantity ASC LIMIT 10').all();
  const recentOrders = sqliteDb.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 6').all().map(r => ({
    ...r,
    items: JSON.parse(r.items || '[]')
  }));

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders,
      activeProducts,
      pendingOrders,
      lowStockProducts,
      recentOrders
    }
  });
});

// Serve frontend static build if exists (for unified Node deployment)
const possibleDistPaths = [
  path.resolve('apps/web/dist'),
  path.resolve('dist'),
  path.join(__dirname, 'dist')
];

let distDir = possibleDistPaths.find(p => fs.existsSync(p));
const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
app.get('/sitemap.xml', (_req, res, next) => {
  if (fs.existsSync(sitemapPath)) return res.sendFile(sitemapPath);
  next();
});

if (distDir) {
  // Keep crawler-facing metadata and sitemap aligned with the source of truth,
  // even when Hostinger serves the checked-in frontend shell from `dist`.
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      const shellPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(shellPath)) return next();

      const requestPath = req.path.replace(/\/+$/, '') || '/';
      const productMatch = requestPath.match(/^\/product\/([^/]+)$/);
      const product = productMatch && PRODUCTS.find(item => item.id === productMatch[1]);
      const productSeo = product ? getProductSeo(product) : null;
      const metadata = productSeo
        ? { title: productSeo.title, description: productSeo.description }
        : getSeoPage(requestPath);
      const canonicalPath = requestPath.startsWith('/categories/')
        ? requestPath.replace('/categories/', '/men/')
        : requestPath === '/home' ? '/' : requestPath;
      const canonical = canonicalPath === '/' ? 'https://atbrand.store/' : `https://atbrand.store${canonicalPath}`;
      const escapeHtml = value => String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
      const replaceTag = (html, pattern, replacement) => pattern.test(html)
        ? html.replace(pattern, replacement)
        : html.replace('</head>', `  ${replacement}\n</head>`);

      let html = fs.readFileSync(shellPath, 'utf8');
      const title = escapeHtml(metadata.title);
      const description = escapeHtml(metadata.description);
      html = replaceTag(html, /<title[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
      html = replaceTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${description}" />`);
      html = replaceTag(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
      html = replaceTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`);
      html = replaceTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${description}" />`);
      html = replaceTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
      html = replaceTag(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`);
      html = replaceTag(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${description}" />`);
      if (NOINDEX_PATHS.includes(requestPath)) {
        html = replaceTag(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,follow" />');
      }
      return res.status(200).type('html').send(html);
    }
    next();
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`AT BRAND unified backend server listening on port ${PORT}`);
});

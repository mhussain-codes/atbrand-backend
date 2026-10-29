import { sqliteDb } from './db.js';
import { PRODUCTS, TYPES } from '../data/products.js';

export function seedDatabase() {
  const count = sqliteDb.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (count === 0) {
    console.log('Seeding initial 51 products into database...');
    const insertStmt = sqliteDb.prepare(`
      INSERT INTO products (
        id, name, type, category, season, price, original_price, cost_price, fabric, images, colors, is_new, featured, in_stock, stock_quantity, low_stock_threshold, sku
      ) VALUES (
        @id, @name, @type, @category, @season, @price, @original_price, @cost_price, @fabric, @images, @colors, @is_new, @featured, @in_stock, @stock_quantity, @low_stock_threshold, @sku
      )
    `);

    const insertMany = sqliteDb.transaction((products) => {
      for (const p of products) {
        insertStmt.run({
          id: p.id,
          name: p.name,
          type: p.type || 'Unstitched',
          category: 'Men',
          season: p.season || '4 Season',
          price: p.price,
          original_price: p.originalPrice || null,
          cost_price: Math.round(p.price * 0.7),
          fabric: p.fabric || '',
          images: JSON.stringify(p.images || []),
          colors: JSON.stringify(p.colors || []),
          is_new: p.isNew ? 1 : 0,
          featured: p.featured ? 1 : 0,
          in_stock: p.in_stock !== false ? 1 : 0,
          stock_quantity: 15,
          low_stock_threshold: 3,
          sku: `AT-SKU-${p.id.toUpperCase()}`
        });
      }
    });

    insertMany(PRODUCTS);
    console.log(`Successfully seeded ${PRODUCTS.length} products.`);

    // Seed categories
    const catStmt = sqliteDb.prepare(`
      INSERT OR IGNORE INTO categories (id, name, slug, section, display_order)
      VALUES (@id, @name, @slug, @section, @display_order)
    `);

    TYPES.forEach((type, index) => {
      const slug = type.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      catStmt.run({
        id: `cat-${slug}`,
        name: type,
        slug: slug,
        section: 'men',
        display_order: index + 1
      });
    });

    // Seed Women & Perfume baseline categories
    catStmt.run({ id: 'cat-women-unstitched', name: 'Unstitched Lawn & Chiffon', slug: 'unstitched', section: 'women', display_order: 1 });
    catStmt.run({ id: 'cat-women-ready', name: 'Pret & Ready-to-Wear', slug: 'ready-to-wear', section: 'women', display_order: 2 });
    catStmt.run({ id: 'cat-perfumes-oud', name: 'Oriental & Oudh Blends', slug: 'oud-oriental', section: 'perfumes', display_order: 1 });
  }
}

seedDatabase();

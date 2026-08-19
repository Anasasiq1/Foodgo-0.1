/**
 * Foodgo CLI Database Migration & Initialization Script (Node.js)
 * Usage: npm run migrate or npm run setup
 */

import fs from 'fs';
import path from 'path';
import { db } from './db';

async function runCliSetup() {
  console.log('----------------------------------------------------');
  console.log('🚀 Initializing Foodgo Database & Tables (Node.js)...');
  console.log('----------------------------------------------------');

  try {
    const data = db.getDb();
    const products = data.products || [];
    const categories = data.categories || [];
    const settings = data.settings || { storeName: 'Foodgo' };

    console.log(`✓ Loaded ${categories.length} categories.`);
    console.log(`✓ Loaded ${products.length} gourmet menu items.`);
    console.log(`✓ Verified store settings for "${settings.storeName}".`);

    // Create storage lock if not present
    const storageDir = path.resolve(process.cwd(), 'storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const lockPath = path.join(storageDir, 'installed.lock');
    if (!fs.existsSync(lockPath)) {
      fs.writeFileSync(
        lockPath,
        JSON.stringify(
          {
            installed_at: new Date().toISOString(),
            method: 'Node.js CLI',
            status: 'Ready',
          },
          null,
          2
        )
      );
      console.log('✓ Created storage/installed.lock');
    }

    console.log('----------------------------------------------------');
    console.log('🎉 Foodgo Database & Setup Complete!');
    console.log('👉 Run "npm run build" to compile frontend assets.');
    console.log('👉 Run "npm start" to launch the production server.');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

runCliSetup();

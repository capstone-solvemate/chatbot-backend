import bcrypt from 'bcrypt';
import configData from './config/config.js';
import { Sequelize } from 'sequelize';

const config = configData.default || configData;

async function run() {
  const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, config.development);
  try {
    const hash = await bcrypt.hash('password123', 12);
    await sequelize.query(`INSERT INTO pengguna (id, nama, email, password) VALUES (2, 'Admin', 'admin@admin.com', '${hash}') ON DUPLICATE KEY UPDATE password='${hash}';`);
    await sequelize.query(`INSERT IGNORE INTO peran_pengguna (id_pengguna, peran) VALUES (2, 1), (2, 2);`);
    console.log('Successfully created admin@admin.com');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
}
run();

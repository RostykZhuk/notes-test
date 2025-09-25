const { pool } = require('../database/postgres');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password }) {
    const passwordHash = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, created_at, updated_at
    `;
    
    const result = await pool.query(query, [email, passwordHash]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, email, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      RETURNING id, email, updated_at
    `;
    
    const result = await pool.query(query, [passwordHash, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM users WHERE id = $1`;
    await pool.query(query, [id]);
  }

  static async count() {
    const query = `SELECT COUNT(*) as count FROM users`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = User;

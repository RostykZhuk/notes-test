const { pool } = require('../database/postgres');

class Note {
  static async create({ userId, title, content, tags = [] }) {
    const query = `
      INSERT INTO notes (user_id, title, content, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, title, content, tags, created_at, updated_at
    `;
    
    const result = await pool.query(query, [userId, title, content, tags]);
    return result.rows[0];
  }

  static async findById(id, userId) {
    const query = `
      SELECT id, user_id, title, content, tags, created_at, updated_at
      FROM notes
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  static async findByUserId(userId, { limit = 50, offset = 0, tags = [] } = {}) {
    let query = `
      SELECT id, user_id, title, content, tags, created_at, updated_at
      FROM notes
      WHERE user_id = $1
    `;
    
    const params = [userId];
    let paramIndex = 2;

    // Filter by tags if provided
    if (tags.length > 0) {
      query += ` AND tags && $${paramIndex}`;
      params.push(tags);
      paramIndex++;
    }

    query += ` ORDER BY updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async searchByTags(userId, tags) {
    const query = `
      SELECT id, user_id, title, content, tags, created_at, updated_at
      FROM notes
      WHERE user_id = $1 AND tags && $2
      ORDER BY updated_at DESC
    `;
    
    const result = await pool.query(query, [userId, tags]);
    return result.rows;
  }

  static async update(id, userId, { title, content, tags }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(title);
      paramIndex++;
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      params.push(content);
      paramIndex++;
    }

    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex}`);
      params.push(tags);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE notes
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING id, user_id, title, content, tags, created_at, updated_at
    `;

    params.push(id, userId);
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM notes
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  static async count(userId) {
    const query = `SELECT COUNT(*) as count FROM notes WHERE user_id = $1`;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  static async countTotal() {
    const query = `SELECT COUNT(*) as count FROM notes`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async getUserTags(userId) {
    const query = `
      SELECT DISTINCT unnest(tags) as tag
      FROM notes
      WHERE user_id = $1 AND array_length(tags, 1) > 0
      ORDER BY tag
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => row.tag);
  }
}

module.exports = Note;

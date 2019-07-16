const { Pool } = require('pg');
const debug = require('debug');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL || process.env.DATABASE_URL : process.env.DATABASE_URL;

class Model {
  constructor(table) {
    this.table = table;
    this.pool = new Pool({ connectionString });
    this.pool.on('error', (err) => {
      debug('dev')('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  async select(columns, clause = '') {
    const query = `SELECT ${columns} FROM ${this.table} ${clause}`;
    const data = await this.pool.query(query);
    return data.rows;
  }

  async insert(columns, values, queryData = 'id, email, first_name, last_name, is_admin') {
    const query = `INSERT INTO ${this.table}(${columns}) VALUES (${values}) RETURNING ${queryData}`;
    const data = await this.pool.query(query);
    return data.rows;
  }

  async delete(clause, value) {
    const query = `DELETE FROM ${this.table} WHERE ${clause}='${value}' RETURNING *`;
    const data = await this.pool.query(query);
    return data.rows;
  }
}

module.exports = Model;

const { Pool } = require('pg');
const debug = require('debug');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.TEST_DATABASE_URL;

class Model {
  constructor(table) {
    this.table = table;
    this.pool = process.env.NODE_ENV === 'test' ? new Pool({ connectionString }) : new Pool();
    this.pool.on('error', (err) => {
      debug('dev')('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  async select(columns, clause = '') {
    const query = `SELECT ${columns} FROM ${this.table} ${clause}`;
    const { rows } = await this.pool.query(query);
    return rows;
  }

  async insert(columns, values, queryData = '') {
    const query = `INSERT INTO ${this.table}(${columns}) VALUES (${values}) RETURNING ${queryData}`;
    const { rows } = await this.pool.query(query);
    return rows;
  }

  async delete(clause, value) {
    const query = `DELETE FROM ${this.table} WHERE ${clause}='${value}' RETURNING *`;
    const { rows } = await this.pool.query(query);
    return rows;
  }

  async deleteAll() {
    const query = `TRUNCATE TABLE ${this.table} CASCADE`;
    const { rows } = await this.pool.query(query);
    return rows;
  }
}

module.exports = Model;

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

async function updateSchema() {
  let dbUrl = process.env.DATABASE_URL
  if (dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
    dbUrl = dbUrl.slice(1, -1)
  }
  if (dbUrl.startsWith("'") && dbUrl.endsWith("'")) {
    dbUrl = dbUrl.slice(1, -1)
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })

  try {
    await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }

  try {
    console.log('\n[1/1] Adding user fields...')
    const sqlFile = path.join(__dirname, '..', 'database', 'add-user-fields.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    await pool.query(sqlContent)
    console.log('✅ User fields added')
    
    console.log('\n=== Schema Update Complete ===')
  } catch (error) {
    console.error('❌ Error during update:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

updateSchema()




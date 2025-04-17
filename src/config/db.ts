import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'sql8.freesqldatabase.com',
    user: 'sql8773452',
    password: 'dYPMbAZ6rT',
    database: 'sql8773452',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

export default pool;
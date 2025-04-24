import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'sql8.freesqldatabase.com',
    user: 'sql8774861',
    password: 'z6evY14kdG',
    database: 'sql8774861',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

export default pool;
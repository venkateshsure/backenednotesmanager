
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3606,
  user: 'root',
  password: 'venky', // Change this to your MySQL root password
  database: 'sakila'   // Change this to your database name
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Successfully connected to MySQL Server');
});

module.exports = connection;
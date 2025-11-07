const db = require('./db');

try {
  // Try running a basic query to see if connection works
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("Connected! Tables found in database:");
  console.table(tables);
} catch (err) {
  console.error("Database connection failed:", err);
}

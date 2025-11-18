// models/User.js
import db from "../../db.js";

function createUser(username, passHash) {
    return new Promise((resolve, reject) => {
        const query =  
        `INSERT INTO users (username, password_hash)
        VALUES (?, ?)
        `;
        
        db.run(query, [username, passHash], function(err) {
            if (err) return reject(err);
            resolve({id: this.lastID});
        });
    });
}

function getUserByName(username) {
    return new Promise((resolve, reject) => {
        const query = 
        `SELECT * FROM users WHERE username = ?`;
        db.get(query, [username], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

module.exports = {createUser, getUserByName};
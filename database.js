const sqlite3 = require("sqlite3").verbose();

// Conectar o crear la base de datos (chat.db)
const db = new sqlite3.Database("chat.db", (err) => {
    if (err) {
        console.error("❌ Error al abrir la base de datos:", err.message);
    } else {
        console.log("✅ Conectado a la base de datos SQLite.");
    }
});

// Crear la tabla de mensajes si no existe
db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    message TEXT,
    image TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

const saveMessage = (user, message, image) => {
    db.run("INSERT INTO messages (user, message, image) VALUES (?, ?, ?)", 
        [user, message, image], 
        (err) => {
            if (err) console.error("❌ Error al guardar mensaje:", err.message);
        }
    );
};

const getMessages = (callback) => {
    db.all("SELECT * FROM messages ORDER BY timestamp ASC", (err, rows) => {
        if (err) {
            console.error("❌ Error al obtener mensajes:", err.message);
            callback([]);
        } else {
            callback(rows);
        }
    });
};

module.exports = { saveMessage, getMessages };

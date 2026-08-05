const fs = require('fs');
const config = require('./config');

function load() {
    try {
        return JSON.parse(fs.readFileSync(config.POSTED_DB_FILE, 'utf-8'));
    } catch (_) {
        return { posted: [] };
    }
}

function save(db) {
    fs.writeFileSync(config.POSTED_DB_FILE, JSON.stringify(db, null, 2));
}

function isPosted(id) {
    return load().posted.includes(id);
}

function markPosted(id) {
    const db = load();
    if (!db.posted.includes(id)) {
        db.posted.push(id);
        if (db.posted.length > 500) db.posted = db.posted.slice(-500);
        save(db);
    }
}

/**
 * IMPORTANT: on the very first run there is no history yet, so instead of
 * blasting the newsletter with every single existing article, we just
 * "seed" the store with whatever is currently live. From then on, only
 * genuinely NEW articles get sent.
 */
function seedIfEmpty(posts) {
    const db = load();
    if (db.posted.length === 0 && posts.length) {
        db.posted = posts.map((p) => p.id);
        save(db);
        return true; 
    }
    return false;
}

module.exports = { isPosted, markPosted, seedIfEmpty };
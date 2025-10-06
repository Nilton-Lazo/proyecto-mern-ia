// Mock simple de “base de datos”
const db = [
    { id: 1, name: 'Daniel' },
    { id: 2, name: 'María' }
];

async function getAll() {
    return db;
}

async function getById(id) {
    return db.find(u => u.id === Number(id));
}

module.exports = { getAll, getById };

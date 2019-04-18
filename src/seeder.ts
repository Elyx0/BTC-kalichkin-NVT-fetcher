/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
require('dotenv').config();

import sqlite3 from 'sqlite3';
import path from 'path';

console.log('Started seed',new Date());


const run = (db: sqlite3.Database) => {
    db.serialize(function () {
        db.run('CREATE TABLE IF NOT EXISTS history (nvtvalue TEXT, time TEXT)');
        db.run('CREATE TABLE IF NOT EXISTS notifications (nvtvalue TEXT, time TEXT)');
        db.run('CREATE TABLE IF NOT EXISTS queries (currency TEXT, condition TEXT, value TEXT, active INTEGER)');
        db.run('INSERT INTO queries VALUES("nvt","above",26,1)');
        console.log('Ended seed');
    });
};

const dbPath = path.join(__dirname,'..','database.db');
let db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
    console.log('Connected to the database.');
    run(db);
});


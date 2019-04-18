/* eslint-disable brace-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
require('dotenv').config({path: __dirname + '/../.env'});

import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import mailer from './mailer';
import ocr from './ocr';


import headlessScreenshot from './browser';

// Shorthand utility to declare the errors by email
const mailError = (err: any) => {
    if (!err) {
        return console.error('Cannot send empty error');
    }
    let text = '';
    if (err.message) {text += err.message + '\n';}
    if (err.stack) {
        text += err.stack;
    }
    return mailer({
        type: 'error',
        subject: 'NVT Watcher Error',
        text: err
    });
};

// Mail on unhandled exception
process.on('unhandledRejection', (reason, promise) => {
    console.error(reason,promise);
});

// For each queries run the scraper + ocr in serial
const runScraper = async (db: any, queries: any) => {
    const imgPath: string = path.join(__dirname,'..','screenshot.png');
    for (let query of queries) {
        console.log('Task',query);
        try {
            fs.unlinkSync(imgPath);
        } catch (e) {
            console.log(e);
        }

        // Get the screenhot
        const url = 'https://coinmetrics.io/charts/#assets=btc_left=NVT.true_zoom=1550793600000,1553385600000';
        await headlessScreenshot(url);

        const imageData = fs.readFileSync(imgPath);
        // Make it twice the size
        const image2x = await sharp(imageData).resize(200*2).toBuffer();
        console.log('Buffer',image2x.length);

        // Run OCR
        const result = await ocr(image2x);
        const {text, confidence} = result;

        const parsedText = text.split('\n');
        const date: string = parsedText[0].slice(0,-1);
        const value: string = parsedText[1];
        const match = value.match(/(?!\s)([\s\d]+)/);

        if (match) {
            // Get the number and sometimes ocr mixes spaces and dots
            const finalValue: string = (match[0] || '').replace(' ','.');
            console.log('Will store:',{
                value: finalValue,
                date,
                confidence
            });

            // Store result
            db.serialize(function () {
                var stmt = db.prepare('INSERT INTO history VALUES (?,?)');
                stmt.run(finalValue,date);
                stmt.finalize();
                console.log('Ended insert');
            });
        } else {
            console.error('Unable to match screenshot');
            return mailError({message: 'Unable to match' + text});
        }


        console.log('End',query);
        return true;
    }
    return true;
};

// Tries closing the db and mails eventual errors
const closeDb = async (db: any) => {

    // Wait for eventual slow transactions
    await new Promise(res => setTimeout(res,2000));
    db.close(async (err: { message: any }) => {
        if (err) {
            console.error(err.message);
            await mailError(err);
        }
        console.log('Closed the database connection.');
    });
    console.log('Ended run',new Date());
    process.exit(0);
};

// Gets the database queries and runs the scraper + ocr against them
const run = async (db: sqlite3.Database) => {
    db.serialize(function () {
        const queries: any[] = [];
        db.each('SELECT rowid AS id, currency, condition, value FROM queries where active=1', function (err, row) {
            if (err) {
                mailError(err);
                process.exit(0);
            }
            const {id, currency, condition, value} = row;
            console.log({id, currency, condition, value});
            queries.push(row);
        },() => runScraper(db,queries).then(() => closeDb(db)));
    });

};

console.log('Started run',new Date());
const dbPath = path.join(__dirname,'..','database.db');

// Initialize db connection then calls run()
let db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error(err.message);
        await mailError(err);
        process.exit(1);
    }
    console.log('Connected to the database.');
    run(db);
});



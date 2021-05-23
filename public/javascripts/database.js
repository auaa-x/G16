import * as idb from './idb/index.js';

let db;

const CHAT_DB_NAME= 'db_chat';
const CHAT_STORE_NAME= 'store_chat';

async function initDatabase(){
    if (!db) {
        db =await idb.openDB(CHAT_DB_NAME, 2, {
            upgrade(upgradeDB, oldVersion, newVersion) {
                if (!upgradeDB.objectStoreNames.contains(CHAT_STORE_NAME)) {
                    let chatDB = upgradeDB.createObjectStore(CHAT_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    chatDB.createIndex('roomNo', 'roomNo', {
                        unique: false
                    });
                    chatDB.createIndex('chat', 'chat', {
                        unique: false
                    });
                    chatDB.createIndex('image', 'image', {
                        unique: false
                    });
                    chatDB.createIndex('annotations', 'annotations', {
                        unique: false
                    });

                }
            }
        });
        console.log('db created');
    }
}

window.initDatabase= initDatabase();

async function storeCachedData(data) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(CHAT_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            await store.put(data)
            await tx.complete;
            console.log('added item to the store! '+ JSON.stringify(data));
        }catch(error){
            console.log(error)
        };
    }
    else localStorage.setItem(data, JSON.stringify(data));
}
window.storeCachedData= storeCachedData;

async function getCachedData(roomNo) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            console.log('fetching: ' + roomNo);
            let tx = await db.transaction(CHAT_STORE_NAME, 'readonly');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            let index = await store.index('roomNo');
            let readingsList = await index.getAll(IDBKeyRange.only(roomNo));
            await tx.complete;
            let finalResults=[];
            if (readingsList && readingsList.length > 0) {
                for (let elem of readingsList)
                    finalResults.push(elem);
                console.log(finalResults);
                return finalResults;
            } else {
                const value = localStorage.getItem(roomNo);
                if (value == null)
                    return finalResults;
                else finalResults.push(value);
                console.log(finalResults);
                return finalResults;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(roomNo);
        let finalResults=[];
        if (value == null)
            return finalResults;
        else finalResults.push(value);
        console.log(finalResults);
        return finalResults;
    }
}
window.getCachedData= getCachedData;
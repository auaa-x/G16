import * as idb from '../idb/index.js';

let db;

const CHAT_DB_NAME= 'db_chat_1';
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
                    chatDB.createIndex('room', 'room', {
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

async function storeChatData(data) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            let tx = await db.transaction(CHAT_STORE_NAME, 'readwrite');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            let obj = await checkDB('image', data.room, data.image, store);

            if (obj){
                store.delete(obj.id);
                let annotations = obj.annotations;
                let chat = obj.chat;
            }

        }catch(error){
            console.log(error)
            localStorage.setItem(data.image + "-" + data.room, JSON.stringify(data));
        }
    }
    else localStorage.setItem(data.image + "-"+data.room, JSON.stringify(data));
}
window.storeChatData= storeChatData;

async function checkDB(name, room, image, store) {
    if (!db)
        await initDatabase();
    if (db) {
        try{
            let index = await store.index(name);
            let readingsList = await index.getAll();

            for (let elem of readingsList) {
                if (elem.image === image && elem.room === room){
                    return(elem);
                }
            }
            return false;


        } catch(error) {
            console.log(error);
        };
    }

}
window.checkDB= checkDB;
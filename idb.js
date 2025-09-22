// Simple IndexedDB wrapper for EduQuest
(function(){
    const DB_NAME = 'eduquest-db';
    const DB_VERSION = 1;
    const STORE_NAMES = {
        materials: 'materials',
        activity: 'activity',
        sessions: 'sessions',
        attempts: 'attempts',
        badges: 'badges',
        goals: 'goals'
    };

    let dbPromise;

    function openDb() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (event) => {
                const db = req.result;
                if (!db.objectStoreNames.contains(STORE_NAMES.materials)) {
                    db.createObjectStore(STORE_NAMES.materials, { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains(STORE_NAMES.activity)) {
                    const store = db.createObjectStore(STORE_NAMES.activity, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('ts', 'ts');
                }
                if (!db.objectStoreNames.contains(STORE_NAMES.sessions)) {
                    const store = db.createObjectStore(STORE_NAMES.sessions, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('ts', 'ts');
                    store.createIndex('subject', 'subject');
                }
                if (!db.objectStoreNames.contains(STORE_NAMES.attempts)) {
                    db.createObjectStore(STORE_NAMES.attempts, { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains(STORE_NAMES.badges)) {
                    db.createObjectStore(STORE_NAMES.badges, { keyPath: 'name' });
                }
                if (!db.objectStoreNames.contains(STORE_NAMES.goals)) {
                    db.createObjectStore(STORE_NAMES.goals, { keyPath: 'date' });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
        return dbPromise;
    }

    async function tx(storeName, mode, fn) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const t = db.transaction(storeName, mode);
            const store = t.objectStore(storeName);
            const result = fn(store);
            t.oncomplete = () => resolve(result);
            t.onerror = () => reject(t.error);
            t.onabort = () => reject(t.error);
        });
    }

    async function add(store, value) {
        return tx(store, 'readwrite', s => s.add(value));
    }
    async function put(store, value) {
        return tx(store, 'readwrite', s => s.put(value));
    }
    async function getAll(store, query, directionDesc=false, limit=0) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const t = db.transaction(store, 'readonly');
            const s = t.objectStore(store);
            let request = s.openCursor(null, directionDesc ? 'prev' : 'next');
            const items = [];
            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor && (!limit || items.length < limit)) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(items);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async function whereIndex(store, indexName, range, direction='prev', limit=0) {
        const db = await openDb();
        return new Promise((resolve, reject) => {
            const t = db.transaction(store, 'readonly');
            const s = t.objectStore(store).index(indexName);
            const items = [];
            const req = s.openCursor(range, direction);
            req.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor && (!limit || items.length < limit)) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(items);
                }
            };
            req.onerror = () => reject(req.error);
        });
    }

    window.EQDB = {
        STORE_NAMES,
        add,
        put,
        getAll,
        whereIndex
    };
})();



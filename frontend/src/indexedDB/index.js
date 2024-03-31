import Dexie from 'dexie';

const db = new Dexie('Route Planner');
db.version(1).stores({
    coordinates: 'address,latLong'});

export default db;

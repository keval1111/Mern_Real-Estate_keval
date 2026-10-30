const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for raw unit migration...');

    const col = mongoose.connection.collection('properties');
    
    // Find documents without totalUnits in raw mongo
    const rawList = await col.find({}).toArray();
    console.log(`Found ${rawList.length} properties in raw collection.`);

    let updatedCount = 0;
    for (const doc of rawList) {
      const updates = {};
      
      // If totalUnits missing or undefined in raw document
      if (doc.totalUnits === undefined || doc.totalUnits === null) {
        updates.totalUnits = 2;
      }
      
      // If availableUnits missing or undefined in raw document
      if (doc.availableUnits === undefined || doc.availableUnits === null) {
        const total = updates.totalUnits !== undefined ? updates.totalUnits : (doc.totalUnits || 2);
        updates.availableUnits = doc.status === 'Sold' ? 0 : total;
      }

      if (Object.keys(updates).length > 0) {
        await col.updateOne({ _id: doc._id }, { $set: updates });
        updatedCount++;
        console.log(`Updated raw "${doc.title}":`, updates);
      }
    }

    console.log(`Migration complete! Updated ${updatedCount} properties with totalUnits and availableUnits.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

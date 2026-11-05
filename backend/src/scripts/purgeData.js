import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function purgeDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/connect_invest';
  console.log(`Connecting to ${uri}...`);
  const conn = await mongoose.connect(uri);
  const db = conn.connection.db;

  // Purge all non-admin users
  const userDelete = await db.collection('users').deleteMany({ role: { $ne: 'admin' } });
  console.log(`Purged non-admin users: ${userDelete.deletedCount}`);

  // Check if admin user exists, if not create
  let admin = await db.collection('users').findOne({ role: 'admin' });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
    await db.collection('users').insertOne({
      name: 'System Administrator',
      email: 'admin@connectinvest.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created root admin user: admin@connectinvest.com / AdminPassword123!');
  } else {
    console.log(`Root admin exists: ${admin.email}`);
  }

  const collectionsToClear = [
    'companydocuments', 'batches', 'kycs', 'investmentoffers',
    'financialreports', 'repayments', 'notifications', 'offers',
    'payouts', 'dividends', 'shareallocations', 'releases',
    'queries', 'ledgers', 'transactions', 'investments',
    'subscriptions', 'investmentrequests', 'auditlogs',
    'investorprofiles', 'offerterms', 'holds', 'payments',
    'shareholders', 'companies'
  ];

  for (const name of collectionsToClear) {
    try {
      const res = await db.collection(name).deleteMany({});
      console.log(`Purged ${name}: ${res.deletedCount} documents removed.`);
    } catch (err) {
      console.warn(`Could not clear ${name}: ${err.message}`);
    }
  }

  console.log('\n--- VERIFICATION OF REMAINING DATA ---');
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`${c.name}: ${count}`);
  }

  await mongoose.disconnect();
  console.log('Database successfully cleaned to virgin state!');
  process.exit(0);
}

purgeDatabase().catch((err) => {
  console.error('Fatal error during purge:', err);
  process.exit(1);
});


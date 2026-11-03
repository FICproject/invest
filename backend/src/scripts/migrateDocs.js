import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

async function migrate() {
  console.log('Connecting to database via connectDB...');
  await connectDB();

  const db = mongoose.connection.db;

  // 1. Update Companies
  const companies = await db.collection('companies').find({}).toArray();
  console.log(`Found ${companies.length} companies to check...`);

  for (const c of companies) {
    const update = {};
    const docs = c.documents || {};

    const incorporation = docs.incorporationCertificateUrl || '/uploads/sample-incorporation.pdf';
    const pan = docs.panCardUrl || '/uploads/sample-company-pan.png';
    const gst = docs.gstCertificateUrl || '/uploads/sample-gst.pdf';
    const moa = docs.moaAoaUrl || '/uploads/sample-moa.pdf';
    const shareholding = docs.shareholdingPatternUrl || '/uploads/sample-shareholding.pdf';
    const financials = docs.financialStatementsUrl || '/uploads/sample-financials.pdf';
    const cheque = c.bankDetails?.chequeUrl || '/uploads/sample-cheque.png';

    update['documents.incorporationCertificateUrl'] = incorporation.startsWith('http') || incorporation.startsWith('/uploads/') ? incorporation : `/uploads/${incorporation}`;
    update['documents.panCardUrl'] = pan.startsWith('http') || pan.startsWith('/uploads/') ? pan : `/uploads/${pan}`;
    update['documents.gstCertificateUrl'] = gst.startsWith('http') || gst.startsWith('/uploads/') ? gst : `/uploads/${gst}`;
    update['documents.moaAoaUrl'] = moa.startsWith('http') || moa.startsWith('/uploads/') ? moa : `/uploads/${moa}`;
    update['documents.shareholdingPatternUrl'] = shareholding.startsWith('http') || shareholding.startsWith('/uploads/') ? shareholding : `/uploads/${shareholding}`;
    update['documents.financialStatementsUrl'] = financials.startsWith('http') || financials.startsWith('/uploads/') ? financials : `/uploads/${financials}`;
    update['bankDetails.chequeUrl'] = cheque.startsWith('http') || cheque.startsWith('/uploads/') ? cheque : `/uploads/${cheque}`;

    await db.collection('companies').updateOne({ _id: c._id }, { $set: update });
    console.log(`  Updated company: ${c.legalName || c.name}`);
  }

  // 2. Update Investor Profiles
  const profiles = await db.collection('investorprofiles').find({}).toArray();
  console.log(`Found ${profiles.length} investor profiles to check...`);

  for (const p of profiles) {
    const panUrl = p.panCardUrl || '/uploads/sample-pan.png';
    const idUrl = p.identityProofUrl || '/uploads/sample-aadhaar.png';
    const chequeUrl = p.cancelledChequeUrl || p.bankDetails?.chequeUrl || '/uploads/sample-cheque.png';

    const update = {
      panCardUrl: panUrl.startsWith('http') || panUrl.startsWith('/uploads/') ? panUrl : `/uploads/${panUrl}`,
      identityProofUrl: idUrl.startsWith('http') || idUrl.startsWith('/uploads/') ? idUrl : `/uploads/${idUrl}`,
      cancelledChequeUrl: chequeUrl.startsWith('http') || chequeUrl.startsWith('/uploads/') ? chequeUrl : `/uploads/${chequeUrl}`,
      'bankDetails.chequeUrl': chequeUrl.startsWith('http') || chequeUrl.startsWith('/uploads/') ? chequeUrl : `/uploads/${chequeUrl}`
    };

    await db.collection('investorprofiles').updateOne({ _id: p._id }, { $set: update });
    console.log(`  Updated investor profile: ${p._id}`);
  }

  // 3. Update KYC records
  const kycs = await db.collection('kycs').find({}).toArray();
  console.log(`Found ${kycs.length} KYC records to check...`);

  for (const k of kycs) {
    const panUrl = k.panDocumentUrl || '/uploads/sample-pan.png';
    const addrUrl = k.addressProofUrl || '/uploads/sample-aadhaar.png';
    const bankUrl = k.bankProofUrl || '/uploads/sample-cheque.png';
    const selfieUrl = k.selfieUrl || '/uploads/logo.jpg.jpeg';

    const update = {
      panDocumentUrl: panUrl.startsWith('http') || panUrl.startsWith('/uploads/') ? panUrl : `/uploads/${panUrl}`,
      addressProofUrl: addrUrl.startsWith('http') || addrUrl.startsWith('/uploads/') ? addrUrl : `/uploads/${addrUrl}`,
      bankProofUrl: bankUrl.startsWith('http') || bankUrl.startsWith('/uploads/') ? bankUrl : `/uploads/${bankUrl}`,
      selfieUrl: selfieUrl.startsWith('http') || selfieUrl.startsWith('/uploads/') ? selfieUrl : `/uploads/${selfieUrl}`
    };

    await db.collection('kycs').updateOne({ _id: k._id }, { $set: update });
    console.log(`  Updated KYC record: ${k._id}`);
  }

  console.log('Migration completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

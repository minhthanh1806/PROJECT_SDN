const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yugioh_db';

async function importDirect() {
  console.log('==============================================');
  console.log('BẮT ĐẦU NẠP THẲNG DỮ LIỆU VÀO MONGODB...');
  console.log('MongoDB URI:', MONGO_URI);
  console.log('==============================================');

  await mongoose.connect(MONGO_URI);
  console.log('[OK] Đã kết nối thành công tới MongoDB Database: yugioh_db');

  const db = mongoose.connection.db;
  const backupDir = path.join(__dirname, '../data/mongo_backup');

  // 1. Nạp Cards
  const cardsFile = path.join(backupDir, 'cards.json');
  if (fs.existsSync(cardsFile)) {
    console.log('\n[1/3] Đang nạp collection "cards"...');
    const rawCards = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
    
    // Xóa collection cards cũ
    await db.collection('cards').deleteMany({});
    
    // Format lại _id thành ObjectId nếu là string
    const formattedCards = rawCards.map(c => {
      const copy = { ...c };
      if (copy._id && typeof copy._id === 'string' && copy._id.match(/^[0-9a-fA-F]{24}$/)) {
        copy._id = new mongoose.Types.ObjectId(copy._id);
      } else if (copy._id && copy._id.$oid) {
        copy._id = new mongoose.Types.ObjectId(copy._id.$oid);
      }
      return copy;
    });

    const resCards = await db.collection('cards').insertMany(formattedCards);
    console.log(`=> THÀNH CÔNG: Đã nạp thẳng ${resCards.insertedCount} lá bài Meta vào MongoDB!`);
  } else {
    console.warn('[!] Không tìm thấy file cards.json');
  }

  // 2. Nạp Decks
  const decksFile = path.join(backupDir, 'decks.json');
  if (fs.existsSync(decksFile)) {
    console.log('\n[2/3] Đang nạp collection "decks"...');
    const rawDecks = JSON.parse(fs.readFileSync(decksFile, 'utf8'));
    
    await db.collection('decks').deleteMany({});
    
    const formattedDecks = rawDecks.map(d => {
      const copy = { ...d };
      if (copy._id && typeof copy._id === 'string' && copy._id.match(/^[0-9a-fA-F]{24}$/)) {
        copy._id = new mongoose.Types.ObjectId(copy._id);
      } else if (copy._id && copy._id.$oid) {
        copy._id = new mongoose.Types.ObjectId(copy._id.$oid);
      }
      return copy;
    });

    const resDecks = await db.collection('decks').insertMany(formattedDecks);
    console.log(`=> THÀNH CÔNG: Đã nạp thẳng ${resDecks.insertedCount} bộ bài vào MongoDB!`);
  } else {
    console.warn('[!] Không tìm thấy file decks.json');
  }

  // 3. Nạp Users
  const usersFile = path.join(backupDir, 'users.json');
  if (fs.existsSync(usersFile)) {
    console.log('\n[3/3] Đang nạp collection "users"...');
    const rawUsers = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    
    await db.collection('users').deleteMany({});
    
    const formattedUsers = rawUsers.map(u => {
      const copy = { ...u };
      if (copy._id && typeof copy._id === 'string' && copy._id.match(/^[0-9a-fA-F]{24}$/)) {
        copy._id = new mongoose.Types.ObjectId(copy._id);
      } else if (copy._id && copy._id.$oid) {
        copy._id = new mongoose.Types.ObjectId(copy._id.$oid);
      }
      return copy;
    });

    const resUsers = await db.collection('users').insertMany(formattedUsers);
    console.log(`=> THÀNH CÔNG: Đã nạp thẳng ${resUsers.insertedCount} tài khoản người dùng vào MongoDB!`);
  } else {
    console.warn('[!] Không tìm thấy file users.json');
  }

  // Tạo index cho các collection
  console.log('\n[Index] Đang tối ưu hóa các Index tìm kiếm...');
  try {
    await db.collection('cards').createIndex({ name: 'text', archetype: 'text' });
    await db.collection('cards').createIndex({ id: 1 }, { unique: true });
    await db.collection('decks').createIndex({ slug: 1 });
    await db.collection('users').createIndex({ username: 1 });
    await db.collection('users').createIndex({ email: 1 });
  } catch (e) {
    // Indexes might already exist
  }

  // Kiểm tra tổng kết
  console.log('\n==============================================');
  console.log('KIỂM TRA TỔNG KẾT DỮ LIỆU TRONG MONGODB:');
  const countCards = await db.collection('cards').countDocuments();
  const countDecks = await db.collection('decks').countDocuments();
  const countUsers = await db.collection('users').countDocuments();

  console.log(`- cards collection : ${countCards} bản ghi`);
  console.log(`- decks collection : ${countDecks} bản ghi`);
  console.log(`- users collection : ${countUsers} bản ghi`);

  const sampleCard = await db.collection('cards').findOne({ id: 13332685 });
  console.log(`- Thần kiếm Mitsurugi mẫu: ${sampleCard?.name} (ID: ${sampleCard?.id}, Image: ${sampleCard?.card_images?.[0]?.image_url})`);

  const sampleDeck = await db.collection('decks').findOne({ slug: 'k9-mitsurugi-ritual-control' });
  console.log(`- Bộ bài Meta mẫu: ${sampleDeck?.name} (Main: ${sampleDeck?.stats?.main_count} lá, Giá: $${sampleDeck?.stats?.total_price})`);

  console.log('==============================================');
  console.log('HOÀN TẤT NẠP TOÀN BỘ DỮ LIỆU VÀO MONGODB 100%!');
  console.log('==============================================');

  await mongoose.disconnect();
}

importDirect().catch(err => {
  console.error('Lỗi khi nạp dữ liệu:', err);
  process.exit(1);
});

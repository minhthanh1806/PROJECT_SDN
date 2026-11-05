const mongoose = require('mongoose');
const Card = require('../models/Card');

async function checkBanInfo() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yugioh_db');
  const tcgBanned = await Card.countDocuments({ 'banlist_info.ban_tcg': { $in: ['Forbidden', 'Limited', 'Semi-Limited'] } });
  const ocgBanned = await Card.countDocuments({ 'banlist_info.ban_ocg': { $in: ['Forbidden', 'Limited', 'Semi-Limited'] } });
  const goatBanned = await Card.countDocuments({ 'banlist_info.ban_goat': { $in: ['Forbidden', 'Limited', 'Semi-Limited'] } });
  
  console.log('TCG Banned:', tcgBanned);
  console.log('OCG Banned:', ocgBanned);
  console.log('GOAT Banned:', goatBanned);

  const sampleCard = await Card.findOne({ 'banlist_info.ban_ocg': { $exists: true } }).select('name banlist_info').lean();
  console.log('Sample Card with OCG:', sampleCard);
  process.exit(0);
}

checkBanInfo();

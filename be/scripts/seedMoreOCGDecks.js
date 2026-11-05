const mongoose = require('mongoose');
const Card = require('../models/Card');
const Deck = require('../models/Deck');

async function seedMoreOCGDecks() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yugioh_db');
  console.log('[Seed OCG] Bắt đầu thêm các bộ bài OCG thi đấu đỉnh cao...');

  const ocgDecks = [
    // 1. OCG: Ryzeal XYZ Combo (OCG 2026 Tier 1)
    {
      name: 'Ryzeal Rank 4 XYZ Turbo (OCG 2026)',
      category: 'Top Archetype',
      format: 'OCG',
      archetype: 'Ryzeal',
      author: 'NextPlay OCG',
      tournament: 'OCG Asia Championship 1st Place',
      description: 'Chiến thuật Ryzeal thống trị meta OCG hiện nay với khả năng swarm Rank 4 Xyz vô tiền khoáng hậu và Detach quái thú để ngắt mọi combo đối phương.',
      is_featured: true,
      coverCardName: 'Ash Blossom & Joyous Spring',
      mainQueries: [
        { name: 'Maxx \"C\"', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Effect Veiler', qty: 3 },
        { name: 'Ghost Mourner & Moonlit Chill', qty: 2 },
        { name: 'Droll & Lock Bird', qty: 2 },
        { name: 'Nibiru, the Primal Being', qty: 2 },
        { name: 'Called by the Grave', qty: 2 },
        { name: 'Crossout Designator', qty: 1 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Bonfire', qty: 3 },
        { name: 'Triple Tactics Talent', qty: 2 },
        { name: 'Triple Tactics Thrust', qty: 2 },
        { name: 'Pot of Prosperity', qty: 1 },
        { name: 'Forbidden Droplet', qty: 2 },
        { name: 'S:P Little Knight', qty: 1 },
        { name: 'Super Polymerization', qty: 2 },
        { name: 'Solemn Strike', qty: 3 },
        { name: 'Evenly Matched', qty: 3 }
      ],
      extraQueries: [
        { name: 'Divine Arsenal AA-ZEUS - Sky Thunder', qty: 1 },
        { name: 'Time Thief Redoer', qty: 1 },
        { name: 'Abyss Dweller', qty: 1 },
        { name: 'Super Starslayer TY-PHON - Sky Crisis', qty: 1 },
        { name: 'S:P Little Knight', qty: 2 },
        { name: 'Knightmare Phoenix', qty: 1 },
        { name: 'Accesscode Talker', qty: 1 },
        { name: 'Garura, Wings of Resonant Life', qty: 1 },
        { name: 'Mudragon of the Swamp', qty: 1 },
        { name: 'Downerd Magician', qty: 1 },
        { name: 'Underworld Goddess of the Closed World', qty: 1 },
        { name: 'I:P Masquerena', qty: 1 },
        { name: 'Relinquished Anima', qty: 1 },
        { name: 'Baronne de Fleur', qty: 1 }
      ],
      sideQueries: [
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Solemn Judgment', qty: 3 },
        { name: 'Ghost Belle & Haunted Mansion', qty: 3 },
        { name: 'Red Reboot', qty: 3 }
      ]
    },

    // 2. OCG: Tenpai Dragon Going 2nd OCG (Banlist OCG Format)
    {
      name: 'Tenpai Dragon Battle OTK (OCG)',
      category: 'Top Archetype',
      format: 'OCG',
      archetype: 'Tenpai Dragon',
      author: 'Tokyo YGO Duelist',
      tournament: 'YOT Singapore Top 4',
      description: 'Tenpai Dragon phiên bản OCG tận dụng 3 Maxx "C" và Sangen Kaimen để vượt qua mọi hàng thủ của đối phương và dứt điểm trong 1 lượt.',
      is_featured: false,
      coverCardName: 'Trident Dragion',
      mainQueries: [
        { name: 'Tenpai Dragon Chundra', qty: 3 },
        { name: 'Tenpai Dragon Paidra', qty: 3 },
        { name: 'Tenpai Dragon Fadra', qty: 3 },
        { name: 'Maxx \"C\"', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Ghost Ogre & Snow Rabbit', qty: 2 },
        { name: 'Droll & Lock Bird', qty: 2 },
        { name: 'Nibiru, the Primal Being', qty: 2 },
        { name: 'Sangen Kaimen', qty: 3 },
        { name: 'Sangen Summoning', qty: 1 },
        { name: 'Called by the Grave', qty: 2 },
        { name: 'Crossout Designator', qty: 1 },
        { name: 'Dark Ruler No More', qty: 3 },
        { name: 'Forbidden Droplet', qty: 3 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Red Reboot', qty: 3 }
      ],
      extraQueries: [
        { name: 'Trident Dragion', qty: 1 },
        { name: 'Bystial Dis Pater', qty: 1 },
        { name: 'Baronne de Fleur', qty: 1 },
        { name: 'Black Rose Moonlight Dragon', qty: 1 },
        { name: 'Ancient Fairy Dragon', qty: 1 },
        { name: 'Kuibelt the Blade Dragon', qty: 1 },
        { name: 'S:P Little Knight', qty: 2 },
        { name: 'Hiita the Fire Charmer, Ablaze', qty: 2 },
        { name: 'Promethean Princess, Bestower of Flames', qty: 2 },
        { name: 'Knightmare Phoenix', qty: 1 },
        { name: 'Accesscode Talker', qty: 1 },
        { name: 'Relinquished Anima', qty: 1 }
      ],
      sideQueries: [
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Solemn Judgment', qty: 3 },
        { name: 'Twin Twisters', qty: 3 }
      ]
    }
  ];

  for (const tpl of ocgDecks) {
    async function resolveCards(queries) {
      const result = [];
      for (const q of queries) {
        let card = await Card.findOne({ name: q.name }).lean();
        if (!card) {
          card = await Card.findOne({
            name: { $regex: new RegExp(`^${q.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') }
          }).lean();
        }
        if (card) {
          result.push({
            card_id: card.id,
            name: card.name,
            quantity: q.qty || 1,
            card_type: card.type || 'Normal Monster',
            image_url: card.card_images?.[0]?.image_url || `https://images.ygoprodeck.com/images/cards/${card.id}.jpg`,
            image_url_small: card.card_images?.[0]?.image_url_small || `https://images.ygoprodeck.com/images/cards_small/${card.id}.jpg`,
            price: Number(card.min_price || 0)
          });
        }
      }
      return result;
    }

    const mainCards = await resolveCards(tpl.mainQueries);
    const extraCards = await resolveCards(tpl.extraQueries);
    const sideCards = await resolveCards(tpl.sideQueries);

    let mainCount = 0;
    let monsterCount = 0;
    let spellCount = 0;
    let trapCount = 0;
    let totalPrice = 0;

    for (const c of mainCards) {
      mainCount += c.quantity;
      totalPrice += c.price * c.quantity;
      const typeLower = (c.card_type || '').toLowerCase();
      if (typeLower.includes('spell')) spellCount += c.quantity;
      else if (typeLower.includes('trap')) trapCount += c.quantity;
      else monsterCount += c.quantity;
    }

    let extraCount = 0;
    for (const c of extraCards) {
      extraCount += c.quantity;
      totalPrice += c.price * c.quantity;
    }

    let sideCount = 0;
    for (const c of sideCards) {
      sideCount += c.quantity;
      totalPrice += c.price * c.quantity;
    }

    let coverCard = await Card.findOne({ name: tpl.coverCardName }).lean();
    if (!coverCard && mainCards.length > 0) {
      coverCard = await Card.findOne({ id: mainCards[0].card_id }).lean();
    }

    const newDeck = new Deck({
      name: tpl.name,
      slug: tpl.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: tpl.description,
      category: tpl.category,
      format: tpl.format,
      archetype: tpl.archetype,
      author: tpl.author,
      tournament: tpl.tournament,
      cover_card_id: coverCard ? coverCard.id : mainCards[0]?.card_id,
      cover_card_name: coverCard ? coverCard.name : mainCards[0]?.name,
      cover_image_url: coverCard?.card_images?.[0]?.image_url || mainCards[0]?.image_url,
      main_deck: mainCards,
      extra_deck: extraCards,
      side_deck: sideCards,
      stats: {
        main_count: mainCount,
        extra_count: extraCount,
        side_count: sideCount,
        monster_count: monsterCount,
        spell_count: spellCount,
        trap_count: trapCount,
        total_price: Number(totalPrice.toFixed(2))
      },
      views: Math.floor(Math.random() * 800) + 300,
      likes: Math.floor(Math.random() * 80) + 30,
      is_featured: tpl.is_featured
    });

    await newDeck.save();
    console.log(`[Seed OK] Đã thêm: "${tpl.name}" | Format: ${tpl.format} (Main: ${mainCount}, Extra: ${extraCount}, Side: ${sideCount})`);
  }

  console.log('[Seed Done] Hoàn tất nạp thêm bộ bài OCG!');
  process.exit(0);
}

seedMoreOCGDecks().catch(err => {
  console.error('[Seed Error]', err);
  process.exit(1);
});

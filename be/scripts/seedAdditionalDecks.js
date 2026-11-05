const mongoose = require('mongoose');
const Card = require('../models/Card');
const Deck = require('../models/Deck');

async function seedAdditionalDecks() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yugioh_db');
  console.log('[Seed Extra] Bắt đầu thêm các bộ bài cho các mục còn thiếu (GOAT, Edison, OCG, Budget, Anime)...');

  const extraDecks = [
    // 1. FORMAT: GOAT (2005) - GOAT Control (Category: Tournament Meta / Nostalgia)
    {
      name: 'GOAT Format Control (Classic 2005)',
      category: 'Tournament Meta',
      format: 'GOAT',
      archetype: 'GOAT Control',
      author: 'Kris Perovic',
      tournament: 'SJC Seattle 2005 Champion',
      description: 'Bộ bài huyền thoại của kỷ nguyên 2005: kiểm soát nhịp độ bằng Scapegoat, Metamorphosis thành Thousand-Eyes Restrict và sức mạnh tối thượng của Black Luster Soldier.',
      is_featured: true,
      coverCardName: 'Black Luster Soldier - Envoy of the Beginning',
      mainQueries: [
        { name: 'Black Luster Soldier - Envoy of the Beginning', qty: 1 },
        { name: 'Jinzo', qty: 1 },
        { name: 'Airknight Parshath', qty: 1 },
        { name: 'Breaker the Magical Warrior', qty: 1 },
        { name: 'Tribe-Infecting Virus', qty: 1 },
        { name: 'Sinister Serpent', qty: 1 },
        { name: 'Magician of Faith', qty: 2 },
        { name: 'D.D. Warrior Lady', qty: 1 },
        { name: 'Sangan', qty: 1 },
        { name: 'Tsukuyomi', qty: 1 },
        { name: 'Blade Knight', qty: 1 },
        { name: 'Kycoo the Ghost Destroyer', qty: 1 },
        { name: 'Pot of Greed', qty: 1 },
        { name: 'Graceful Charity', qty: 1 },
        { name: 'Delinquent Duo', qty: 1 },
        { name: 'Snatch Steal', qty: 1 },
        { name: 'Premature Burial', qty: 1 },
        { name: 'Heavy Storm', qty: 1 },
        { name: 'Mystical Space Typhoon', qty: 1 },
        { name: 'Nobleknight of Crossout', qty: 2 },
        { name: 'Scapegoat', qty: 2 },
        { name: 'Metamorphosis', qty: 2 },
        { name: 'Book of Moon', qty: 3 },
        { name: 'Swords of Revealing Light', qty: 1 },
        { name: 'Creature Swap', qty: 1 },
        { name: 'Ring of Destruction', qty: 1 },
        { name: 'Mirror Force', qty: 1 },
        { name: 'Torrential Tribute', qty: 1 },
        { name: 'Call of the Haunted', qty: 1 },
        { name: 'Dust Tornado', qty: 2 },
        { name: 'Compulsory Evacuation Device', qty: 1 }
      ],
      extraQueries: [
        { name: 'Thousand-Eyes Restrict', qty: 3 },
        { name: 'Dark Balter the Terrible', qty: 2 },
        { name: 'Ryu Senshi', qty: 2 },
        { name: 'Fiend Skull Dragon', qty: 2 },
        { name: 'Giltia the D. Knight', qty: 2 },
        { name: 'Reaper on the Nightmare', qty: 2 },
        { name: 'Dark Flare Knight', qty: 1 },
        { name: 'Ojama King', qty: 1 }
      ],
      sideQueries: [
        { name: 'Mobius the Frost Monarch', qty: 2 },
        { name: 'Asura Priest', qty: 1 },
        { name: 'Mystic Swordsman LV2', qty: 2 },
        { name: 'Smashing Ground', qty: 2 },
        { name: 'Waboku', qty: 3 },
        { name: 'Bottomless Trap Hole', qty: 2 },
        { name: 'Trap Dustshoot', qty: 3 }
      ]
    },

    // 2. FORMAT: Edison (2010) - Blackwing Vayu Synchro
    {
      name: 'Blackwing Edison Synchro 2010',
      category: 'Top Archetype',
      format: 'Edison',
      archetype: 'Blackwing',
      author: 'Jeff Jones',
      tournament: 'SJC Edison 2010 Winner',
      description: 'Lối chơi Blackwing huyền thoại thống trị giải đấu SJC Edison: bão lũ chim đen Black Whirlwind, Dark Armed Dragon và Icarus Attack bắn phá đối phương.',
      is_featured: true,
      coverCardName: 'Dark Armed Dragon',
      mainQueries: [
        { name: 'Dark Armed Dragon', qty: 1 },
        { name: 'Blackwing - Sirocco the Dawn', qty: 3 },
        { name: 'Blackwing - Bora the Spear', qty: 3 },
        { name: 'Blackwing - Shura the Blue Flame', qty: 3 },
        { name: 'Blackwing - Kalut the Moon Shadow', qty: 3 },
        { name: 'Blackwing - Gale the Whirlwind', qty: 1 },
        { name: 'Blackwing - Blizzard the Far North', qty: 3 },
        { name: 'Blackwing - Vayu the Emblem of Honor', qty: 2 },
        { name: 'Gorz the Emissary of Darkness', qty: 1 },
        { name: 'Black Whirlwind', qty: 2 },
        { name: 'Allure of Darkness', qty: 2 },
        { name: 'Heavy Storm', qty: 1 },
        { name: 'Brain Control', qty: 1 },
        { name: 'Mystical Space Typhoon', qty: 1 },
        { name: 'Book of Moon', qty: 3 },
        { name: 'Icarus Attack', qty: 3 },
        { name: 'Delta Crow - Anti Reverse', qty: 1 },
        { name: 'Mirror Force', qty: 1 },
        { name: 'Torrential Tribute', qty: 1 },
        { name: 'Bottomless Trap Hole', qty: 2 },
        { name: 'Solemn Judgment', qty: 1 }
      ],
      extraQueries: [
        { name: 'Blackwing Armed Wing', qty: 3 },
        { name: 'Blackwing Armor Master', qty: 2 },
        { name: 'Blackwing - Silverwind the Ascendant', qty: 1 },
        { name: 'Brionac, Dragon of the Ice Barrier', qty: 1 },
        { name: 'Goyo Guardian', qty: 1 },
        { name: 'Stardust Dragon', qty: 2 },
        { name: 'Black Rose Dragon', qty: 1 },
        { name: 'Colossal Fighter', qty: 1 },
        { name: 'Thought Ruler Archfiend', qty: 1 },
        { name: 'Armory Arm', qty: 1 },
        { name: 'Magical Android', qty: 1 }
      ],
      sideQueries: [
        { name: 'D.D. Crow', qty: 3 },
        { name: 'Cyber Dragon', qty: 2 },
        { name: 'Chimeratech Fortress Dragon', qty: 1 },
        { name: 'Pulling the Rug', qty: 2 },
        { name: 'Royal Oppression', qty: 1 },
        { name: 'Dust Tornado', qty: 3 },
        { name: 'Dimensional Prison', qty: 3 }
      ]
    },

    // 3. FORMAT: OCG - Tearlaments Fusion Unlimited (Category: Tournament Meta / OCG)
    {
      name: 'Tearlaments OCG Mill Fusion',
      category: 'Tournament Meta',
      format: 'OCG',
      archetype: 'Tearlaments',
      author: 'NextPlay OCG',
      tournament: 'OCG Tokyo Championship Top 1',
      description: 'Deck Tearlaments OCG nổi tiếng với khả năng kích hoạt Fusion bất kể lượt ai khi bị gửi xuống Mộ, kết hợp cùng Maxx "C" và Kitkallos.',
      is_featured: false,
      coverCardName: 'Tearlaments Kitkallos',
      mainQueries: [
        { name: 'Tearlaments Scheiren', qty: 1 },
        { name: 'Tearlaments Havnis', qty: 1 },
        { name: 'Tearlaments Merrli', qty: 1 },
        { name: 'Tearlaments Kashtira', qty: 3 },
        { name: 'Tearlaments Reinoheart', qty: 3 },
        { name: 'Primeval Planet Perlereino', qty: 1 },
        { name: 'Tearlaments Sulliek', qty: 2 },
        { name: 'Tearlaments Metanoise', qty: 1 },
        { name: 'Tearlaments Cryme', qty: 1 },
        { name: 'Tearlaments Grief', qty: 2 },
        { name: 'Foolish Burial', qty: 1 },
        { name: 'Foolish Burial Goods', qty: 1 },
        { name: 'Terraforming', qty: 1 },
        { name: 'Triple Tactics Talent', qty: 2 },
        { name: 'Maxx \"C\"', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Called by the Grave', qty: 2 },
        { name: 'Crossout Designator', qty: 1 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Super Polymerization', qty: 3 },
        { name: 'Diviner of the Herald', qty: 3 }
      ],
      extraQueries: [
        { name: 'Tearlaments Kitkallos', qty: 1 },
        { name: 'Tearlaments Kaleido-Heart', qty: 1 },
        { name: 'Tearlaments Rulkallos', qty: 2 },
        { name: 'Garura, Wings of Resonant Life', qty: 1 },
        { name: 'Mudragon of the Swamp', qty: 2 },
        { name: 'Starving Venom Fusion Dragon', qty: 1 },
        { name: 'Predaplant Dragostapelia', qty: 1 },
        { name: 'Abyss Dweller', qty: 1 },
        { name: 'Time Thief Redoer', qty: 1 },
        { name: 'Divine Arsenal AA-ZEUS - Sky Thunder', qty: 1 },
        { name: 'S:P Little Knight', qty: 1 },
        { name: 'Cross-Sheep', qty: 1 },
        { name: 'Spright Elf', qty: 1 }
      ],
      sideQueries: [
        { name: 'Droll & Lock Bird', qty: 3 },
        { name: 'Ghost Belle & Haunted Mansion', qty: 3 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Red Reboot', qty: 3 }
      ]
    },

    // 4. CATEGORY: Budget Deck - Floowandereeze Birds (Siêu rẻ dưới $18)
    {
      name: 'Floowandereeze Normal Summon Wings (Budget)',
      category: 'Budget Deck',
      format: 'TCG',
      archetype: 'Floowandereeze',
      author: 'Budget Birdmaster',
      tournament: 'Locals 1st Place (Under $18)',
      description: 'Lối chơi chim Floowandereeze không bao giờ Special Summon, hoàn toàn miễn nhiễm với Maxx "C" và dùng Dimension Shifter khóa sạch meta.',
      is_featured: false,
      coverCardName: 'Floowandereeze & Empen',
      mainQueries: [
        { name: 'Floowandereeze & Robina', qty: 3 },
        { name: 'Floowandereeze & Eglen', qty: 3 },
        { name: 'Floowandereeze & Stri', qty: 2 },
        { name: 'Floowandereeze & Toccan', qty: 1 },
        { name: 'Floowandereeze & Empen', qty: 1 },
        { name: 'Floowandereeze & Snowl', qty: 1 },
        { name: 'Raiza the Mega Monarch', qty: 1 },
        { name: 'Mist Valley Apex Avian', qty: 1 },
        { name: 'Dimension Shifter', qty: 2 },
        { name: 'Floowandereeze and the Magnificent Map', qty: 1 },
        { name: 'Floowandereeze and the Advent of Adventure', qty: 3 },
        { name: 'Floowandereeze and the Unexplored Winds', qty: 1 },
        { name: 'Pot of Duality', qty: 3 },
        { name: 'Pot of Extravagance', qty: 3 },
        { name: 'Pot of Prosperity', qty: 1 },
        { name: 'Terraforming', qty: 1 },
        { name: 'Book of Moon', qty: 3 },
        { name: 'Floowandereeze and the Dreaming Town', qty: 2 },
        { name: 'Harpie\'s Feather Storm', qty: 3 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Called by the Grave', qty: 1 }
      ],
      extraQueries: [
        { name: 'Lyrilusc - Assembled Nightingale', qty: 2 },
        { name: 'Downerd Magician', qty: 2 },
        { name: 'Divine Arsenal AA-ZEUS - Sky Thunder', qty: 1 },
        { name: 'Knightmare Phoenix', qty: 2 },
        { name: 'Knightmare Cerberus', qty: 2 },
        { name: 'Relinquished Anima', qty: 2 },
        { name: 'Linkuriboh', qty: 2 },
        { name: 'S:P Little Knight', qty: 2 }
      ],
      sideQueries: [
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Solemn Judgment', qty: 3 },
        { name: 'Dark Ruler No More', qty: 3 }
      ]
    },

    // 5. CATEGORY: Anime Deck - Red-Eyes Black Dragon Inferno
    {
      name: 'Red-Eyes Black Dragon Joey Wheeler Flames',
      category: 'Anime Deck',
      format: 'TCG',
      archetype: 'Red-Eyes',
      author: 'Joey Wheeler / Katsuya Jonouchi',
      tournament: 'Battle City Nostalgia Masters',
      description: 'Bộ bài Rồng Đen Mắt Đỏ với tiềm năng vô hạn của Joey Wheeler, dung hợp thành Red-Eyes Dark Dragoon và Black Skull Dragon thiêu đốt đối thủ.',
      is_featured: false,
      coverCardName: 'Red-Eyes Black Dragon',
      mainQueries: [
        { name: 'Red-Eyes Black Dragon', qty: 3 },
        { name: 'Red-Eyes Darkness Metal Dragon', qty: 1 },
        { name: 'Red-Eyes Black Meteor Dragon', qty: 3 },
        { name: 'Black Metal Dragon', qty: 3 },
        { name: 'The Black Stone of Legend', qty: 3 },
        { name: 'Gearfried the Red-Eyes Iron Knight', qty: 2 },
        { name: 'Red-Eyes Fusion', qty: 3 },
        { name: 'Red-Eyes Insight', qty: 3 },
        { name: 'Cards of the Red Stone', qty: 2 },
        { name: 'Return of the Dragon Lords', qty: 3 },
        { name: 'Dragon Shrine', qty: 2 },
        { name: 'Polymerization', qty: 2 },
        { name: 'Red-Eyes Spirit', qty: 2 },
        { name: 'Return of the Red-Eyes', qty: 2 },
        { name: 'Red-Eyes Fang with Chain', qty: 2 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Infinite Impermanence', qty: 3 }
      ],
      extraQueries: [
        { name: 'Red-Eyes Dark Dragoon', qty: 1 },
        { name: 'Black Skull Dragon', qty: 1 },
        { name: 'Archfiend Black Skull Dragon', qty: 2 },
        { name: 'Meteor Black Comet Dragon', qty: 2 },
        { name: 'Red-Eyes Slash Dragon', qty: 2 },
        { name: 'Red-Eyes Flare Metal Dragon', qty: 2 },
        { name: 'Number 11: Big Eye', qty: 1 },
        { name: 'Hieratic Seal of the Heavenly Spheres', qty: 2 },
        { name: 'Striker Dragon', qty: 1 },
        { name: 'S:P Little Knight', qty: 1 }
      ],
      sideQueries: [
        { name: 'Twin Twisters', qty: 3 },
        { name: 'Raigeki', qty: 2 },
        { name: 'Solemn Judgment', qty: 3 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Skill Drain', qty: 1 }
      ]
    },

    // 6. CATEGORY: Master Duel / Anime - Yubel Fiend Unchained
    {
      name: 'Yubel Phantom Fiend Nightmare',
      category: 'Master Duel',
      format: 'Master Duel',
      archetype: 'Yubel',
      author: 'Jaden Yuki / Yubel',
      tournament: 'Master Duel Tier 1 Championship',
      description: 'Lối chơi Yubel tà linh cực hot phản sát thương đòn đánh của đối thủ và dung hợp thành Phantom of Yubel khóa mọi monster effect.',
      is_featured: true,
      coverCardName: 'Yubel',
      mainQueries: [
        { name: 'Yubel', qty: 2 },
        { name: 'Yubel - Terror Incarnate', qty: 1 },
        { name: 'Yubel - The Ultimate Nightmare', qty: 1 },
        { name: 'Spirit of Yubel', qty: 3 },
        { name: 'Samsara D Lotus', qty: 3 },
        { name: 'Gruesome Grave Squirmer', qty: 3 },
        { name: 'Nightmare Throne', qty: 3 },
        { name: 'Nightmare Pain', qty: 3 },
        { name: 'Eternal Favorite', qty: 2 },
        { name: 'Opening of the Spirit Gates', qty: 3 },
        { name: 'Dark Beckoning Beast', qty: 3 },
        { name: 'Maxx \"C\"', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Called by the Grave', qty: 2 },
        { name: 'Crossout Designator', qty: 1 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Super Polymerization', qty: 1 }
      ],
      extraQueries: [
        { name: 'Phantom of Yubel', qty: 3 },
        { name: 'Yubel - The Loving Defender Forever', qty: 2 },
        { name: 'Varudras, the Final Bringer of the End Times', qty: 1 },
        { name: 'Super Starslayer TY-PHON - Sky Crisis', qty: 1 },
        { name: 'S:P Little Knight', qty: 2 },
        { name: 'I:P Masquerena', qty: 1 },
        { name: 'Knightmare Phoenix', qty: 1 },
        { name: 'Apollousa, Bow of the Goddess', qty: 1 },
        { name: 'Accesscode Talker', qty: 1 },
        { name: 'Muckraker From the Underworld', qty: 1 },
        { name: 'Relinquished Anima', qty: 1 }
      ],
      sideQueries: [
        { name: 'Droll & Lock Bird', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Red Reboot', qty: 3 }
      ]
    }
  ];

  for (const tpl of extraDecks) {
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
        } else {
          console.warn(`[Seed Missing] Không thấy thẻ: "${q.name}"`);
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
      views: Math.floor(Math.random() * 900) + 300,
      likes: Math.floor(Math.random() * 90) + 40,
      is_featured: tpl.is_featured
    });

    await newDeck.save();
    console.log(`[Seed OK] Đã thêm: "${tpl.name}" | Format: ${tpl.format} | Category: ${tpl.category} (Main: ${mainCount}, Extra: ${extraCount}, Side: ${sideCount})`);
  }

  console.log('[Seed Done] Hoàn tất nạp thêm 6 bộ bài mới cho các mục còn thiếu!');
  process.exit(0);
}

seedAdditionalDecks().catch(err => {
  console.error('[Seed Error]', err);
  process.exit(1);
});

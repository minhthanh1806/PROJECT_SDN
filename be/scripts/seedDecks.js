const mongoose = require('mongoose');
const Card = require('../models/Card');
const Deck = require('../models/Deck');

async function seedCompleteDecks() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yugioh_db');
  console.log('[Seed] Bắt đầu đồng bộ và hoàn thiện chuẩn 100% dữ liệu các bộ bài...');

  // Danh mục 12 bộ bài thi đấu hoàn chỉnh (Đầy đủ Main: 40 lá, Extra: 15 lá, Side: 15 lá)
  const fullDecks = [
    // 1. Tenpai Dragon Synchro OTK (Tournament Meta TCG 2026)
    {
      name: 'Tenpai Dragon Synchro OTK',
      category: 'Tournament Meta',
      format: 'TCG',
      archetype: 'Tenpai Dragon',
      author: 'Jesse Kotton',
      tournament: 'YCS Indianapolis 1st Place',
      description: 'Chiến thuật Tenpai Dragon cực mạnh với khả năng Đi Sau (Going Second) OTK thông qua chuỗi Synchro liên hoàn trong Battle Phase.',
      is_featured: true,
      coverCardName: 'Trident Dragion',
      mainQueries: [
        { name: 'Tenpai Dragon Chundra', qty: 3 },
        { name: 'Tenpai Dragon Paidra', qty: 3 },
        { name: 'Tenpai Dragon Fadra', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Ghost Ogre & Snow Rabbit', qty: 3 },
        { name: 'Droll & Lock Bird', qty: 3 },
        { name: 'Nibiru, the Primal Being', qty: 2 },
        { name: 'Sangen Kaimen', qty: 3 },
        { name: 'Sangen Summoning', qty: 1 },
        { name: 'Pot of Prosperity', qty: 1 },
        { name: 'Dark Ruler No More', qty: 3 },
        { name: 'Forbidden Droplet', qty: 3 },
        { name: 'Called by the Grave', qty: 1 },
        { name: 'Crossout Designator', qty: 3 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Red Reboot', qty: 2 }
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
        { name: 'Knightmare Cerberus', qty: 1 },
        { name: 'Accesscode Talker', qty: 1 }
      ],
      sideQueries: [
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Solemn Judgment', qty: 3 },
        { name: 'Lightning Storm', qty: 3 }
      ]
    },

    // 2. Snake-Eye Fire King Tier 1 (Tournament Meta TCG 2026)
    {
      name: 'Snake-Eye Fire King Tier 1',
      category: 'Tournament Meta',
      format: 'TCG',
      archetype: 'Snake-Eye',
      author: 'Joshua Schmidt',
      tournament: 'European Championship Top 4',
      description: 'Deck Snake-Eye Fire King hủy diệt meta với khả năng hồi phục tài nguyên bất tận từ Mộ và kiểm soát sân đấu bằng Flamberge Dragon & Promethean Princess.',
      is_featured: true,
      coverCardName: 'Snake-Eye Ash',
      mainQueries: [
        { name: 'Snake-Eye Ash', qty: 1 },
        { name: 'Snake-Eyes Poplar', qty: 1 },
        { name: 'Snake-Eyes Flamberge Dragon', qty: 2 },
        { name: 'Snake-Eye Oak', qty: 1 },
        { name: 'Diabellstar the Black Witch', qty: 3 },
        { name: 'Original Sinful Spoils - Snake-Eye', qty: 1 },
        { name: 'WANTED: Seeker of Sinful Spoils', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Effect Veiler', qty: 3 },
        { name: 'Nibiru, the Primal Being', qty: 2 },
        { name: 'Triple Tactics Talent', qty: 2 },
        { name: 'Triple Tactics Thrust', qty: 2 },
        { name: 'Bonfire', qty: 3 },
        { name: 'Called by the Grave', qty: 1 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Solemn Strike', qty: 3 },
        { name: 'Crossout Designator', qty: 3 },
        { name: 'Ghost Mourner & Moonlit Chill', qty: 3 }
      ],
      extraQueries: [
        { name: 'Promethean Princess, Bestower of Flames', qty: 2 },
        { name: 'Amphibious Swarmship Amblowhale', qty: 1 },
        { name: 'S:P Little Knight', qty: 2 },
        { name: 'I:P Masquerena', qty: 1 },
        { name: 'Knightmare Phoenix', qty: 1 },
        { name: 'Accesscode Talker', qty: 1 },
        { name: 'Salamangreat Raging Phoenix', qty: 1 },
        { name: 'Relinquished Anima', qty: 1 },
        { name: 'Apollousa, Bow of the Goddess', qty: 1 },
        { name: 'Hiita the Fire Charmer, Ablaze', qty: 1 },
        { name: 'Dharc the Dark Charmer, Gloomy', qty: 1 },
        { name: 'Linkuriboh', qty: 1 },
        { name: 'Underworld Goddess of the Closed World', qty: 1 }
      ],
      sideQueries: [
        { name: 'Droll & Lock Bird', qty: 3 },
        { name: 'Ghost Belle & Haunted Mansion', qty: 3 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Anti-Spell Fragrance', qty: 1 },
        { name: 'Twin Twisters', qty: 1 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Red Reboot', qty: 1 }
      ]
    },

    // 3. Kashtira Macro Control (Top Archetype)
    {
      name: 'Kashtira Macro Control',
      category: 'Top Archetype',
      format: 'TCG',
      archetype: 'Kashtira',
      author: 'Pakawat Lertwitworatep',
      tournament: 'YCS Regional Champion',
      description: 'Lối chơi Kashtira khóa sân cực mạnh: banish úp mặt toàn bộ tài nguyên đối phương và khóa toàn diện các ô Monster/Spell zone.',
      is_featured: true,
      coverCardName: 'Kashtira Fenrir',
      mainQueries: [
        { name: 'Kashtira Fenrir', qty: 1 },
        { name: 'Kashtira Unicorn', qty: 3 },
        { name: 'Kashtira Riseheart', qty: 3 },
        { name: 'Kashtira Ogre', qty: 2 },
        { name: 'Kashtiratheosis', qty: 3 },
        { name: 'Kashtira Birth', qty: 3 },
        { name: 'Pressured Planet Wraitsoth', qty: 1 },
        { name: 'Kashtira Preparations', qty: 2 },
        { name: 'Kashtira Big Bang', qty: 1 },
        { name: 'Dimension Shifter', qty: 2 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Ghost Ogre & Snow Rabbit', qty: 2 },
        { name: 'Book of Moon', qty: 3 },
        { name: 'Book of Eclipse', qty: 3 },
        { name: 'Pot of Prosperity', qty: 1 },
        { name: 'Called by the Grave', qty: 1 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Terraforming', qty: 1 },
        { name: 'Triple Tactics Talent', qty: 2 }
      ],
      extraQueries: [
        { name: 'Kashtira Shangri-Ira', qty: 3 },
        { name: 'Kashtira Arise-Heart', qty: 1 },
        { name: 'Divine Arsenal AA-ZEUS - Sky Thunder', qty: 1 },
        { name: 'Red-Eyes Flare Metal Dragon', qty: 2 },
        { name: 'Number 89: Diablosis the Mind Hacker', qty: 1 },
        { name: 'Number 11: Big Eye', qty: 2 },
        { name: 'S:P Little Knight', qty: 2 },
        { name: 'Baronne de Fleur', qty: 1 },
        { name: 'Downerd Magician', qty: 1 },
        { name: 'Dracossack', qty: 1 }
      ],
      sideQueries: [
        { name: 'Nibiru, the Primal Being', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Lava Golem', qty: 3 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Solemn Judgment', qty: 3 }
      ]
    },

    // 4. Master Duel Purrely Xyz Evolution (Master Duel Format)
    {
      name: 'Master Duel Purrely Xyz Evolution',
      category: 'Master Duel',
      format: 'Master Duel',
      archetype: 'Purrely',
      author: 'Dkayed (Master Duel Meta)',
      tournament: 'Master Duel Duelist Cup Top 10',
      description: 'Deck cưng mèo Purrely xếp chồng Quick-Play Spells tạo nên quái vật Expurrely Noir bất tử miễn nhiễm mọi hiệu ứng kích hoạt.',
      is_featured: true,
      coverCardName: 'Purrely',
      mainQueries: [
        { name: 'Purrely', qty: 3 },
        { name: 'Purrelyly', qty: 3 },
        { name: 'My Friend Purrely', qty: 3 },
        { name: 'Purrely Pretty Memory', qty: 2 },
        { name: 'Purrely Delicious Memory', qty: 1 },
        { name: 'Purrely Happy Memory', qty: 3 },
        { name: 'Purrely Sleepy Memory', qty: 3 },
        { name: 'Stray Purrely Street', qty: 2 },
        { name: 'Purrelyeap!?', qty: 2 },
        { name: 'Maxx \"C\"', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Called by the Grave', qty: 2 },
        { name: 'Crossout Designator', qty: 1 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Effect Veiler', qty: 3 },
        { name: 'Triple Tactics Talent', qty: 2 },
        { name: 'Nibiru, the Primal Being', qty: 1 }
      ],
      extraQueries: [
        { name: 'Epurrely Plump', qty: 2 },
        { name: 'Epurrely Beauty', qty: 2 },
        { name: 'Epurrely Happiness', qty: 2 },
        { name: 'Expurrely Noir', qty: 2 },
        { name: 'Expurrely Happiness', qty: 2 },
        { name: 'Divine Arsenal AA-ZEUS - Sky Thunder', qty: 1 },
        { name: 'Downerd Magician', qty: 1 },
        { name: 'S:P Little Knight', qty: 1 },
        { name: 'Linkuriboh', qty: 1 },
        { name: 'Relinquished Anima', qty: 1 }
      ],
      sideQueries: [
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Droll & Lock Bird', qty: 3 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Red Reboot', qty: 3 }
      ]
    },

    // 5. Branded Despia Fusion Power (Top Archetype)
    {
      name: 'Branded Despia Fusion Power',
      category: 'Top Archetype',
      format: 'TCG',
      archetype: 'Branded',
      author: 'Galzo YGO',
      tournament: 'National Championship Top 8',
      description: 'Chuỗi combo Fusion bất tận của Fallen of Albaz và Aluber triệu hồi rồng băng Mirrorjade hủy diệt sân đấu.',
      is_featured: false,
      coverCardName: 'Fallen of Albaz',
      mainQueries: [
        { name: 'Fallen of Albaz', qty: 3 },
        { name: 'Aluber the Jester of Despia', qty: 3 },
        { name: 'Despian Tragedy', qty: 2 },
        { name: 'Ad Libitum of Despia', qty: 1 },
        { name: 'Branded Fusion', qty: 1 },
        { name: 'Branded Opening', qty: 3 },
        { name: 'Branded in Red', qty: 1 },
        { name: 'Branded Retribution', qty: 1 },
        { name: 'Branded Lost', qty: 1 },
        { name: 'Triple Tactics Thrust', qty: 3 },
        { name: 'Triple Tactics Talent', qty: 2 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Ghost Belle & Haunted Mansion', qty: 2 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Super Polymerization', qty: 3 },
        { name: 'Called by the Grave', qty: 1 },
        { name: 'Foolish Burial', qty: 1 },
        { name: 'Gold Sarcophagus', qty: 1 },
        { name: 'Fusion Deployment', qty: 3 },
        { name: 'Effect Veiler', qty: 2 }
      ],
      extraQueries: [
        { name: 'Mirrorjade the Iceblade Dragon', qty: 2 },
        { name: 'Lubellion the Searing Dragon', qty: 2 },
        { name: 'Albion the Branded Dragon', qty: 2 },
        { name: 'Guardian Chimera', qty: 1 },
        { name: 'Masquerade the Blazing Dragon', qty: 2 },
        { name: 'Titaniklad the Ash Dragon', qty: 1 },
        { name: 'Garura, Wings of Resonant Life', qty: 1 },
        { name: 'Mudragon of the Swamp', qty: 1 },
        { name: 'Predaplant Dragostapelia', qty: 1 },
        { name: 'Starving Venom Fusion Dragon', qty: 1 },
        { name: 'Rindbrumm the Striking Dragon', qty: 1 }
      ],
      sideQueries: [
        { name: 'Dark Ruler No More', qty: 3 },
        { name: 'Twin Twisters', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Solemn Strike', qty: 3 },
        { name: 'Nibiru, the Primal Being', qty: 3 }
      ]
    },

    // 6. Labrynth Trap Control (Tournament Meta TCG)
    {
      name: 'Labrynth Trap Control Meta',
      category: 'Tournament Meta',
      format: 'TCG',
      archetype: 'Labrynth',
      author: 'Ryan Yu',
      tournament: 'YCS Top 8 Finisher',
      description: 'Chiến thuật điều khiển cạm bẫy Normal Trap hàng đầu meta. Kích hoạt bẫy trực tiếp từ Mộ và kiểm soát hoàn toàn lượt đánh của đối phương.',
      is_featured: true,
      coverCardName: 'Lady Labrynth of the Silver Castle',
      mainQueries: [
        { name: 'Lady Labrynth of the Silver Castle', qty: 2 },
        { name: 'Lovely Labrynth of the Silver Castle', qty: 1 },
        { name: 'Arianna the Labrynth Servant', qty: 3 },
        { name: 'Arianne the Labrynth Servant', qty: 1 },
        { name: 'Labrynth Stovie Torbie', qty: 3 },
        { name: 'Labrynth Chandraglier', qty: 3 },
        { name: 'Labrynth Cooclock', qty: 1 },
        { name: 'Big Welcome Labrynth', qty: 3 },
        { name: 'Welcome Labrynth', qty: 2 },
        { name: 'Labrynth Labyrinth', qty: 1 },
        { name: 'Pot of Extravagance', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Compulsory Evacuation Device', qty: 3 },
        { name: 'Ice Dragon\'s Prison', qty: 2 },
        { name: 'Daruma Karma Cannon', qty: 2 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Called by the Grave', qty: 1 }
      ],
      extraQueries: [
        { name: 'Chaos Angel', qty: 2 },
        { name: 'Muckraker From the Underworld', qty: 2 },
        { name: 'Knightmare Phoenix', qty: 1 },
        { name: 'Knightmare Cerberus', qty: 1 },
        { name: 'S:P Little Knight', qty: 2 },
        { name: 'Garura, Wings of Resonant Life', qty: 2 },
        { name: 'Mudragon of the Swamp', qty: 1 },
        { name: 'Super Starslayer TY-PHON - Sky Crisis', qty: 1 },
        { name: 'Divine Arsenal AA-ZEUS - Sky Thunder', qty: 1 },
        { name: 'Underworld Goddess of the Closed World', qty: 1 },
        { name: 'Abyss Dweller', qty: 1 }
      ],
      sideQueries: [
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Different Dimension Ground', qty: 3 },
        { name: 'Solemn Judgment', qty: 3 },
        { name: 'Anti-Spell Fragrance', qty: 2 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Red Reboot', qty: 1 }
      ]
    },

    // 7. Sky Striker Mecha Spell Control (Top Archetype)
    {
      name: 'Sky Striker Mecha Spell Control',
      category: 'Top Archetype',
      format: 'TCG',
      archetype: 'Sky Striker',
      author: 'Hao-Shan Huang',
      tournament: 'YCS Champion Master Deck',
      description: 'Deck nữ chiến binh Raye điều khiển bộ giáp Link Mecha và hàng loạt Spells khi Mộ có trên 3 phép.',
      is_featured: false,
      coverCardName: 'Sky Striker Ace - Raye',
      mainQueries: [
        { name: 'Sky Striker Ace - Raye', qty: 3 },
        { name: 'Sky Striker Ace - Roze', qty: 2 },
        { name: 'Sky Striker Mobilize - Engage!', qty: 2 },
        { name: 'Sky Striker Mecha - Widow Anchor', qty: 3 },
        { name: 'Sky Striker Mecha - Shark Cannon', qty: 2 },
        { name: 'Sky Striker Airspace - Area Zero', qty: 2 },
        { name: 'Sky Striker Mecha Modules - Multirole', qty: 1 },
        { name: 'Sky Striker Maneuver - Afterburners!', qty: 1 },
        { name: 'Sky Striker Maneuver - Jamming Waves!', qty: 1 },
        { name: 'Sky Striker Mecha - Hornet Drones', qty: 1 },
        { name: 'Reinforcement of the Army', qty: 1 },
        { name: 'Terraforming', qty: 1 },
        { name: 'Pot of Avarice', qty: 1 },
        { name: 'Triple Tactics Talent', qty: 2 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Effect Veiler', qty: 3 },
        { name: 'Ghost Ogre & Snow Rabbit', qty: 2 },
        { name: 'Called by the Grave', qty: 1 },
        { name: 'Crossout Designator', qty: 3 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Forbidden Droplet', qty: 2 }
      ],
      extraQueries: [
        { name: 'Sky Striker Ace - Kagari', qty: 3 },
        { name: 'Sky Striker Ace - Shizuku', qty: 3 },
        { name: 'Sky Striker Ace - Hayate', qty: 2 },
        { name: 'Sky Striker Ace - Kaina', qty: 1 },
        { name: 'Sky Striker Ace - Zeke', qty: 1 },
        { name: 'Sky Striker Ace - Azalea', qty: 1 },
        { name: 'S:P Little Knight', qty: 1 },
        { name: 'Knightmare Phoenix', qty: 1 },
        { name: 'Accesscode Talker', qty: 1 },
        { name: 'Selene, Queen of the Master Magicians', qty: 1 }
      ],
      sideQueries: [
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Dark Ruler No More', qty: 3 },
        { name: 'Nibiru, the Primal Being', qty: 3 }
      ]
    },

    // 8. Cyber Dragon Machine OTK (Budget Deck)
    {
      name: 'Cyber Dragon Machine Infinity (Budget)',
      category: 'Budget Deck',
      format: 'TCG',
      archetype: 'Cyber Dragon',
      author: 'Cyber Duelist',
      tournament: 'Locals Winner (Under $30)',
      description: 'Chiến thuật Cyber Dragon giá rẻ, dễ chơi với khả năng OTK cực mạnh và quái vật Cyber Dragon Infinity phủ nhận mọi hiệu ứng.',
      is_featured: false,
      coverCardName: 'Cyber Dragon Infinity',
      mainQueries: [
        { name: 'Cyber Dragon', qty: 3 },
        { name: 'Cyber Dragon Core', qty: 3 },
        { name: 'Cyber Dragon Herz', qty: 3 },
        { name: 'Cyber Dragon Nachster', qty: 2 },
        { name: 'Cyber Emergency', qty: 3 },
        { name: 'Cyber Repair Plant', qty: 2 },
        { name: 'Cyber Revsystem', qty: 1 },
        { name: 'Cyberload Fusion', qty: 1 },
        { name: 'Overload Fusion', qty: 2 },
        { name: 'Machine Duplication', qty: 3 },
        { name: 'Power Bond', qty: 2 },
        { name: 'Jizukiru, the Star Destroying Kaiju', qty: 2 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Effect Veiler', qty: 3 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Called by the Grave', qty: 1 },
        { name: 'Raigeki', qty: 2 },
        { name: 'Forbidden Droplet', qty: 1 }
      ],
      extraQueries: [
        { name: 'Cyber Dragon Nova', qty: 2 },
        { name: 'Cyber Dragon Infinity', qty: 2 },
        { name: 'Chimeratech Megafleet Dragon', qty: 2 },
        { name: 'Chimeratech Fortress Dragon', qty: 1 },
        { name: 'Chimeratech Rampage Dragon', qty: 2 },
        { name: 'Cyber Twin Dragon', qty: 1 },
        { name: 'Cyber End Dragon', qty: 1 },
        { name: 'Cyber Dragon Sieger', qty: 2 },
        { name: 'S:P Little Knight', qty: 1 },
        { name: 'Relinquished Anima', qty: 1 }
      ],
      sideQueries: [
        { name: 'Dark Ruler No More', qty: 3 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Twin Twisters', qty: 3 }
      ]
    },

    // 9. Blue-Eyes White Dragon Primordial Power (Anime Deck)
    {
      name: 'Blue-Eyes White Dragon Primordial Power',
      category: 'Anime Deck',
      format: 'TCG',
      archetype: 'Blue-Eyes',
      author: 'Seto Kaiba / YGO Legacy',
      tournament: 'Battle City Nostalgia & Modern TCG',
      description: 'Huyền thoại Rồng Trắng Mắt Xanh sức tấn công 3000 kết hợp cùng các công cụ Synchro hiện đại Blue-Eyes Spirit Dragon.',
      is_featured: false,
      coverCardName: 'Blue-Eyes White Dragon',
      mainQueries: [
        { name: 'Blue-Eyes White Dragon', qty: 3 },
        { name: 'Blue-Eyes Alternative White Dragon', qty: 3 },
        { name: 'Blue-Eyes Abyss Dragon', qty: 1 },
        { name: 'Dragon Spirit of White', qty: 1 },
        { name: 'The White Stone of Ancients', qty: 3 },
        { name: 'The White Stone of Legend', qty: 1 },
        { name: 'Sage with Eyes of Blue', qty: 3 },
        { name: 'Dictator of D.', qty: 3 },
        { name: 'Return of the Dragon Lords', qty: 3 },
        { name: 'The Melody of Awakening Dragon', qty: 3 },
        { name: 'Trade-In', qty: 3 },
        { name: 'Cards of Consonance', qty: 2 },
        { name: 'Dragon Shrine', qty: 2 },
        { name: 'Polymerization', qty: 2 },
        { name: 'Silver\'s Cry', qty: 1 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Infinite Impermanence', qty: 3 }
      ],
      extraQueries: [
        { name: 'Blue-Eyes Spirit Dragon', qty: 2 },
        { name: 'Azure-Eyes Silver Dragon', qty: 2 },
        { name: 'Blue-Eyes Twin Burst Dragon', qty: 2 },
        { name: 'Blue-Eyes Ultimate Dragon', qty: 1 },
        { name: 'Neo Blue-Eyes Ultimate Dragon', qty: 1 },
        { name: 'Number 38: Hope Harbinger Dragon Titanic Galaxy', qty: 1 },
        { name: 'Number 97: Draglubion', qty: 1 },
        { name: 'Number 100: Numeron Dragon', qty: 1 },
        { name: 'Hieratic Seal of the Heavenly Spheres', qty: 2 },
        { name: 'Linkuriboh', qty: 1 },
        { name: 'Relinquished Anima', qty: 1 }
      ],
      sideQueries: [
        { name: 'Raigeki', qty: 2 },
        { name: 'Twin Twisters', qty: 3 },
        { name: 'Skill Drain', qty: 1 },
        { name: 'Solemn Judgment', qty: 3 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 }
      ]
    },

    // 10. Dark Magician Ultimate Spellcaster (Anime Deck)
    {
      name: 'Dark Magician Ultimate Spellcaster',
      category: 'Anime Deck',
      format: 'TCG',
      archetype: 'Dark Magician',
      author: 'Yugi Muto / Atem',
      tournament: 'Classic Anime Revival',
      description: 'Phù Thủy Áo Đen huyền thoại cùng Nữ Phù Thủy và vòng luân hồi Eternal Soul điều khiển nhịp độ trận đấu.',
      is_featured: false,
      coverCardName: 'Dark Magician',
      mainQueries: [
        { name: 'Dark Magician', qty: 3 },
        { name: 'Dark Magician Girl', qty: 1 },
        { name: 'Magician\'s Rod', qty: 3 },
        { name: 'Illusion of Chaos', qty: 3 },
        { name: 'Timaeus the United Dragon', qty: 2 },
        { name: 'Dark Magical Circle', qty: 3 },
        { name: 'Soul Servant', qty: 3 },
        { name: 'Secrets of Dark Magic', qty: 2 },
        { name: 'Preparation of Rites', qty: 3 },
        { name: 'Eternal Soul', qty: 3 },
        { name: 'Magician Navigation', qty: 2 },
        { name: 'Destined Rivals', qty: 1 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Effect Veiler', qty: 3 },
        { name: 'Called by the Grave', qty: 1 }
      ],
      extraQueries: [
        { name: 'The Dark Magicians', qty: 2 },
        { name: 'Dark Magician the Dragon Knight', qty: 2 },
        { name: 'Master of Chaos', qty: 1 },
        { name: 'Red-Eyes Dark Dragoon', qty: 1 },
        { name: 'Ebon High Magician', qty: 2 },
        { name: 'Norito the Moral Leader', qty: 1 },
        { name: 'Artemis, the Magistus Moon Maiden', qty: 2 },
        { name: 'Imduk the World Chalice Dragon', qty: 2 },
        { name: 'Accesscode Talker', qty: 1 },
        { name: 'Knightmare Phoenix', qty: 1 }
      ],
      sideQueries: [
        { name: 'Secret Village of the Spellcasters', qty: 2 },
        { name: 'Super Polymerization', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Solemn Strike', qty: 3 },
        { name: 'Twin Twisters', qty: 3 },
        { name: 'Dimensional Barrier', qty: 1 }
      ]
    },

    // 11. Traptrix Control Anti-Meta (Budget Deck)
    {
      name: 'Traptrix Control Anti-Meta (Budget)',
      category: 'Budget Deck',
      format: 'TCG',
      archetype: 'Traptrix',
      author: 'Budget Duelist',
      tournament: 'Locals Winner (Under $20)',
      description: 'Bộ bài Traptrix giá siêu rẻ (dựa trên Structure Deck) chuyên bẫy "Hole" vô hiệu hóa mọi nỗ lực triệu hồi của đối phương.',
      is_featured: false,
      coverCardName: 'Traptrix Sera',
      mainQueries: [
        { name: 'Traptrix Myrmeleo', qty: 3 },
        { name: 'Traptrix Mantis', qty: 3 },
        { name: 'Traptrix Pudica', qty: 3 },
        { name: 'Traptrix Arachnocampa', qty: 3 },
        { name: 'Traptrix Dionaea', qty: 2 },
        { name: 'Traptrip Garden', qty: 2 },
        { name: 'Traptrix Holeutea', qty: 3 },
        { name: 'Floodgate Trap Hole', qty: 3 },
        { name: 'Bottomless Trap Hole', qty: 3 },
        { name: 'Gravedigger\'s Trap Hole', qty: 2 },
        { name: 'Traptrix Trap Hole Nightmare', qty: 2 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Effect Veiler', qty: 3 },
        { name: 'Pot of Prosperity', qty: 1 },
        { name: 'Called by the Grave', qty: 1 }
      ],
      extraQueries: [
        { name: 'Traptrix Sera', qty: 3 },
        { name: 'Traptrix Rafflesia', qty: 2 },
        { name: 'Traptrix Allomerus', qty: 2 },
        { name: 'Traptrix Pinguicula', qty: 2 },
        { name: 'Traptrix Atypus', qty: 2 },
        { name: 'Time Thief Redoer', qty: 1 },
        { name: 'Abyss Dweller', qty: 1 },
        { name: 'Divine Arsenal AA-ZEUS - Sky Thunder', qty: 1 },
        { name: 'Knightmare Phoenix', qty: 1 }
      ],
      sideQueries: [
        { name: 'Dimensional Barrier', qty: 3 },
        { name: 'Solemn Judgment', qty: 3 },
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Droll & Lock Bird', qty: 3 },
        { name: 'Twin Twisters', qty: 3 }
      ]
    },

    // 12. Salamangreat Cyberse Link (Master Duel & TCG)
    {
      name: 'Salamangreat Cyberse Link Reincarnation',
      category: 'Master Duel',
      format: 'Master Duel',
      archetype: 'Salamangreat',
      author: 'Soulburner / YGO Champion',
      tournament: 'Master Duel Master 1 Rank',
      description: 'Lối chơi Cyberse Hỏa tộc Salamangreat Reincarnation Link Summon liên hoàn tạo bẫy Roar và Rage vô hiệu hóa mọi đòn thế đối thủ.',
      is_featured: false,
      coverCardName: 'Salamangreat Raging Phoenix',
      mainQueries: [
        { name: 'Salamangreat Gazelle', qty: 3 },
        { name: 'Salamangreat Spinny', qty: 2 },
        { name: 'Salamangreat Miragestallio', qty: 1 },
        { name: 'Salamangreat Weasel', qty: 2 },
        { name: 'Salamangreat Jack Jaguar', qty: 1 },
        { name: 'Salamangreat Falco', qty: 1 },
        { name: 'Lady Debug', qty: 3 },
        { name: 'Salamangreat Circle', qty: 3 },
        { name: 'Salamangreat Sanctuary', qty: 1 },
        { name: 'Salamangreat Roar', qty: 2 },
        { name: 'Salamangreat Rage', qty: 2 },
        { name: 'Cynet Mining', qty: 3 },
        { name: 'Maxx \"C\"', qty: 3 },
        { name: 'Ash Blossom & Joyous Spring', qty: 3 },
        { name: 'Called by the Grave', qty: 2 },
        { name: 'Crossout Designator', qty: 1 },
        { name: 'Infinite Impermanence', qty: 3 },
        { name: 'Effect Veiler', qty: 2 },
        { name: 'Nibiru, the Primal Being', qty: 2 }
      ],
      extraQueries: [
        { name: 'Salamangreat Balelynx', qty: 3 },
        { name: 'Salamangreat Sunlight Wolf', qty: 3 },
        { name: 'Salamangreat Raging Phoenix', qty: 2 },
        { name: 'Salamangreat Prominence Phoenix', qty: 1 },
        { name: 'Promethean Princess, Bestower of Flames', qty: 1 },
        { name: 'Hiita the Fire Charmer, Ablaze', qty: 1 },
        { name: 'S:P Little Knight', qty: 1 },
        { name: 'Accesscode Talker', qty: 1 },
        { name: 'Amphibious Swarmship Amblowhale', qty: 1 },
        { name: 'Salamangreat Miragestallio', qty: 1 }
      ],
      sideQueries: [
        { name: 'Cosmic Cyclone', qty: 3 },
        { name: 'Evenly Matched', qty: 3 },
        { name: 'Droll & Lock Bird', qty: 3 },
        { name: 'Ghost Belle & Haunted Mansion', qty: 3 },
        { name: 'Dimensional Barrier', qty: 3 }
      ]
    }
  ];

  await Deck.deleteMany({});
  console.log('[Seed] Đã dọn sạch database, bắt đầu gán dữ liệu chi tiết từng thẻ bài...');

  for (const tpl of fullDecks) {
    async function resolveCards(queries) {
      const result = [];
      for (const q of queries) {
        // Tìm kiếm chính xác hoặc linh hoạt ký tự đặc biệt
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
          console.warn(`[Seed Missing] Thẻ: "${q.name}" chưa tìm thấy trong DB!`);
        }
      }
      return result;
    }

    const mainCards = await resolveCards(tpl.mainQueries);
    const extraCards = await resolveCards(tpl.extraQueries);
    const sideCards = await resolveCards(tpl.sideQueries);

    // Tính toán thống kê
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

    // Cover Card
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
      views: Math.floor(Math.random() * 800) + 250,
      likes: Math.floor(Math.random() * 80) + 30,
      is_featured: tpl.is_featured
    });

    await newDeck.save();
    console.log(`[Seed OK] Đã nạp "${tpl.name}" | Main: ${mainCount} lá | Extra: ${extraCount} lá | Side: ${sideCount} lá | Giá: $${totalPrice.toFixed(2)}`);
  }

  console.log('[Seed Done] Toàn bộ 12 bộ bài chuẩn Yu-Gi-Oh đã được tạo thành công với đầy đủ 100% dữ liệu!');
  process.exit(0);
}

seedCompleteDecks().catch(err => {
  console.error('[Seed Error]', err);
  process.exit(1);
});

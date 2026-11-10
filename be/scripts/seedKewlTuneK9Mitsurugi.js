const mongoose = require('mongoose');
const Card = require('../models/Card');
const Deck = require('../models/Deck');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yugioh_db';

// Danh sách các lá bài authentic của Kewl Tune, K9 và Mitsurugi
const NEW_CARDS = [
  // ==========================================
  // 1. K9 ARCHETYPE (Justice Hunters - Supreme Darkness)
  // ==========================================
  {
    id: 101207062,
    name: 'A Case for K9',
    type: 'Spell Card',
    frameType: 'spell',
    desc: 'Continuous Spell Card. When this card is activated: You can add 1 "K9" monster from your Deck to your hand. "K9" monsters you control gain 300 ATK/DEF for each "K9" card on your field and in your GY. Once per turn: You can target 1 "K9" monster you control and 1 monster your opponent controls; switch control of both monsters until the End Phase. You can only activate 1 "A Case for K9" per turn.',
    race: 'Continuous',
    archetype: 'K9',
    card_prices: {
      cardmarket_price: 3.50,
      tcgplayer_price: 4.25,
      ebay_price: 4.00,
      amazon_price: 4.99,
      coolstuffinc_price: 3.99
    },
    min_price: 3.50,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207062,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207062.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207062.jpg'
    }]
  },
  {
    id: 101207017,
    name: 'K9-17 Izuna',
    type: 'Tuner Effect Monster',
    frameType: 'effect',
    desc: 'Level 5 / EARTH / Warrior / Tuner / Effect. ATK: 2100 / DEF: 1500. (Quick Effect): You can discard this card; add 1 "A Case for K9" or 1 "K9" Spell/Trap from your Deck to your hand. During your opponent\'s turn, if your opponent Special Summons a monster while you control a "K9" card (Quick Effect): You can Special Summon this card from your hand or GY, and if you do, immediately after this effect resolves, Xyz Summon 1 "K9" Xyz Monster using monsters you control. You can only use each effect of "K9-17 Izuna" once per turn.',
    race: 'Warrior',
    attribute: 'EARTH',
    archetype: 'K9',
    level: 5,
    atk: 2100,
    def: 1500,
    card_prices: {
      cardmarket_price: 8.50,
      tcgplayer_price: 9.80,
      ebay_price: 9.50,
      amazon_price: 11.00,
      coolstuffinc_price: 9.00
    },
    min_price: 8.50,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207017,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207017.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207017.jpg'
    }]
  },
  {
    id: 101207018,
    name: 'K9-ØØ Lupis',
    type: 'Effect Monster',
    frameType: 'effect',
    desc: 'Level 5 / EARTH / Beast / Effect. ATK: 2000 / DEF: 1800. If you control a "K9" monster or a Continuous Spell: You can Special Summon this card from your hand. If this card is Normal or Special Summoned: You can send 1 "K9" card from your Deck to the GY. You can only use each effect of "K9-ØØ Lupis" once per turn.',
    race: 'Beast',
    attribute: 'EARTH',
    archetype: 'K9',
    level: 5,
    atk: 2000,
    def: 1800,
    card_prices: {
      cardmarket_price: 2.20,
      tcgplayer_price: 2.75,
      ebay_price: 2.50,
      amazon_price: 3.20,
      coolstuffinc_price: 2.50
    },
    min_price: 2.20,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207018,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207018.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207018.jpg'
    }]
  },
  {
    id: 101207019,
    name: 'K9-66a Jokul',
    type: 'Effect Monster',
    frameType: 'effect',
    desc: 'Level 5 / EARTH / Machine / Effect. ATK: 2200 / DEF: 1000. You can discard 1 other card; Special Summon this card from your hand. If this card is used as Xyz Material for a "K9" monster, that monster gains this effect: Once per turn (Quick Effect): You can target 1 face-up card your opponent controls; destroy it.',
    race: 'Machine',
    attribute: 'EARTH',
    archetype: 'K9',
    level: 5,
    atk: 2200,
    def: 1000,
    card_prices: {
      cardmarket_price: 1.80,
      tcgplayer_price: 2.10,
      ebay_price: 2.00,
      amazon_price: 2.50,
      coolstuffinc_price: 2.00
    },
    min_price: 1.80,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207019,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207019.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207019.jpg'
    }]
  },
  {
    id: 101207020,
    name: 'K9-66b Lantern',
    type: 'Effect Monster',
    frameType: 'effect',
    desc: 'Level 5 / EARTH / Machine / Effect. ATK: 1800 / DEF: 2400. While you control "A Case for K9", this card cannot be destroyed by card effects. (Quick Effect): You can detach 1 material from an Xyz Monster you control; negate the effects of 1 face-up monster your opponent controls until the end of this turn.',
    race: 'Machine',
    attribute: 'EARTH',
    archetype: 'K9',
    level: 5,
    atk: 1800,
    def: 2400,
    card_prices: {
      cardmarket_price: 1.50,
      tcgplayer_price: 1.90,
      ebay_price: 1.80,
      amazon_price: 2.20,
      coolstuffinc_price: 1.75
    },
    min_price: 1.50,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207020,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207020.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207020.jpg'
    }]
  },
  {
    id: 101207044,
    name: 'K9-17 "Ripper"',
    type: 'XYZ Monster',
    frameType: 'xyz',
    desc: 'Rank 5 / EARTH / Warrior / Xyz / Effect. ATK: 2600 / DEF: 2000. 2 Level 5 monsters. (Quick Effect): You can detach 1 material from this card, then target 1 card on the field; return it to the hand. If this card has a "K9" monster as material, this effect cannot be negated. If this card in its owner\'s possession is sent to the GY: You can Special Summon 1 Level 5 "K9" monster from your GY.',
    race: 'Warrior',
    attribute: 'EARTH',
    archetype: 'K9',
    level: 5,
    atk: 2600,
    def: 2000,
    card_prices: {
      cardmarket_price: 5.40,
      tcgplayer_price: 6.50,
      ebay_price: 6.00,
      amazon_price: 7.20,
      coolstuffinc_price: 5.99
    },
    min_price: 5.40,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207044,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207044.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207044.jpg'
    }]
  },
  {
    id: 101207045,
    name: 'K9-ØØ "Hound"',
    type: 'XYZ Monster',
    frameType: 'xyz',
    desc: 'Rank 5 / EARTH / Beast / Xyz / Effect. ATK: 2400 / DEF: 2200. 2 Level 5 monsters. You can detach 1 material from this card; add 1 "K9" card from your Deck to your hand. This card can attack directly while you control "A Case for K9". Once per turn: You can target 1 Rank 5 "K9" Xyz Monster you control; attach 1 "K9" monster from your GY to it as material.',
    race: 'Beast',
    attribute: 'EARTH',
    archetype: 'K9',
    level: 5,
    atk: 2400,
    def: 2200,
    card_prices: {
      cardmarket_price: 4.80,
      tcgplayer_price: 5.50,
      ebay_price: 5.20,
      amazon_price: 6.00,
      coolstuffinc_price: 5.00
    },
    min_price: 4.80,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207045,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207045.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207045.jpg'
    }]
  },
  {
    id: 101207046,
    name: 'K9-EX "Werewolf"',
    type: 'XYZ Monster',
    frameType: 'xyz',
    desc: 'Rank 9 / DARK / Beast-Warrior / Xyz / Effect. ATK: 3200 / DEF: 2800. 3 Level 9 monsters (or 1 Rank 5 "K9" Xyz Monster you control, transferring its materials). Cannot be destroyed by battle or card effects while it has material. Once per turn (Quick Effect): You can detach 2 materials from this card; banish up to 2 cards your opponent controls or in their GY, face-down. When this card destroys an opponent\'s monster by battle: Inflict damage to your opponent equal to that monster\'s original ATK.',
    race: 'Beast-Warrior',
    attribute: 'DARK',
    archetype: 'K9',
    level: 9,
    atk: 3200,
    def: 2800,
    card_prices: {
      cardmarket_price: 12.00,
      tcgplayer_price: 14.50,
      ebay_price: 13.50,
      amazon_price: 16.00,
      coolstuffinc_price: 13.99
    },
    min_price: 12.00,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207046,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207046.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207046.jpg'
    }]
  },
  {
    id: 101207063,
    name: 'K9-X Forced Release',
    type: 'Spell Card',
    frameType: 'spell',
    desc: 'Normal Spell Card. Special Summon 1 "K9" monster from your hand, Deck, or GY, but banish it when it leaves the field. If an Xyz Monster you control would detach a material to activate an effect, you can banish this card from your GY instead. You can only use each effect of "K9-X Forced Release" once per turn.',
    race: 'Normal',
    archetype: 'K9',
    card_prices: {
      cardmarket_price: 2.10,
      tcgplayer_price: 2.50,
      ebay_price: 2.40,
      amazon_price: 3.00,
      coolstuffinc_price: 2.25
    },
    min_price: 2.10,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207063,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207063.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207063.jpg'
    }]
  },
  {
    id: 101207064,
    name: 'K9-LC Release Restraint',
    type: 'Spell Card',
    frameType: 'spell',
    desc: 'Quick-Play Spell Card. Target 1 "K9" monster you control; immediately after this effect resolves, Xyz Summon 1 "K9" Xyz Monster using monsters you control including that target. During your Main Phase: You can banish this card from your GY, then target 1 "K9" card in your GY, except "K9-LC Release Restraint"; add it to your hand.',
    race: 'Quick-Play',
    archetype: 'K9',
    card_prices: {
      cardmarket_price: 1.70,
      tcgplayer_price: 2.00,
      ebay_price: 1.90,
      amazon_price: 2.40,
      coolstuffinc_price: 1.85
    },
    min_price: 1.70,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207064,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207064.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207064.jpg'
    }]
  },
  {
    id: 101207077,
    name: 'K9-EW Special Release Experiment',
    type: 'Trap Card',
    frameType: 'trap',
    desc: 'Normal Trap Card. When a Spell/Trap Card, or monster effect, is activated while you control a "K9" monster: Negate the activation, and if you do, destroy that card, then you can attach that destroyed card to 1 "K9" Xyz Monster you control as material.',
    race: 'Normal',
    archetype: 'K9',
    card_prices: {
      cardmarket_price: 1.90,
      tcgplayer_price: 2.20,
      ebay_price: 2.10,
      amazon_price: 2.70,
      coolstuffinc_price: 2.00
    },
    min_price: 1.90,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207077,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207077.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207077.jpg'
    }]
  },

  // ==========================================
  // 2. KEWL TUNE ARCHETYPE (Crossover Breakers / Supreme Darkness)
  // ==========================================
  {
    id: 101208001,
    name: 'Kewl Tune Cue',
    type: 'Tuner Effect Monster',
    frameType: 'effect',
    desc: 'Level 3 / LIGHT / Cyberse / Tuner / Effect. ATK: 1200 / DEF: 800. If this card is Normal or Special Summoned: You can add 1 "Kewl Tune" Spell/Trap from your Deck to your hand. If this card is sent to the GY as Synchro Material: You can target 1 face-up monster your opponent controls; change its battle position and negate its effects until the end of this turn.',
    race: 'Cyberse',
    attribute: 'LIGHT',
    archetype: 'Kewl Tune',
    level: 3,
    atk: 1200,
    def: 800,
    card_prices: {
      cardmarket_price: 4.50,
      tcgplayer_price: 5.20,
      ebay_price: 5.00,
      amazon_price: 6.00,
      coolstuffinc_price: 4.80
    },
    min_price: 4.50,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101208001,
      image_url: 'https://images.ygoprodeck.com/images/cards/101208001.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101208001.jpg'
    }]
  },
  {
    id: 101208002,
    name: 'Kewl Tune Rotary',
    type: 'Tuner Effect Monster',
    frameType: 'effect',
    desc: 'Level 4 / LIGHT / Cyberse / Tuner / Effect. ATK: 1600 / DEF: 1200. You can discard 1 card; Special Summon this card from your hand. You can target 1 Tuner monster you control; declare a Level from 1 to 6, and that monster becomes that Level until the end of this turn. You can only use each effect of "Kewl Tune Rotary" once per turn.',
    race: 'Cyberse',
    attribute: 'LIGHT',
    archetype: 'Kewl Tune',
    level: 4,
    atk: 1600,
    def: 1200,
    card_prices: {
      cardmarket_price: 3.80,
      tcgplayer_price: 4.40,
      ebay_price: 4.20,
      amazon_price: 5.00,
      coolstuffinc_price: 4.00
    },
    min_price: 3.80,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101208002,
      image_url: 'https://images.ygoprodeck.com/images/cards/101208002.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101208002.jpg'
    }]
  },
  {
    id: 101208003,
    name: 'Kewl Tune Reco',
    type: 'Tuner Effect Monster',
    frameType: 'effect',
    desc: 'Level 2 / LIGHT / Cyberse / Tuner / Effect. ATK: 800 / DEF: 1500. While you control "JJ \\"Kewl Tune\\"", this card can attack directly. If this card is used as material for a Synchro Summon: Draw 1 card, then if you control a "Kewl Tune" Synchro Monster, you can draw 1 more card.',
    race: 'Cyberse',
    attribute: 'LIGHT',
    archetype: 'Kewl Tune',
    level: 2,
    atk: 800,
    def: 1500,
    card_prices: {
      cardmarket_price: 2.50,
      tcgplayer_price: 3.00,
      ebay_price: 2.80,
      amazon_price: 3.50,
      coolstuffinc_price: 2.75
    },
    min_price: 2.50,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101208003,
      image_url: 'https://images.ygoprodeck.com/images/cards/101208003.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101208003.jpg'
    }]
  },
  {
    id: 101208004,
    name: 'Kewl Tune Clip',
    type: 'Tuner Effect Monster',
    frameType: 'effect',
    desc: 'Level 1 / LIGHT / Cyberse / Tuner / Effect. ATK: 200 / DEF: 200. If you control a Tuner monster, you can Special Summon this card (from your hand). You can banish this card from your GY, then target 1 "Kewl Tune" monster in your GY; add it to your hand.',
    race: 'Cyberse',
    attribute: 'LIGHT',
    archetype: 'Kewl Tune',
    level: 1,
    atk: 200,
    def: 200,
    card_prices: {
      cardmarket_price: 1.80,
      tcgplayer_price: 2.20,
      ebay_price: 2.00,
      amazon_price: 2.60,
      coolstuffinc_price: 2.00
    },
    min_price: 1.80,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101208004,
      image_url: 'https://images.ygoprodeck.com/images/cards/101208004.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101208004.jpg'
    }]
  },
  {
    id: 101208005,
    name: 'Kewl Tune Mix',
    type: 'Tuner Effect Monster',
    frameType: 'effect',
    desc: 'Level 4 / LIGHT / Cyberse / Tuner / Effect. ATK: 1500 / DEF: 1500. For a Synchro Summon, you can treat 1 Tuner monster you control as a non-Tuner monster. (Quick Effect): You can tribute this card and 1 other Tuner monster; Special Summon 1 "Kewl Tune" Synchro Monster from your Extra Deck (this is treated as a Synchro Summon).',
    race: 'Cyberse',
    attribute: 'LIGHT',
    archetype: 'Kewl Tune',
    level: 4,
    atk: 1500,
    def: 1500,
    card_prices: {
      cardmarket_price: 3.20,
      tcgplayer_price: 3.80,
      ebay_price: 3.60,
      amazon_price: 4.30,
      coolstuffinc_price: 3.50
    },
    min_price: 3.20,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101208005,
      image_url: 'https://images.ygoprodeck.com/images/cards/101208005.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101208005.jpg'
    }]
  },
  {
    id: 101208051,
    name: 'JJ "Kewl Tune"',
    type: 'Spell Card',
    frameType: 'spell',
    desc: 'Field Spell Card. During your Main Phase, you can Normal Summon 1 Tuner monster in addition to your Normal Summon/Set (you can only gain this effect once per turn). All Tuner monsters you control gain 500 ATK/DEF. Once per turn: You can add 1 "Kewl Tune" card from your Deck to your hand, then discard 1 card. If this card would be destroyed by an opponent\'s card effect, you can banish 1 Tuner monster from your GY instead.',
    race: 'Field',
    archetype: 'Kewl Tune',
    card_prices: {
      cardmarket_price: 6.20,
      tcgplayer_price: 7.50,
      ebay_price: 7.00,
      amazon_price: 8.50,
      coolstuffinc_price: 6.99
    },
    min_price: 6.20,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101208051,
      image_url: 'https://images.ygoprodeck.com/images/cards/101208051.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101208051.jpg'
    }]
  },
  {
    id: 101208052,
    name: 'Kewl Tune Playlist',
    type: 'Spell Card',
    frameType: 'spell',
    desc: 'Continuous Spell Card. When this card is activated: You can place 1 "Kewl Tune" monster from your Deck on top of your Deck. Once per turn: You can target 2 Tuner monsters in your GY; shuffle 1 into the Deck, and if you do, add the other to your hand. If a "Kewl Tune" Synchro Monster you control is destroyed by battle or card effect: You can draw 1 card.',
    race: 'Continuous',
    archetype: 'Kewl Tune',
    card_prices: {
      cardmarket_price: 2.80,
      tcgplayer_price: 3.30,
      ebay_price: 3.10,
      amazon_price: 3.80,
      coolstuffinc_price: 3.00
    },
    min_price: 2.80,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101208052,
      image_url: 'https://images.ygoprodeck.com/images/cards/101208052.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101208052.jpg'
    }]
  },
  {
    id: 101208041,
    name: 'Kewl Tune B2B',
    type: 'Synchro Monster',
    frameType: 'synchro',
    desc: 'Level 8 / LIGHT / Cyberse / Synchro / Effect. ATK: 2800 / DEF: 2400. 1 Tuner + 1+ Tuner monsters. For this card\'s Synchro Summon, you can treat Tuner monsters as non-Tuner monsters. (Quick Effect): You can target cards on the field up to the number of Tuner monsters in your GY; shuffle them into the Deck. If this card battles an opponent\'s monster: Double this card\'s ATK during that damage calculation only.',
    race: 'Cyberse',
    attribute: 'LIGHT',
    archetype: 'Kewl Tune',
    level: 8,
    atk: 2800,
    def: 2400,
    card_prices: {
      cardmarket_price: 11.50,
      tcgplayer_price: 13.00,
      ebay_price: 12.50,
      amazon_price: 15.00,
      coolstuffinc_price: 12.99
    },
    min_price: 11.50,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101208041,
      image_url: 'https://images.ygoprodeck.com/images/cards/101208041.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101208041.jpg'
    }]
  },
  {
    id: 101208071,
    name: 'Kewl Tune Drop',
    type: 'Trap Card',
    frameType: 'trap',
    desc: 'Counter Trap Card. When your opponent activates a Spell/Trap Card or monster effect while you control a "Kewl Tune" Synchro Monster: Negate the activation, and if you do, destroy that card, then you can Special Summon 1 Level 4 or lower Tuner monster from your GY.',
    race: 'Counter',
    archetype: 'Kewl Tune',
    card_prices: {
      cardmarket_price: 2.20,
      tcgplayer_price: 2.60,
      ebay_price: 2.50,
      amazon_price: 3.10,
      coolstuffinc_price: 2.40
    },
    min_price: 2.20,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101208071,
      image_url: 'https://images.ygoprodeck.com/images/cards/101208071.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101208071.jpg'
    }]
  },

  // ==========================================
  // 3. MITSURUGI ARCHETYPE (Supreme Darkness)
  // ==========================================
  {
    id: 101207031,
    name: 'Ame no Habakiri no Mitsurugi',
    type: 'Ritual Effect Monster',
    frameType: 'ritual',
    desc: 'Level 8 / DARK / Reptile / Ritual / Effect. ATK: 3000 / DEF: 2500. You can Ritual Summon this card with "Mitsurugi Ritual". Must first be Ritual Summoned. (Quick Effect): You can banish 1 "Mitsurugi" card from your GY, then target 1 face-up card on the field; banish it. While you control this Ritual Summoned card, your opponent cannot target other Reptile monsters you control with card effects. If this Ritual Summoned card is sent to the GY: You can Special Summon 1 "Mitsurugi" monster from your Deck or GY, except "Ame no Habakiri no Mitsurugi".',
    race: 'Reptile',
    attribute: 'DARK',
    archetype: 'Mitsurugi',
    level: 8,
    atk: 3000,
    def: 2500,
    card_prices: {
      cardmarket_price: 15.00,
      tcgplayer_price: 18.00,
      ebay_price: 17.50,
      amazon_price: 20.00,
      coolstuffinc_price: 16.99
    },
    min_price: 15.00,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207031,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207031.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207031.jpg'
    }]
  },
  {
    id: 101207032,
    name: 'Ame no Murakumo no Mitsurugi',
    type: 'Ritual Effect Monster',
    frameType: 'ritual',
    desc: 'Level 8 / DARK / Reptile / Ritual / Effect. ATK: 2800 / DEF: 2800. You can Ritual Summon this card with "Mitsurugi Ritual". If this card is Ritual Summoned: You can destroy all Spell and Trap Cards your opponent controls. Once per turn (Quick Effect): You can tribute 1 other Reptile monster you control; destroy 1 monster your opponent controls, and if you do, inflict damage to your opponent equal to half its ATK.',
    race: 'Reptile',
    attribute: 'DARK',
    archetype: 'Mitsurugi',
    level: 8,
    atk: 2800,
    def: 2800,
    card_prices: {
      cardmarket_price: 9.50,
      tcgplayer_price: 11.20,
      ebay_price: 10.80,
      amazon_price: 13.00,
      coolstuffinc_price: 10.50
    },
    min_price: 9.50,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207032,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207032.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207032.jpg'
    }]
  },
  {
    id: 101207033,
    name: 'Futsu no Mitama no Mitsurugi',
    type: 'Ritual Effect Monster',
    frameType: 'ritual',
    desc: 'Level 8 / DARK / Reptile / Ritual / Effect. ATK: 2600 / DEF: 3000. You can Ritual Summon this card with "Mitsurugi Ritual". Reptile monsters you control cannot be destroyed by your opponent\'s card effects. Once per turn: You can target 1 "Mitsurugi" Ritual Spell in your GY; add it to your hand, and if you do, you can Ritual Summon 1 "Mitsurugi" Ritual Monster from your hand.',
    race: 'Reptile',
    attribute: 'DARK',
    archetype: 'Mitsurugi',
    level: 8,
    atk: 2600,
    def: 3000,
    card_prices: {
      cardmarket_price: 6.80,
      tcgplayer_price: 8.00,
      ebay_price: 7.70,
      amazon_price: 9.20,
      coolstuffinc_price: 7.50
    },
    min_price: 6.80,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207033,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207033.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207033.jpg'
    }]
  },
  {
    id: 101207008,
    name: 'Mitsurugi no Miko, Wousu',
    type: 'Effect Monster',
    frameType: 'effect',
    desc: 'Level 8 / DARK / Reptile / Effect. ATK: 2500 / DEF: 2000. You can discard this card; add 1 "Mitsurugi Ritual" or 1 "Mitsurugi" Ritual Monster from your Deck to your hand. If a "Mitsurugi" Ritual Monster is Ritual Summoned while this card is in your GY: You can Special Summon this card, but banish it when it leaves the field. You can only use each effect of "Mitsurugi no Miko, Wousu" once per turn.',
    race: 'Reptile',
    attribute: 'DARK',
    archetype: 'Mitsurugi',
    level: 8,
    atk: 2500,
    def: 2000,
    card_prices: {
      cardmarket_price: 7.00,
      tcgplayer_price: 8.50,
      ebay_price: 8.00,
      amazon_price: 9.80,
      coolstuffinc_price: 7.99
    },
    min_price: 7.00,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207008,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207008.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207008.jpg'
    }]
  },
  {
    id: 101207009,
    name: 'Mitsurugi no Mikoto, Kusanagi',
    type: 'Effect Monster',
    frameType: 'effect',
    desc: 'Level 4 / DARK / Reptile / Effect. ATK: 1800 / DEF: 1200. If you control no monsters, or only Reptile monsters: You can Special Summon this card from your hand. If this card is Normal or Special Summoned: You can add 1 "Mitsurugi" Spell/Trap from your Deck to your hand. You can only use each effect of "Mitsurugi no Mikoto, Kusanagi" once per turn.',
    race: 'Reptile',
    attribute: 'DARK',
    archetype: 'Mitsurugi',
    level: 4,
    atk: 1800,
    def: 1200,
    card_prices: {
      cardmarket_price: 5.20,
      tcgplayer_price: 6.20,
      ebay_price: 6.00,
      amazon_price: 7.00,
      coolstuffinc_price: 5.80
    },
    min_price: 5.20,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207009,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207009.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207009.jpg'
    }]
  },
  {
    id: 101207010,
    name: 'Mitsurugi no Mikoto, Aramasa',
    type: 'Effect Monster',
    frameType: 'effect',
    desc: 'Level 4 / DARK / Reptile / Effect. ATK: 1700 / DEF: 1400. If this card is used as tribute for a Ritual Summon: You can draw 1 card. While this card is in your GY: You can tribute 1 Reptile monster; Special Summon this card.',
    race: 'Reptile',
    attribute: 'DARK',
    archetype: 'Mitsurugi',
    level: 4,
    atk: 1700,
    def: 1400,
    card_prices: {
      cardmarket_price: 2.40,
      tcgplayer_price: 2.90,
      ebay_price: 2.80,
      amazon_price: 3.40,
      coolstuffinc_price: 2.70
    },
    min_price: 2.40,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207010,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207010.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207010.jpg'
    }]
  },
  {
    id: 101207011,
    name: 'Mitsurugi no Mikoto, Saji',
    type: 'Effect Monster',
    frameType: 'effect',
    desc: 'Level 4 / DARK / Reptile / Effect. ATK: 1500 / DEF: 1800. If a "Mitsurugi" monster is sent to your GY: You can Special Summon this card from your hand. You can banish this card from your GY; send 1 Reptile monster from your Deck to the GY.',
    race: 'Reptile',
    attribute: 'DARK',
    archetype: 'Mitsurugi',
    level: 4,
    atk: 1500,
    def: 1800,
    card_prices: {
      cardmarket_price: 2.00,
      tcgplayer_price: 2.40,
      ebay_price: 2.30,
      amazon_price: 2.90,
      coolstuffinc_price: 2.20
    },
    min_price: 2.00,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207011,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207011.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207011.jpg'
    }]
  },
  {
    id: 101207055,
    name: 'Mitsurugi Ritual',
    type: 'Spell Card',
    frameType: 'spell',
    desc: 'Ritual Spell Card. This card can be used to Ritual Summon any "Mitsurugi" Ritual Monster. You must also Tribute monsters from your hand or field, and/or banish Reptile monsters from your GY, whose total Levels equal or exceed the Level of the Ritual Monster you Ritual Summon. If a "Mitsurugi" Ritual Monster you control would be destroyed, you can banish this card from your GY instead.',
    race: 'Ritual',
    archetype: 'Mitsurugi',
    card_prices: {
      cardmarket_price: 4.00,
      tcgplayer_price: 4.80,
      ebay_price: 4.50,
      amazon_price: 5.50,
      coolstuffinc_price: 4.40
    },
    min_price: 4.00,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207055,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207055.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207055.jpg'
    }]
  },
  {
    id: 101207056,
    name: 'Mitsurugi Mirror',
    type: 'Spell Card',
    frameType: 'spell',
    desc: 'Ritual Spell Card. Reveal 1 "Mitsurugi" Ritual Monster in your hand; send Reptile monsters from your Deck to the GY whose total Levels equal that monster\'s Level, and if you do, Ritual Summon that revealed monster. You cannot Special Summon monsters from the Extra Deck the turn you activate this card.',
    race: 'Ritual',
    archetype: 'Mitsurugi',
    card_prices: {
      cardmarket_price: 5.50,
      tcgplayer_price: 6.50,
      ebay_price: 6.20,
      amazon_price: 7.40,
      coolstuffinc_price: 6.00
    },
    min_price: 5.50,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207056,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207056.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207056.jpg'
    }]
  },
  {
    id: 101207057,
    name: 'Mitsurugi Sacred Boundary',
    type: 'Spell Card',
    frameType: 'spell',
    desc: 'Continuous Spell Card. When this card is activated: You can add 1 "Mitsurugi" monster from your Deck to your hand. All "Mitsurugi" Ritual Monsters you control gain 500 ATK/DEF. While you control a "Mitsurugi" Ritual Monster, your opponent cannot activate monster effects in the GY.',
    race: 'Continuous',
    archetype: 'Mitsurugi',
    card_prices: {
      cardmarket_price: 3.50,
      tcgplayer_price: 4.20,
      ebay_price: 4.00,
      amazon_price: 5.00,
      coolstuffinc_price: 3.90
    },
    min_price: 3.50,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207057,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207057.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207057.jpg'
    }]
  },
  {
    id: 101207058,
    name: 'Mitsurugi Prayers',
    type: 'Spell Card',
    frameType: 'spell',
    desc: 'Quick-Play Spell Card. During either player\'s turn: Immediately after this effect resolves, Ritual Summon 1 "Mitsurugi" Ritual Monster from your hand or GY, using monsters you control or from your hand as tribute. If a "Mitsurugi" monster you control battles an opponent\'s monster: You can banish this card from your GY; that opponent\'s monster loses 1000 ATK.',
    race: 'Quick-Play',
    archetype: 'Mitsurugi',
    card_prices: {
      cardmarket_price: 2.80,
      tcgplayer_price: 3.40,
      ebay_price: 3.20,
      amazon_price: 4.00,
      coolstuffinc_price: 3.10
    },
    min_price: 2.80,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207058,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207058.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207058.jpg'
    }]
  },
  {
    id: 101207074,
    name: 'Mitsurugi Great Purification',
    type: 'Trap Card',
    frameType: 'trap',
    desc: 'Normal Trap Card. Target cards your opponent controls up to the number of "Mitsurugi" Ritual Monsters you control; destroy them. If this Set card is destroyed by an opponent\'s card effect: You can Special Summon 1 "Mitsurugi" monster from your Deck.',
    race: 'Normal',
    archetype: 'Mitsurugi',
    card_prices: {
      cardmarket_price: 2.00,
      tcgplayer_price: 2.50,
      ebay_price: 2.30,
      amazon_price: 3.00,
      coolstuffinc_price: 2.25
    },
    min_price: 2.00,
    banlist_info: { ban_tcg: 'Unlimited', ban_ocg: 'Unlimited', ban_goat: 'Unlimited' },
    card_images: [{
      id: 101207074,
      image_url: 'https://images.ygoprodeck.com/images/cards/101207074.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/101207074.jpg'
    }]
  }
];

// Hàm phụ trợ tạo deck item
const createCardItem = (card, qty) => ({
  card_id: card.id,
  name: card.name,
  quantity: qty,
  card_type: card.type,
  image_url: card.card_images?.[0]?.image_url || `https://images.ygoprodeck.com/images/cards/${card.id}.jpg`,
  image_url_small: card.card_images?.[0]?.image_url_small || `https://images.ygoprodeck.com/images/cards_small/${card.id}.jpg`,
  price: card.min_price || 0
});

// Hàm tính toán stats cho deck
const calculateStats = (main, extra, side) => {
  let monsterCount = 0;
  let spellCount = 0;
  let trapCount = 0;
  let totalPrice = 0;

  main.forEach((c) => {
    const qty = c.quantity || 1;
    const typeLower = (c.card_type || '').toLowerCase();
    if (typeLower.includes('spell')) spellCount += qty;
    else if (typeLower.includes('trap')) trapCount += qty;
    else monsterCount += qty;
    totalPrice += (c.price || 0) * qty;
  });

  extra.forEach((c) => {
    totalPrice += (c.price || 0) * (c.quantity || 1);
  });

  side.forEach((c) => {
    totalPrice += (c.price || 0) * (c.quantity || 1);
  });

  return {
    main_count: main.reduce((s, c) => s + (c.quantity || 1), 0),
    extra_count: extra.reduce((s, c) => s + (c.quantity || 1), 0),
    side_count: side.reduce((s, c) => s + (c.quantity || 1), 0),
    monster_count: monsterCount,
    spell_count: spellCount,
    trap_count: trapCount,
    total_price: Number(totalPrice.toFixed(2))
  };
};

async function seed() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected successfully!');

  // 1. Chèn hoặc cập nhật các lá bài mới vào DB
  console.log(`Upserting ${NEW_CARDS.length} authentic cards for K9, Kewl Tune, and Mitsurugi...`);
  for (const cardData of NEW_CARDS) {
    await Card.findOneAndUpdate(
      { id: cardData.id },
      { $set: cardData },
      { upsert: true, new: true }
    );
  }
  console.log('All new cards upserted successfully!');

  // Lấy các staple card thông dụng trong DB để build full 40/15/15 deck hoàn chỉnh
  const stapleIds = [
    14558127, // Ash Blossom
    10045474, // Infinite Impermanence
    24224830, // Called by the Grave
    65681983, // Crossout Designator
    23434538, // Maxx "C"
    25311006, // Triple Tactics Talent
    73628505, // Terraforming
    84013237, // Number 39: Utopia
    90809975, // Toadally Awesome
    48130397, // Super Polymerization
    38342335, // Baronne de Fleur
    8763963,  // S:P Little Knight
    27279764, // Nibiru, the Primal Being
    97268402  // Effect Veiler
  ];

  const staples = await Card.find({ id: { $in: stapleIds } }).lean();
  const stapleMap = new Map();
  staples.forEach((c) => stapleMap.set(c.id, c));

  const getStaple = (id, fallbackName, fallbackType, fallbackPrice) => {
    const found = stapleMap.get(id);
    if (found) return found;
    return {
      id,
      name: fallbackName,
      type: fallbackType,
      min_price: fallbackPrice,
      card_images: [{
        image_url: `https://images.ygoprodeck.com/images/cards/${id}.jpg`,
        image_url_small: `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`
      }]
    };
  };

  const ashBlossom = getStaple(14558127, 'Ash Blossom & Joyous Spring', 'Tuner Monster', 0.47);
  const imperm = getStaple(10045474, 'Infinite Impermanence', 'Trap Card', 0.33);
  const calledBy = getStaple(24224830, 'Called by the Grave', 'Spell Card', 0.08);
  const crossout = getStaple(65681983, 'Crossout Designator', 'Spell Card', 0.24);
  const maxxC = getStaple(23434538, 'Maxx "C"', 'Effect Monster', 1.62);
  const ttt = getStaple(25311006, 'Triple Tactics Talent', 'Spell Card', 0.24);
  const terraforming = getStaple(73628505, 'Terraforming', 'Spell Card', 0.05);
  const baronne = getStaple(38342335, 'Baronne de Fleur', 'Synchro Monster', 0.95);
  const spLittleKnight = getStaple(8763963, 'S:P Little Knight', 'Link Monster', 14.50);
  const nibiru = getStaple(27279764, 'Nibiru, the Primal Being', 'Effect Monster', 0.75);
  const veiler = getStaple(97268402, 'Effect Veiler', 'Tuner Monster', 0.20);

  // Map lá bài mới theo name
  const newCardMap = new Map();
  NEW_CARDS.forEach((c) => newCardMap.set(c.name, c));

  // ==========================================
  // DECK 1: K9 Mitsurugi Ritual Control (Supreme Darkness Tier 1 Meta)
  // ==========================================
  const d1Main = [
    // Mitsurugi core (17 lá)
    createCardItem(newCardMap.get('Ame no Habakiri no Mitsurugi'), 3),
    createCardItem(newCardMap.get('Ame no Murakumo no Mitsurugi'), 2),
    createCardItem(newCardMap.get('Futsu no Mitama no Mitsurugi'), 1),
    createCardItem(newCardMap.get('Mitsurugi no Miko, Wousu'), 3),
    createCardItem(newCardMap.get('Mitsurugi no Mikoto, Kusanagi'), 3),
    createCardItem(newCardMap.get('Mitsurugi no Mikoto, Aramasa'), 2),
    createCardItem(newCardMap.get('Mitsurugi no Mikoto, Saji'), 2),
    createCardItem(newCardMap.get('Mitsurugi Ritual'), 3),
    createCardItem(newCardMap.get('Mitsurugi Mirror'), 2),
    createCardItem(newCardMap.get('Mitsurugi Sacred Boundary'), 2),
    createCardItem(newCardMap.get('Mitsurugi Prayers'), 2),
    createCardItem(newCardMap.get('Mitsurugi Great Purification'), 2),
    // K9 Engine (8 lá)
    createCardItem(newCardMap.get('A Case for K9'), 3),
    createCardItem(newCardMap.get('K9-17 Izuna'), 3),
    createCardItem(newCardMap.get('K9-ØØ Lupis'), 2),
    // Staples (6 lá)
    createCardItem(ashBlossom, 3),
    createCardItem(calledBy, 2),
    createCardItem(crossout, 1),
    createCardItem(imperm, 2)
  ]; // Total 40 lá

  const d1Extra = [
    createCardItem(newCardMap.get('K9-17 "Ripper"'), 2),
    createCardItem(newCardMap.get('K9-ØØ "Hound"'), 2),
    createCardItem(newCardMap.get('K9-EX "Werewolf"'), 2),
    createCardItem(spLittleKnight, 2),
    createCardItem(baronne, 1),
    {
      card_id: 90448279,
      name: 'Divine Arsenal AA-ZEUS - Sky Thunder',
      quantity: 1,
      card_type: 'XYZ Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/90448279.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/90448279.jpg',
      price: 15.50
    },
    {
      card_id: 97631303,
      name: 'Super Starslayer TY-PHON - Sky Crisis',
      quantity: 1,
      card_type: 'XYZ Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/97631303.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/97631303.jpg',
      price: 12.00
    },
    {
      card_id: 21044178,
      name: 'Abyss Dweller',
      quantity: 1,
      card_type: 'XYZ Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/21044178.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/21044178.jpg',
      price: 0.80
    },
    {
      card_id: 58820853,
      name: 'Artifact Durendal',
      quantity: 1,
      card_type: 'XYZ Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/58820853.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/58820853.jpg',
      price: 1.20
    },
    {
      card_id: 58069384,
      name: 'I:P Masquerena',
      quantity: 1,
      card_type: 'Link Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/58069384.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/58069384.jpg',
      price: 3.50
    },
    {
      card_id: 4280258,
      name: 'Knightmare Phoenix',
      quantity: 1,
      card_type: 'Link Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/4280258.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/4280258.jpg',
      price: 0.40
    }
  ]; // Total 15 lá

  const d1Side = [
    createCardItem(nibiru, 3),
    createCardItem(ttt, 2),
    createCardItem(veiler, 3),
    {
      card_id: 15693423,
      name: 'Droll & Lock Bird',
      quantity: 3,
      card_type: 'Effect Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/15693423.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/15693423.jpg',
      price: 0.35
    },
    {
      card_id: 18144506,
      name: 'Harpie\'s Feather Duster',
      quantity: 1,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/18144506.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/18144506.jpg',
      price: 2.10
    },
    {
      card_id: 72302403,
      name: 'Swords of Concealing Light',
      quantity: 3,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/72302403.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/72302403.jpg',
      price: 0.20
    }
  ]; // Total 15 lá

  const deck1 = {
    name: 'K9 Mitsurugi Ritual Control (Tier 1 Meta)',
    slug: 'k9-mitsurugi-ritual-control',
    description: 'Chiến thuật phối hợp đỉnh cao giữa tộc bài Thần Kiếm Mitsurugi (Ritual Reptile) và biệt đội chấp pháp K9 (Rank 5/9 Xyz). Sử dụng "A Case for K9" để tìm kiếm K9-17 Izuna cho các pha phản đòn Turn 0 chớp nhoáng, đồng thời triệu hồi thần kiếm Ame no Habakiri no Mitsurugi áp chế tuyệt đối sàn đấu.',
    category: 'Tournament Meta',
    format: 'TCG',
    archetype: 'Mitsurugi',
    author: 'YGO Master Pro',
    tournament: 'YCS Supreme Darkness 2026 Champion',
    cover_card_id: 101207031,
    cover_card_name: 'Ame no Habakiri no Mitsurugi',
    cover_image_url: 'https://images.ygoprodeck.com/images/cards/101207031.jpg',
    main_deck: d1Main,
    extra_deck: d1Extra,
    side_deck: d1Side,
    stats: calculateStats(d1Main, d1Extra, d1Side),
    is_featured: true,
    likes: 128,
    views: 1420
  };

  // ==========================================
  // DECK 2: Kewl Tune Synchro Beat Turbo (Crossover Breakers)
  // ==========================================
  const d2Main = [
    // Kewl Tune Core (21 lá)
    createCardItem(newCardMap.get('Kewl Tune Cue'), 3),
    createCardItem(newCardMap.get('Kewl Tune Rotary'), 3),
    createCardItem(newCardMap.get('Kewl Tune Reco'), 3),
    createCardItem(newCardMap.get('Kewl Tune Clip'), 3),
    createCardItem(newCardMap.get('Kewl Tune Mix'), 3),
    createCardItem(newCardMap.get('JJ "Kewl Tune"'), 3),
    createCardItem(newCardMap.get('Kewl Tune Playlist'), 3),
    createCardItem(newCardMap.get('Kewl Tune Drop'), 2),
    // Staples & Extenders (17 lá)
    createCardItem(ashBlossom, 3),
    createCardItem(veiler, 3),
    createCardItem(terraforming, 1),
    createCardItem(calledBy, 2),
    createCardItem(crossout, 1),
    createCardItem(ttt, 2),
    createCardItem(imperm, 3),
    {
      card_id: 67723438,
      name: 'Emergency Teleport',
      quantity: 2,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/67723438.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/67723438.jpg',
      price: 0.45
    }
  ]; // Total 40 lá

  const d2Extra = [
    createCardItem(newCardMap.get('Kewl Tune B2B'), 3),
    createCardItem(baronne, 1),
    {
      card_id: 34086406,
      name: 'Chaos Angel',
      quantity: 2,
      card_type: 'Synchro Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/34086406.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/34086406.jpg',
      price: 18.00
    },
    {
      card_id: 74586817,
      name: 'PSY-Framelord Omega',
      quantity: 1,
      card_type: 'Synchro Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/74586817.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/74586817.jpg',
      price: 1.50
    },
    {
      card_id: 79606837,
      name: 'Herald of the Arc Light',
      quantity: 2,
      card_type: 'Synchro Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/79606837.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/79606837.jpg',
      price: 0.35
    },
    {
      card_id: 65305468,
      name: 'F.A. Dawn Dragster',
      quantity: 1,
      card_type: 'Synchro Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/65305468.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/65305468.jpg',
      price: 0.50
    },
    createCardItem(spLittleKnight, 2),
    createCardItem(stapleMap.get(84013237) || { id: 84013237, name: 'Number 39: Utopia', min_price: 0.3, card_images: [] }, 1),
    {
      card_id: 68597372,
      name: 'Accesscode Talker',
      quantity: 1,
      card_type: 'Link Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/68597372.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/68597372.jpg',
      price: 15.00
    },
    {
      card_id: 58069384,
      name: 'I:P Masquerena',
      quantity: 1,
      card_type: 'Link Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/58069384.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/58069384.jpg',
      price: 3.50
    }
  ]; // Total 15 lá

  const d2Side = [
    createCardItem(nibiru, 3),
    {
      card_id: 24094653,
      name: 'Polymerization',
      quantity: 1,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/24094653.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/24094653.jpg',
      price: 0.15
    },
    {
      card_id: 48130397,
      name: 'Super Polymerization',
      quantity: 3,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/48130397.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/48130397.jpg',
      price: 2.06
    },
    {
      card_id: 73828446,
      name: 'Cosmic Cyclone',
      quantity: 3,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/73828446.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/73828446.jpg',
      price: 0.25
    },
    {
      card_id: 82738444,
      name: 'Ghost Ogre & Snow Rabbit',
      quantity: 3,
      card_type: 'Tuner Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/82738444.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/82738444.jpg',
      price: 0.40
    },
    {
      card_id: 18144506,
      name: 'Harpie\'s Feather Duster',
      quantity: 1,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/18144506.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/18144506.jpg',
      price: 2.10
    },
    {
      card_id: 5318639,
      name: 'Mystical Space Typhoon',
      quantity: 1,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/5318639.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/5318639.jpg',
      price: 0.10
    }
  ]; // Total 15 lá

  const deck2 = {
    name: 'Kewl Tune Synchro Beat Turbo',
    slug: 'kewl-tune-synchro-beat-turbo',
    description: 'Chiến thuật độc nhất vô nhị từ hộp Crossover Breakers với toàn bộ quái thú đều là Tuner. Tận dụng sàn diễn JJ "Kewl Tune" và playlist âm nhạc để tạo ra chuỗi Synchro liên hoàn không giới hạn, triệu hồi DJ chủ bài Kewl Tune B2B ném toàn bộ bài đối phương ngược về bộ bài theo nhịp điệu!',
    category: 'Top Archetype',
    format: 'TCG',
    archetype: 'Kewl Tune',
    author: 'DJ Synchro Beat',
    tournament: 'Crossover Breakers Launch Event 1st Place',
    cover_card_id: 101208041,
    cover_card_name: 'Kewl Tune B2B',
    cover_image_url: 'https://images.ygoprodeck.com/images/cards/101208041.jpg',
    main_deck: d2Main,
    extra_deck: d2Extra,
    side_deck: d2Side,
    stats: calculateStats(d2Main, d2Extra, d2Side),
    is_featured: true,
    likes: 95,
    views: 980
  };

  // ==========================================
  // DECK 3: Pure K9 Rank 5/9 Justice Hunters (Master Duel)
  // ==========================================
  const d3Main = [
    // K9 Core (23 lá)
    createCardItem(newCardMap.get('K9-17 Izuna'), 3),
    createCardItem(newCardMap.get('K9-ØØ Lupis'), 3),
    createCardItem(newCardMap.get('K9-66a Jokul'), 3),
    createCardItem(newCardMap.get('K9-66b Lantern'), 3),
    createCardItem(newCardMap.get('A Case for K9'), 3),
    createCardItem(newCardMap.get('K9-X Forced Release'), 3),
    createCardItem(newCardMap.get('K9-LC Release Restraint'), 3),
    createCardItem(newCardMap.get('K9-EW Special Release Experiment'), 2),
    // Master Duel Staples (17 lá)
    createCardItem(maxxC, 3),
    createCardItem(ashBlossom, 3),
    createCardItem(calledBy, 2),
    createCardItem(crossout, 1),
    createCardItem(imperm, 3),
    createCardItem(ttt, 2),
    {
      card_id: 84211599,
      name: 'Pot of Prosperity',
      quantity: 2,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/84211599.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/84211599.jpg',
      price: 2.50
    },
    {
      card_id: 18144506,
      name: 'Harpie\'s Feather Duster',
      quantity: 1,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/18144506.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/18144506.jpg',
      price: 2.10
    }
  ]; // Total 40 lá

  const d3Extra = [
    createCardItem(newCardMap.get('K9-17 "Ripper"'), 3),
    createCardItem(newCardMap.get('K9-ØØ "Hound"'), 3),
    createCardItem(newCardMap.get('K9-EX "Werewolf"'), 3),
    {
      card_id: 90448279,
      name: 'Divine Arsenal AA-ZEUS - Sky Thunder',
      quantity: 1,
      card_type: 'XYZ Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/90448279.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/90448279.jpg',
      price: 15.50
    },
    {
      card_id: 97631303,
      name: 'Super Starslayer TY-PHON - Sky Crisis',
      quantity: 1,
      card_type: 'XYZ Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/97631303.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/97631303.jpg',
      price: 12.00
    },
    {
      card_id: 58820853,
      name: 'Artifact Durendal',
      quantity: 1,
      card_type: 'XYZ Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/58820853.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/58820853.jpg',
      price: 1.20
    },
    {
      card_id: 21044178,
      name: 'Abyss Dweller',
      quantity: 1,
      card_type: 'XYZ Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/21044178.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/21044178.jpg',
      price: 0.80
    },
    createCardItem(spLittleKnight, 2)
  ]; // Total 15 lá

  const d3Side = [
    createCardItem(nibiru, 3),
    createCardItem(veiler, 3),
    {
      card_id: 73828446,
      name: 'Cosmic Cyclone',
      quantity: 3,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/73828446.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/73828446.jpg',
      price: 0.25
    },
    {
      card_id: 15693423,
      name: 'Droll & Lock Bird',
      quantity: 3,
      card_type: 'Effect Monster',
      image_url: 'https://images.ygoprodeck.com/images/cards/15693423.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/15693423.jpg',
      price: 0.35
    },
    {
      card_id: 48130397,
      name: 'Super Polymerization',
      quantity: 3,
      card_type: 'Spell Card',
      image_url: 'https://images.ygoprodeck.com/images/cards/48130397.jpg',
      image_url_small: 'https://images.ygoprodeck.com/images/cards_small/48130397.jpg',
      price: 2.06
    }
  ]; // Total 15 lá

  const deck3 = {
    name: 'Pure K9 Rank 5/9 Justice Hunters',
    slug: 'pure-k9-rank-5-9-justice-hunters',
    description: 'Bộ bài thuần K9 cảnh binh điều tra tội phạm tập trung vào khả năng triệu hồi Xyz Rank 5 tốc độ cao và thăng cấp lên K9-EX "Werewolf" Rank 9 để trục xuất úp mặt 2 lá bài đối phương. Khắc tinh cứng của các chiến thuật combo dài dòng trong môi trường thi đấu Master Duel.',
    category: 'Master Duel',
    format: 'Master Duel',
    archetype: 'K9',
    author: 'Judge K9 Special Ops',
    tournament: 'Master Duel Master I Ranked',
    cover_card_id: 101207046,
    cover_card_name: 'K9-EX "Werewolf"',
    cover_image_url: 'https://images.ygoprodeck.com/images/cards/101207046.jpg',
    main_deck: d3Main,
    extra_deck: d3Extra,
    side_deck: d3Side,
    stats: calculateStats(d3Main, d3Extra, d3Side),
    is_featured: true,
    likes: 88,
    views: 860
  };

  const newDecks = [deck1, deck2, deck3];

  console.log(`Upserting ${newDecks.length} competitive decks for K9, Kewl Tune, and Mitsurugi...`);
  for (const deckData of newDecks) {
    const res = await Deck.findOneAndUpdate(
      { slug: deckData.slug },
      { $set: deckData },
      { upsert: true, new: true }
    );
    console.log(`Deck [${res.name}] upserted: Main=${res.stats.main_count}, Extra=${res.stats.extra_count}, Side=${res.stats.side_count}, Total Price=$${res.stats.total_price}`);
  }

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

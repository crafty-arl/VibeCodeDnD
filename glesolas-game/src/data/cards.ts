import type { LoreCard } from '@/types/game';

// TPG-nerdy card deck with tabletop gaming references
export const LORE_DECK: LoreCard[] = [
  // Characters
  {
    id: 'char_001',
    name: 'Veteran Dice Hoarder',
    type: 'Character',
    stats: { might: 2, fortune: 3, cunning: 1 },
    rarity: 'Common',
    flavor: 'Carries enough d20s to open a shop. Believes nat 1s are personal attacks.',
    preferredPath: 'fortune',
    dialogue: {
      onPlay: ['*Rolls lucky d20*', 'This one rolled a 20 last week...', 'Trust the dice!'],
      onWin: ['NATURAL 20!', 'Told you this die was lucky!', 'The dice gods smile upon us!'],
      onLose: ['Nat 1... of course.', '*Throws dice across room*', 'These dice are CURSED!'],
      onKeyStat: ['Perfect roll! Just as planned.', 'The math checks out!'],
      onNonKeyStat: ['We won, but... wrong approach.', 'Not how I would\'ve rolled it.']
    }
  },
  {
    id: 'char_002',
    name: 'Forever-GM',
    type: 'Character',
    stats: { might: 1, fortune: 1, cunning: 4 },
    rarity: 'Rare',
    flavor: 'Has run 47 campaigns. Finished zero. Dreams of being a player.',
    preferredPath: 'cunning',
    dialogue: {
      onPlay: ['*Sighs* Alright, let\'s see how you mess this up...', 'I\'ve run this encounter 47 times...', 'Please tell me you have a plan.'],
      onWin: ['Surprisingly competent!', 'You actually... won? Huh.', 'Not bad. Not bad at all.'],
      onLose: ['Saw that coming.', 'Classic TPK energy.', '*Makes notes for future campaign*'],
      onKeyStat: ['FINALLY! Someone who plays smart!', 'By the book. Exactly as it should be.'],
      onNonKeyStat: ['You won, but... that was messy.', 'Suboptimal. We could\'ve done better.']
    }
  },
  {
    id: 'char_003',
    name: 'Rules Lawyer',
    type: 'Character',
    stats: { might: 0, fortune: 2, cunning: 4 },
    rarity: 'Uncommon',
    flavor: '"Actually, according to page 237..."',
    preferredPath: 'cunning',
    dialogue: {
      onPlay: ['"Actually, according to page 237..."', 'Let me check the rules...', 'Technically speaking...'],
      onWin: ['Perfectly legal!', 'By the rules, we succeed!', 'Page 237 was correct after all!'],
      onLose: ['That violates section 4.2!', 'The rules clearly state...', 'I TOLD you page 237—'],
      onKeyStat: ['Textbook perfect!', 'Exactly as the rules intended!'],
      onNonKeyStat: ['Legal, but... not optimal.', 'That\'s... technically allowed, I guess.']
    }
  },
  {
    id: 'char_004',
    name: 'Chaotic Murder Hobo',
    type: 'Character',
    stats: { might: 4, fortune: 1, cunning: 1 },
    rarity: 'Common',
    flavor: 'Solution to every problem: violence. Backup plan: more violence.',
    preferredPath: 'might',
    dialogue: {
      onPlay: ['TIME TO SMASH!', 'I attack everything!', 'VIOLENCE SOLVES EVERYTHING!'],
      onWin: ['YEAH! MORE SMASHING!', 'Did we loot the bodies?', 'THAT WAS AWESOME!'],
      onLose: ['We should\'ve hit it harder!', 'Next time, MORE violence!', 'Ow.'],
      onKeyStat: ['PERFECT SMASH!', 'That\'s how you do it!'],
      onNonKeyStat: ['We won but... no smashing?', 'That was BORING!']
    }
  },
  {
    id: 'char_005',
    name: 'Minmaxed Optimizer',
    type: 'Character',
    stats: { might: 3, fortune: 2, cunning: 2 },
    rarity: 'Uncommon',
    flavor: 'Spent 6 hours on character creation. Has spreadsheets.',
    preferredPath: 'might',
    dialogue: {
      onPlay: ['According to my calculations...', '*Pulls out spreadsheet*', 'Let me check the DPS...'],
      onWin: ['Optimal outcome achieved!', 'Just as my spreadsheet predicted!', '127.3% efficiency!'],
      onLose: ['This doesn\'t match my simulations!', 'I need to recalculate...', 'The math was PERFECT!'],
      onKeyStat: ['Maximum efficiency!', 'Peak optimization achieved!'],
      onNonKeyStat: ['Suboptimal DPS...', 'That wasn\'t in my calculations.']
    }
  },
  {
    id: 'char_006',
    name: 'The One Who Actually Reads Lore',
    type: 'Character',
    stats: { might: 1, fortune: 2, cunning: 3 },
    rarity: 'Rare',
    flavor: 'Knows the campaign setting better than the GM.',
    preferredPath: 'cunning',
    dialogue: {
      onPlay: ['According to the lore...', 'I read about this in Chapter 12!', 'Fun fact about this place...'],
      onWin: ['Just like in the sourcebook!', 'The lore predicted this!', 'Knowledge is power!'],
      onLose: ['This contradicts the established lore!', 'But the wiki said...', 'Did you even READ the supplement?'],
      onKeyStat: ['Lore-accurate victory!', 'Exactly as the legends foretold!'],
      onNonKeyStat: ['We won, but that\'s not canon...', 'The lore suggested a different approach.']
    }
  },

  // Items
  {
    id: 'item_001',
    name: 'Cursed d20 (Always Rolls 1)',
    type: 'Item',
    stats: { might: 0, fortune: 4, cunning: 0 },
    rarity: 'Legendary',
    flavor: 'Statistically impossible. Mathematically cursed. Emotionally devastating.',
  },
  {
    id: 'item_002',
    name: 'Bag of Holding (Full of Snacks)',
    type: 'Item',
    stats: { might: 1, fortune: 2, cunning: 2 },
    rarity: 'Common',
    flavor: 'Contains chips, dice, character sheets, and a fossilized pizza slice.',
  },
  {
    id: 'item_003',
    name: 'Emergency Character Sheet',
    type: 'Item',
    stats: { might: 2, fortune: 3, cunning: 1 },
    rarity: 'Common',
    flavor: 'Pre-rolled backup character. You KNOW you\'ll need it.',
  },
  {
    id: 'item_004',
    name: 'The Broken Eraser',
    type: 'Item',
    stats: { might: 1, fortune: 1, cunning: 3 },
    rarity: 'Uncommon',
    flavor: 'Smudges more than it erases. Essential to every session.',
  },
  {
    id: 'item_005',
    name: 'Miniature Painted at 3 AM',
    type: 'Item',
    stats: { might: 2, fortune: 2, cunning: 2 },
    rarity: 'Rare',
    flavor: 'Questionable quality. Undeniable passion.',
  },
  {
    id: 'item_006',
    name: 'Laminated GM Screen',
    type: 'Item',
    stats: { might: 1, fortune: 0, cunning: 4 },
    rarity: 'Uncommon',
    flavor: 'Covered in sticky notes, coffee stains, and dark secrets.',
  },
  {
    id: 'item_007',
    name: 'Deck of Many Memes',
    type: 'Item',
    stats: { might: 0, fortune: 3, cunning: 2 },
    rarity: 'Rare',
    flavor: 'Summons ancient jpgs to derail serious moments.',
  },

  // Locations
  {
    id: 'loc_001',
    name: 'The FLGS (Friendly Local Game Store)',
    type: 'Location',
    stats: { might: 1, fortune: 3, cunning: 2 },
    rarity: 'Common',
    flavor: 'Smells like cardboard and broken dreams. Also, Magic packs.',
  },
  {
    id: 'loc_002',
    name: 'Dave\'s Mom\'s Basement',
    type: 'Location',
    stats: { might: 2, fortune: 2, cunning: 2 },
    rarity: 'Common',
    flavor: 'The sacred hall where legends are forged and pizza is consumed.',
  },
  {
    id: 'loc_003',
    name: 'Discord Voice Channel #3',
    type: 'Location',
    stats: { might: 0, fortune: 2, cunning: 3 },
    rarity: 'Uncommon',
    flavor: 'Echo. Lag. Someone\'s eating chips. Classic.',
  },
  {
    id: 'loc_004',
    name: 'The Table of Holding',
    type: 'Location',
    stats: { might: 3, fortune: 1, cunning: 1 },
    rarity: 'Rare',
    flavor: 'A 6-foot folding table bearing the weight of 200 sourcebooks.',
  },
  {
    id: 'loc_005',
    name: 'Campaign Graveyard',
    type: 'Location',
    stats: { might: 1, fortune: 1, cunning: 3 },
    rarity: 'Uncommon',
    flavor: 'Where unfinished campaigns go to haunt their GMs.',
  },
  {
    id: 'loc_006',
    name: 'Convention Hall (Saturday 2 PM)',
    type: 'Location',
    stats: { might: 2, fortune: 3, cunning: 2 },
    rarity: 'Rare',
    flavor: 'Peak chaos. Maximum dice. Questionable hygiene.',
  },
  {
    id: 'loc_007',
    name: 'Character Creation Limbo',
    type: 'Location',
    stats: { might: 0, fortune: 1, cunning: 4 },
    rarity: 'Legendary',
    flavor: 'Some say players are still picking backgrounds to this day.',
  },
];

// Utility functions
export function drawRandomCards(count: number, exclude: string[] = []): LoreCard[] {
  const availableCards = LORE_DECK.filter(card => !exclude.includes(card.id));
  const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getCardById(id: string): LoreCard | undefined {
  return LORE_DECK.find(card => card.id === id);
}

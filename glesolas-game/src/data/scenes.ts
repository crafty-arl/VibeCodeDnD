import type { SkillCheck, LoreCard, SkillPath } from '@/types/game';

// TPG-themed intro scenes (Mad-libs style)
export const INTRO_TEMPLATES = [
  '{character} stumbled into {location}, clutching {item}. The air smelled of old pizza and destiny.',
  'At {location}, {character} discovered {item} hidden beneath a pile of character sheets.',
  '{character} rolled initiative as {location} erupted in chaos. Good thing they brought {item}.',
  'Legend tells of {character} who sought {item} in the depths of {location}. This is that legend.',
  '{character} entered {location}, {item} in hand, ready to face whatever critical failures awaited.',
];

// Skill check challenges with TPG flavor
export const CHALLENGES: SkillCheck[] = [
  {
    scene: 'A heated rules debate erupts. The table splits into factions. The GM looks exhausted.',
    requirements: { might_req: 5, fortune_req: 4, cunning_req: 7 },
  },
  {
    scene: 'The dice betray you—three nat 1s in a row. The table goes silent. The GM smiles.',
    requirements: { might_req: 3, fortune_req: 8, cunning_req: 4 },
  },
  {
    scene: 'Someone knocked over the miniatures. Chaos reigns. Initiative order is lost.',
    requirements: { might_req: 6, fortune_req: 5, cunning_req: 5 },
  },
  {
    scene: 'The pizza arrives, but there\'s pineapple on it. The party must decide: eat or starve?',
    requirements: { might_req: 4, fortune_req: 6, cunning_req: 6 },
  },
  {
    scene: 'Someone brought up "edition wars." The ancient argument awakens once more.',
    requirements: { might_req: 7, fortune_req: 3, cunning_req: 6 },
  },
  {
    scene: 'The GM asks "Are you sure?" Everyone at the table freezes in fear.',
    requirements: { might_req: 5, fortune_req: 7, cunning_req: 5 },
  },
  {
    scene: 'A player forgot their dice. A stranger offers to lend theirs. Do you trust cursed dice?',
    requirements: { might_req: 4, fortune_req: 8, cunning_req: 4 },
  },
  {
    scene: 'The campaign notes are gone. Deleted. The USB stick corrupted. Panic ensues.',
    requirements: { might_req: 6, fortune_req: 4, cunning_req: 7 },
  },
  {
    scene: 'Someone brought a bard. They want to seduce the dragon. The GM sighs deeply.',
    requirements: { might_req: 3, fortune_req: 5, cunning_req: 8 },
  },
  {
    scene: 'The rulebook has 800 pages. The answer is on exactly none of them.',
    requirements: { might_req: 4, fortune_req: 5, cunning_req: 8 },
  },
  {
    scene: 'A random encounter appears: the one player who "doesn\'t believe in social cues."',
    requirements: { might_req: 5, fortune_req: 6, cunning_req: 6 },
  },
  {
    scene: 'Your character died. Again. Time to crack open the emergency backup sheet.',
    requirements: { might_req: 7, fortune_req: 6, cunning_req: 3 },
  },
];

// Resolution templates
export const RESOLUTION_TEMPLATES = {
  might: {
    success: [
      'With raw power and determination, you flip the table—metaphorically. The challenge crumbles.',
      'You channel your inner barbarian. The problem is solved through sheer force of will.',
      'No subtlety. No grace. Pure brute-force solution. It works. Somehow.',
    ],
    fumble: [
      'You try to power through, but strength alone isn\'t enough. The dice gods mock you.',
      'Your mighty effort falls short. Sometimes muscles can\'t solve everything.',
    ],
  },
  fortune: {
    success: [
      'Against all odds, the dice favor you. A nat 20 appears. The table erupts in cheers.',
      'Pure luck carries you through. The randomness of the universe smiles upon your roll.',
      'You didn\'t plan this. You didn\'t earn this. But the dice don\'t lie—you win.',
    ],
    fumble: [
      'The dice betray you at the worst possible moment. A critical failure echoes across the table.',
      'Luck abandons you. Your roll is so bad, the GM actually looks concerned.',
    ],
  },
  cunning: {
    success: [
      'Your wit shines through. A clever loophole, a brilliant strategy—the GM nods in approval.',
      'You outsmart the challenge with tactical genius. The rules lawyer in you beams with pride.',
      'Intelligence and creativity combine. Your solution is so elegant, the table applauds.',
    ],
    fumble: [
      'Your clever plan has one fatal flaw: it doesn\'t work. The GM chuckles darkly.',
      'Overthinking costs you. Sometimes the simple solution is the right one.',
    ],
  },
};

export function generateIntroScene(cards: LoreCard[]): string {
  const [character, item, location] = cards;
  const template = INTRO_TEMPLATES[Math.floor(Math.random() * INTRO_TEMPLATES.length)];

  return template
    .replace('{character}', character.name)
    .replace('{item}', item.name)
    .replace('{location}', location.name);
}

export function getRandomChallenge(): SkillCheck {
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
}

export function generateResolutionScene(path: SkillPath, success: boolean): string {
  const templates = RESOLUTION_TEMPLATES[path];
  const pool = success ? templates.success : templates.fumble;
  return pool[Math.floor(Math.random() * pool.length)];
}

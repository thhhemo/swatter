export type Difficulty = 'easy' | 'normal' | 'hard';

export type DifficultyInfo = {
  id: Difficulty;
  label: string;
  blurb: string;
  /** Multiplies the fly's speed. */
  speed: number;
  /** Multiplies how close to the middle of the fly a tap must land. */
  hit: number;
};

export const DIFFICULTIES: DifficultyInfo[] = [
  { id: 'easy', label: 'Easy', blurb: 'A slower fly and a roomier target. Good for a first read.', speed: 0.8, hit: 1.5 },
  { id: 'normal', label: 'Normal', blurb: 'The game as designed.', speed: 1, hit: 1 },
  { id: 'hard', label: 'Hard', blurb: 'A faster fly, and you really do have to hit the middle.', speed: 1.25, hit: 0.75 },
];

export const DEFAULT_DIFFICULTY: Difficulty = 'normal';

export function difficultyInfo(id: Difficulty): DifficultyInfo {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}

export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.some((d) => d.id === value);
}

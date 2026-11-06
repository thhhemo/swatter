import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_DIFFICULTY, isDifficulty, type Difficulty } from './difficulty';

const KEY = 'swatter.difficulty';

export async function loadDifficulty(): Promise<Difficulty> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return isDifficulty(value) ? value : DEFAULT_DIFFICULTY;
  } catch {
    return DEFAULT_DIFFICULTY;
  }
}

export async function saveDifficulty(value: Difficulty): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, value);
  } catch {
    // Not being able to remember the choice must never stop the game.
  }
}

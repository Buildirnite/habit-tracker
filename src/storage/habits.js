import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_KEY = 'habits';
const LOGS_KEY = 'habit_logs';

export async function saveHabits(habits) {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function loadHabits() {
  const data = await AsyncStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveLog(log) {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(log));
}

export async function loadLog() {
  const data = await AsyncStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : {};
}

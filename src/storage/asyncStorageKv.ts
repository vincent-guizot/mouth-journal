import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyValueStore } from './keyValueStore';

export const asyncStorageKv: KeyValueStore = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
  getAllKeys: () => AsyncStorage.getAllKeys(),
};

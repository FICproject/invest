import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: 'ci_investor_token',
  USER: 'ci_investor_user',
  BIOMETRICS_ENABLED: 'ci_biometrics_enabled',
  THEME_MODE: 'ci_theme_mode',
  CUSTOM_API_URL: 'ci_custom_api_url',
};

export const storage = {
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (e) {
      console.error('Failed to save token to storage', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (e) {
      console.error('Failed to get token from storage', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (e) {
      console.error('Failed to remove token', e);
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  async getUser<T>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to read user', e);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.error('Failed to remove user', e);
    }
  },

  async setBiometrics(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRICS_ENABLED, enabled ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to set biometrics flag', e);
    }
  },

  async isBiometricsEnabled(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRICS_ENABLED);
      return val === 'true';
    } catch (e) {
      return false;
    }
  },

  async setCustomApiUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_API_URL, url);
    } catch (e) {
      console.error('Failed to set custom API url', e);
    }
  },

  async getCustomApiUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_API_URL);
    } catch (e) {
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  },
};

export default storage;

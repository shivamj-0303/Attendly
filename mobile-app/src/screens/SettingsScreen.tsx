import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { Header } from '../components/Header';

interface AppSettings {
  notifyAttendanceMarked: boolean;
  notifyAbsent: boolean;
  notifyPresent: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifyAttendanceMarked: true,
  notifyAbsent: true,
  notifyPresent: false,
};

const STORAGE_KEY = '@app_settings';

export default function SettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true; // Prevent default behavior (exit app)
    });

    return () => backHandler.remove();
  }, [navigation]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      setIsSaving(true);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      // Note: In a real app, you might also want to sync these settings to the backend
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: () => saveSettings(DEFAULT_SETTINGS),
          style: 'destructive',
          text: 'Reset',
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[getStyles(theme).loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Header 
        title="Application Settings"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.scrollContent}>
        <View style={styles.content}>
          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingDescription}>
                Choose between light and dark mode
              </Text>
            </View>
            <View style={styles.themeToggleContainer}>
              <TouchableOpacity
                onPress={() => setThemeMode('light')}
                style={[
                  styles.themeOption,
                  themeMode === 'light' && styles.themeOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    themeMode === 'light' && styles.themeOptionTextActive,
                  ]}
                >
                  ☀️ Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setThemeMode('dark')}
                style={[
                  styles.themeOption,
                  themeMode === 'dark' && styles.themeOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    themeMode === 'dark' && styles.themeOptionTextActive,
                  ]}
                >
                  🌙 Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Attendance Notifications</Text>
              <Text style={styles.settingDescription}>
                Get notified when attendance is marked
              </Text>
            </View>
            <Switch
              onValueChange={(value) => handleToggle('notifyAttendanceMarked', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={settings.notifyAttendanceMarked ? '#2563eb' : '#f4f3f4'}
              value={settings.notifyAttendanceMarked}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Absent Notifications</Text>
              <Text style={styles.settingDescription}>
                Get notified when you are marked absent
              </Text>
            </View>
            <Switch
              disabled={!settings.notifyAttendanceMarked}
              onValueChange={(value) => handleToggle('notifyAbsent', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={settings.notifyAbsent ? '#2563eb' : '#f4f3f4'}
              value={settings.notifyAbsent && settings.notifyAttendanceMarked}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Present Notifications</Text>
              <Text style={styles.settingDescription}>
                Get notified when you are marked present
              </Text>
            </View>
            <Switch
              disabled={!settings.notifyAttendanceMarked}
              onValueChange={(value) => handleToggle('notifyPresent', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={settings.notifyPresent ? '#2563eb' : '#f4f3f4'}
              value={settings.notifyPresent && settings.notifyAttendanceMarked}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            disabled={isSaving}
            onPress={handleResetSettings}
            style={styles.resetButton}
          >
            {isSaving ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <Text style={styles.resetButtonText}>Reset to Default</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            💡 Changes are saved automatically
          </Text>
          <Text style={styles.infoText}>
            Notification settings require app permissions
          </Text>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  infoSection: {
    backgroundColor: theme.mode === 'light' ? '#eff6ff' : theme.colors.surface,
    borderRadius: 12,
    marginTop: 20,
    padding: 16,
  },
  infoText: {
    color: theme.colors.primary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.error,
    borderRadius: 12,
    borderWidth: 2,
    height: 50,
    justifyContent: 'center',
  },
  resetButtonText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingItem: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  themeOption: {
    backgroundColor: theme.colors.border,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 8,
  },
  themeOptionActive: {
    backgroundColor: theme.mode === 'light' ? '#dbeafe' : '#1e3a8a',
  },
  themeOptionText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  themeOptionTextActive: {
    color: theme.colors.primary,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    gap: 8,
    width: 160,
  },
});

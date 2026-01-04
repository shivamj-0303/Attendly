import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  DaySelector,
  EmptyState,
  FullScreenModal,
  Header,
  LoadingSpinner,
  StudentClassCard,
  ThreeTabBar,
} from '../components';
import type { StudentClassItem } from '../components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStudentTimetable } from '../hooks/useStudentTimetable';
import { ReportScreen } from './ReportScreen';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudentScreen() {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const {
    handleRefresh,
    isRefreshing,
    loadToday,
    loadWeek,
    selectedDayIndex,
    setSelectedDayIndex,
    todayClasses,
    weekClasses,
  } = useStudentTimetable();

  const [activeTab, setActiveTab] = useState<'report' | 'today' | 'week'>('today');
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<StudentClassItem | null>(null);
  const [slotDetailsOpen, setSlotDetailsOpen] = useState(false);

  const styles = getStyles(theme);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: async () => {
          await logout();
          setProfileOpen(false);
        },
        style: 'destructive',
        text: 'Logout',
      },
    ]);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'present':
        return theme.colors.primary;
      case 'absent':
        return theme.colors.error;
      case 'leave':
        return '#f59e0b';
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderTodayContent = () => {
    if (!todayClasses) {
      return <LoadingSpinner message="Loading timetable..." />;
    }

    if (todayClasses.length === 0) {
      return <EmptyState message="No timetable for today" />;
    }

    return (
      <FlatList
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 12 }}
        data={todayClasses}
        keyExtractor={(item) => item.id}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        renderItem={({ item }) => (
          <StudentClassCard
            item={item}
            onPress={() => {
              setSelectedSlot(item);
              setSlotDetailsOpen(true);
            }}
          />
        )}
      />
    );
  };

  const renderWeekContent = () => {
    const classes = weekClasses[selectedDayIndex] ?? [];
    if (classes.length === 0) {
      return <EmptyState message="No timetable for this day" />;
    }

    return (
      <FlatList
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 12 }}
        data={classes}
        keyExtractor={(item) => item.id}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        renderItem={({ item }) => (
          <StudentClassCard
            item={item}
            onPress={() => {
              setSelectedSlot(item);
              setSlotDetailsOpen(true);
            }}
          />
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header onProfilePress={() => setProfileOpen(true)} title="Attendly" userName={user?.name} />

      <View style={styles.content}>
        {activeTab === 'report' ? (
          <View style={styles.tabContent}>
            <ReportScreen />
          </View>
        ) : activeTab === 'today' ? (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            {renderTodayContent()}
          </View>
        ) : (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Week Timetable</Text>
            <DaySelector
              days={DAYS}
              onDaySelect={setSelectedDayIndex}
              selectedIndex={selectedDayIndex}
            />
            {renderWeekContent()}
          </View>
        )}
      </View>

      <ThreeTabBar activeTab={activeTab} onTabChange={setActiveTab} showReportTab />

      {/* Slot Details Modal */}
      <Modal animationType="slide" transparent visible={slotDetailsOpen}>
        <TouchableWithoutFeedback onPress={() => setSlotDetailsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.slotDetailsModal}>
                <Text style={styles.slotDetailsTitle}>Class Details</Text>

                {selectedSlot && (
                  <View style={styles.slotDetailsContent}>
                    <View style={styles.slotDetailRow}>
                      <Text style={styles.slotDetailLabel}>Subject:</Text>
                      <Text style={styles.slotDetailValue}>{selectedSlot.subject}</Text>
                    </View>

                    <View style={styles.slotDetailRow}>
                      <Text style={styles.slotDetailLabel}>Faculty:</Text>
                      <Text style={styles.slotDetailValue}>{selectedSlot.teacher}</Text>
                    </View>

                    <View style={styles.slotDetailRow}>
                      <Text style={styles.slotDetailLabel}>Time:</Text>
                      <Text style={styles.slotDetailValue}>
                        {selectedSlot.start} - {selectedSlot.end}
                      </Text>
                    </View>

                    <View style={styles.slotDetailRow}>
                      <Text style={styles.slotDetailLabel}>Attendance:</Text>
                      <View
                        style={[
                          styles.statusPillLarge,
                          { backgroundColor: getStatusColor(selectedSlot.status) },
                        ]}
                      >
                        <Text style={styles.statusTextLarge}>
                          {selectedSlot.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => setSlotDetailsOpen(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Profile Modal */}
      <FullScreenModal
        onClose={() => setProfileOpen(false)}
        title="Profile"
        visible={profileOpen}
      >
        <ScrollView contentContainerStyle={styles.profileContent}>
          <View style={styles.profileLargeCircle}>
            <Text style={styles.profileLargeText}>
              {user?.name?.charAt(0).toUpperCase() ?? 'S'}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{user?.name ?? 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Student ID:</Text>
              <Text style={styles.detailValue}>{user?.id ?? 'N/A'}</Text>
            </View>

            {user?.rollNumber && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Roll Number:</Text>
                <Text style={styles.detailValue}>{user.rollNumber}</Text>
              </View>
            )}

            {user?.registrationNumber && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Reg. Number:</Text>
                <Text style={styles.detailValue}>{user.registrationNumber}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{user?.email ?? 'N/A'}</Text>
            </View>

            {user?.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{user.phone}</Text>
              </View>
            )}

            {user?.classId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Class:</Text>
                <Text style={styles.detailValue}>Class {user.classId}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role:</Text>
              <Text style={styles.detailValue}>Student</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                setProfileOpen(false);
                navigation.navigate('Settings');
              }}
              style={styles.settingsButton}
            >
              <Text style={styles.buttonText}>Application Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setProfileOpen(false);
                navigation.navigate('PasswordReset');
              }}
              style={styles.resetButton}
            >
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.signoutButton}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </FullScreenModal>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  buttonContainer: {
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    marginTop: 16,
    paddingVertical: 14,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    width: 120,
  },
  detailRow: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  detailValue: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  profileContent: {
    padding: 20,
  },
  profileLargeCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    marginBottom: 24,
    width: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  deletePhotoButton: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deletePhotoText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  profileLargeText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    marginBottom: 12,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    marginBottom: 12,
    paddingVertical: 16,
  },
  signoutButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    paddingVertical: 16,
  },
  slotDetailLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    width: 100,
  },
  slotDetailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  slotDetailValue: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
  },
  slotDetailsContent: {
    marginTop: 20,
  },
  slotDetailsModal: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    maxWidth: 400,
    padding: 24,
    width: '100%',
  },
  slotDetailsTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  statusPillLarge: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusTextLarge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
});

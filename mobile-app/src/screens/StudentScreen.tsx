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
import { useAttendanceReport } from '../hooks/useAttendanceReport';
import { AttendanceCalendarScreen } from './AttendanceCalendarScreen';

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

  const [activeTab, setActiveTab] = useState<'calendar' | 'today' | 'week'>('today');
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<StudentClassItem | null>(null);
  
  // Fetch attendance report
  const { data: attendanceData, loading: attendanceLoading, error: attendanceError } = useAttendanceReport();
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
        {activeTab === 'calendar' ? (
          <View style={styles.tabContent}>
            <AttendanceCalendarScreen />
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

      <ThreeTabBar activeTab={activeTab} onTabChange={setActiveTab} showCalendarTab />

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
          {/* Header with Avatar and Icons */}
          <View style={styles.profileHeader}>
            {/* Pencil Icon Left - Profile Photo Upload */}
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Profile Photo',
                  'Profile photo upload feature will be implemented soon!',
                  [{ text: 'OK' }]
                );
              }}
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>✎</Text>
            </TouchableOpacity>

            {/* Avatar */}
            <View style={styles.profileLargeCircle}>
              <Text style={styles.profileLargeText}>
                {user?.name?.charAt(0).toUpperCase() ?? 'S'}
              </Text>
            </View>

            {/* Gear Icon Right - Open Settings */}
            <TouchableOpacity
              onPress={() => {
                setProfileOpen(false);
                setSettingsOpen(true);
              }}
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>⚙</Text>
            </TouchableOpacity>
          </View>

          {/* Name and Role Tag */}
          <Text style={styles.profileName}>{user?.name ?? 'Student'}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>STUDENT</Text>
          </View>

          {/* Attendance Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {attendanceLoading ? '...' : attendanceData ? `${Math.round(attendanceData.overallPercentage)}%` : 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {attendanceLoading ? '...' : attendanceData ? attendanceData.classesPresent : '0'}
              </Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {attendanceLoading ? '...' : attendanceData ? attendanceData.totalClasses - attendanceData.classesPresent : '0'}
              </Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
          </View>

          {/* Attendance Overview */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Attendance Overview</Text>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartText}>📊 Graph visualization</Text>
              <Text style={styles.chartSubtext}>Showing your attendance trend</Text>
            </View>
          </View>

          {/* Subject-wise Report */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Subject-wise Report</Text>
            
            {attendanceLoading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textSecondary }}>Loading subjects...</Text>
              </View>
            ) : attendanceError ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.error }}>Failed to load subjects</Text>
              </View>
            ) : attendanceData && attendanceData.subjectBreakdown && attendanceData.subjectBreakdown.length > 0 ? (
              attendanceData.subjectBreakdown.map((subject, index) => (
                <View key={index} style={styles.subjectRow}>
                  <Text style={styles.subjectName}>{subject.subjectName}</Text>
                  <View style={styles.subjectBarContainer}>
                    <View style={[styles.subjectBar, { width: `${Math.round(subject.percentage)}%` }]} />
                  </View>
                  <Text style={styles.subjectPercent}>{Math.round(subject.percentage)}%</Text>
                </View>
              ))
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textSecondary }}>No subject data available</Text>
              </View>
            )}
          </View>

          {/* Action Buttons - Removed from here, moved to Settings Modal */}
        </ScrollView>
      </FullScreenModal>

      {/* Settings Modal */}
      <FullScreenModal
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        visible={settingsOpen}
      >
        <ScrollView contentContainerStyle={styles.profileContent}>
          {/* Account Info Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{user?.name ?? 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email ?? 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Roll Number:</Text>
              <Text style={styles.infoValue}>{(user as any)?.rollNumber ?? 'N/A'}</Text>
            </View>
          </View>

          {/* Application Settings Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Application Settings</Text>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Notification Preferences</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Theme Settings</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Language</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                setSettingsOpen(false);
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
    color: theme.colors.primary,
  },
  profileLargeCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    width: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 12,
  },
  roleTag: {
    alignSelf: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  roleTagText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  sectionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartPlaceholder: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    marginTop: 12,
  },
  chartText: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  chartSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectName: {
    width: 100,
    fontSize: 14,
    color: theme.colors.text,
  },
  subjectBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  subjectBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  subjectPercent: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  settingArrow: {
    fontSize: 20,
    color: theme.colors.textSecondary,
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

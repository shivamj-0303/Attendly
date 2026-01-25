import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  ClassCard,
  DaySelector,
  EmptyState,
  FullScreenModal,
  Header,
  LoadingSpinner,
  StudentAttendanceRow,
  TabBar,
} from '../components';
import type { ClassItem, Student } from '../components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTeacherTimetable } from '../hooks/useTeacherTimetable';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TeacherScreen() {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const {
    handleRefresh,
    isRefreshing,
    loadClassStudents,
    loadToday,
    loadWeek,
    loadingStudents,
    markAllAbsent,
    saveAttendance,
    selectedDayIndex,
    setSelectedDayIndex,
    students,
    todayClasses,
    toggleStudentAttendance,
    weekClasses,
  } = useTeacherTimetable();

  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [attendanceMarkingOpen, setAttendanceMarkingOpen] = useState(false);
  const [classDetailsOpen, setClassDetailsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const styles = getStyles(theme);

  useEffect(() => {
    loadToday();
    loadWeek();
  }, [loadToday, loadWeek]);

  const handleClassPress = (item: ClassItem) => {
    setSelectedClass(item);
    setClassDetailsOpen(true);
  };

  const handleMarkAttendance = () => {
    if (activeTab !== 'today') {
      Alert.alert('Info', "Attendance can only be marked for today's classes");
      return;
    }
    if (!selectedClass) return;

    setClassDetailsOpen(false);
    setMenuOpen(false);
    loadClassStudents(selectedClass.classId, selectedClass.slotId);
    setAttendanceMarkingOpen(true);
  };

  const handleSaveAttendance = async () => {
    const success = await saveAttendance(selectedClass);
    if (success) {
      setAttendanceMarkingOpen(false);
    }
  };

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

  const renderTodayContent = () => {
    if (!todayClasses) {
      return <LoadingSpinner message="Loading timetable..." />;
    }

    if (todayClasses.length === 0) {
      return <EmptyState message="No classes scheduled for today" />;
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
          <ClassCard
            item={item}
            onMarkPress={() => {
              setSelectedClass(item);
              loadClassStudents(item.classId, item.slotId);
              setAttendanceMarkingOpen(true);
            }}
            onPress={() => handleClassPress(item)}
            showMarkButton={true}
          />
        )}
      />
    );
  };

  const renderWeekContent = () => {
    const classes = weekClasses[selectedDayIndex] ?? [];
    if (classes.length === 0) {
      return <EmptyState message="No classes scheduled for this day" />;
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
          <ClassCard item={item} onPress={() => handleClassPress(item)} showMarkButton={false} />
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header onProfilePress={() => setProfileOpen(true)} title="Attendly - Teacher" userName={user?.name} />

      <View style={styles.content}>
        {activeTab === 'today' ? (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            {renderTodayContent()}
          </View>
        ) : (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Week Schedule</Text>
            <DaySelector
              days={DAYS}
              onDaySelect={setSelectedDayIndex}
              selectedIndex={selectedDayIndex}
            />
            {renderWeekContent()}
          </View>
        )}
      </View>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Class Details Modal */}
      <Modal animationType="slide" transparent visible={classDetailsOpen}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <View style={styles.detailsModalHeader}>
              <Text style={styles.detailsModalTitle}>Class Details</Text>
              <TouchableOpacity onPress={() => setClassDetailsOpen(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.classInfoSection}>
                <View style={styles.classInfoRow}>
                  <Text style={styles.label}>Class:</Text>
                  <Text style={styles.value}>{selectedClass?.className}</Text>
                </View>

                <View style={styles.classInfoRow}>
                  <Text style={styles.label}>Subject:</Text>
                  <Text style={styles.value}>{selectedClass?.subject}</Text>
                </View>

                <View style={styles.classInfoRow}>
                  <Text style={styles.label}>Room:</Text>
                  <Text style={styles.value}>{selectedClass?.room}</Text>
                </View>

                <View style={styles.classInfoRow}>
                  <Text style={styles.label}>Time:</Text>
                  <Text style={styles.value}>
                    {selectedClass?.start} - {selectedClass?.end}
                  </Text>
                </View>

                {selectedClass?.dayOfWeek && (
                  <View style={styles.classInfoRow}>
                    <Text style={styles.label}>Day:</Text>
                    <Text style={styles.value}>{selectedClass.dayOfWeek}</Text>
                  </View>
                )}
              </View>

              {activeTab === 'today' && (
                <TouchableOpacity style={styles.markAttendanceBtn} onPress={handleMarkAttendance}>
                  <Text style={styles.markAttendanceBtnText}>Mark Attendance</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Attendance Marking Modal */}
      <Modal animationType="slide" transparent={false} visible={attendanceMarkingOpen}>
        <View style={styles.attendanceContainer}>
          <View style={styles.attendanceHeader}>
            <TouchableOpacity
              onPress={() => setAttendanceMarkingOpen(false)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.attendanceHeaderTitle}>{selectedClass?.className}</Text>
            <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.menuButton}>
              <Text style={styles.menuButtonText}>⋮</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.attendanceContent}>
            <Text style={styles.studentsTitle}>Students</Text>

            {loadingStudents ? (
              <LoadingSpinner message="Loading students..." />
            ) : (
              students.map((student) => (
                <StudentAttendanceRow
                  key={student.id}
                  onStatusChange={(status) => toggleStudentAttendance(student.id, status)}
                  student={student}
                />
              ))
            )}

            <View style={styles.bottomActions}>
              <TouchableOpacity
                onPress={() => setAttendanceMarkingOpen(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveAttendance} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal animationType="fade" transparent visible={menuOpen}>
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            onPress={() => setMenuOpen(false)}
            style={styles.menuOverlayTouchable}
          />
          <View style={styles.menuContent}>
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                setAttendanceMarkingOpen(false);
                setClassDetailsOpen(true);
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>Class Details</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              onPress={() => {
                setMenuOpen(false);
                markAllAbsent();
              }}
              style={styles.menuItem}
            >
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Mark All Absent</Text>
            </TouchableOpacity>
          </View>
        </View>
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
                {user?.name?.charAt(0).toUpperCase() || 'T'}
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
          <Text style={styles.profileName}>{user?.name ?? 'Teacher'}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>TEACHER</Text>
          </View>

          {/* Attendance Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>--</Text>
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
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                Attendance reports are available for students only.{'\n'}
                Use the class management section to mark attendance.
              </Text>
            </View>
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
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoValue}>{(user as any)?.departmentId ?? 'N/A'}</Text>
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
  attendanceContainer: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  attendanceContent: {
    padding: 20,
  },
  attendanceHeader: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  attendanceHeaderTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 36,
  },
  bottomActions: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    backgroundColor: theme.colors.border,
    borderRadius: 10,
    flex: 1,
    paddingVertical: 16,
  },
  cancelBtnText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  classInfoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  classInfoSection: {
    backgroundColor: theme.mode === 'light' ? '#f9fafb' : theme.colors.surface,
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
  },
  closeIcon: {
    color: theme.colors.textSecondary,
    fontSize: 24,
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
  detailsModalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 'auto',
    maxHeight: '70%',
    padding: 20,
  },
  detailsModalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailsModalTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  markAttendanceBtn: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    marginTop: 8,
    paddingVertical: 14,
  },
  markAttendanceBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  menuButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  menuButtonText: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  menuContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    elevation: 5,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  menuDivider: {
    backgroundColor: theme.colors.border,
    height: 1,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemDanger: {
    color: theme.colors.error,
  },
  menuItemText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  menuOverlay: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'flex-start',
    paddingRight: 16,
    paddingTop: 60,
  },
  menuOverlayTouchable: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
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
    marginBottom: 24,
    overflow: 'hidden',
    width: 120,
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
  profileLargeText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
  },
  profileImage: {
    borderRadius: 60,
    height: 120,
    width: 120,
  },
  deletePhotoButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  deletePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    marginBottom: 12,
    paddingVertical: 16,
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    marginBottom: 12,
    paddingVertical: 16,
  },
  saveBtn: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    flex: 1,
    paddingVertical: 16,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
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
  studentsTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  tabContent: {
    flex: 1,
  },
  value: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

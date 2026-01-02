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
import { useTeacherTimetable } from '../hooks/useTeacherTimetable';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TeacherScreen() {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
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
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

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
              <Text style={styles.backButtonText}>←</Text>
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
          <View style={styles.profileLargeCircle}>
            <Text style={styles.profileLargeText}>
              {user?.name?.charAt(0).toUpperCase() || 'T'}
            </Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{user?.name ?? 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Employee ID:</Text>
              <Text style={styles.detailValue}>{user?.id ?? 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mail:</Text>
              <Text style={styles.detailValue}>{user?.email ?? 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role:</Text>
              <Text style={styles.detailValue}>Teacher</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('PasswordReset')}
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

const styles = StyleSheet.create({
  attendanceContainer: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  attendanceContent: {
    padding: 20,
  },
  attendanceHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  attendanceHeaderTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backButtonText: {
    color: '#10b981',
    fontSize: 28,
    fontWeight: '700',
  },
  bottomActions: {
    borderTopColor: '#e5e7eb',
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
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 16,
  },
  cancelBtnText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  classInfoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  classInfoSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 16,
    padding: 12,
  },
  closeIcon: {
    color: '#6b7280',
    fontSize: 24,
    fontWeight: '700',
  },
  container: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  detailLabel: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    width: 120,
  },
  detailRow: {
    borderBottomColor: '#f3f4f6',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  detailValue: {
    color: '#111827',
    flex: 1,
    fontSize: 16,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailsModalContent: {
    backgroundColor: '#fff',
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
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  markAttendanceBtn: {
    alignItems: 'center',
    backgroundColor: '#10b981',
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
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  menuContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  menuDivider: {
    backgroundColor: '#e5e7eb',
    height: 1,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemDanger: {
    color: '#ef4444',
  },
  menuItemText: {
    color: '#111827',
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
  profileLargeCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#10b981',
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    marginBottom: 24,
    width: 120,
  },
  profileLargeText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 10,
    marginBottom: 12,
    paddingVertical: 16,
  },
  saveBtn: {
    alignItems: 'center',
    backgroundColor: '#10b981',
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
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  signoutButton: {
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 16,
  },
  studentsTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  tabContent: {
    flex: 1,
  },
  value: {
    color: '#111827',
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

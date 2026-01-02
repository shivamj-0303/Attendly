import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getTeacherTimetable, getClassStudents, markAttendance } from '../services/api';

type ClassItem = {
  id: string;
  slotId: number;
  classId: number;
  className: string;
  start: string;
  end: string;
  subject: string;
  room: string;
  dayOfWeek?: string;
};

type Student = {
  id: number;
  name: string;
  rollNumber: string;
  email: string;
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'NOT_MARKED';
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TeacherScreen() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [todayClasses, setTodayClasses] = useState<ClassItem[] | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [weekClasses, setWeekClasses] = useState<Record<number, ClassItem[]>>({});
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [classDetailsOpen, setClassDetailsOpen] = useState(false);
  const [attendanceMarkingOpen, setAttendanceMarkingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [editingSubject, setEditingSubject] = useState(false);
  const [editingRoom, setEditingRoom] = useState(false);
  const [tempSubject, setTempSubject] = useState('');
  const [tempRoom, setTempRoom] = useState('');

  useEffect(() => {
    loadToday();
    loadWeek();
  }, []);

  const loadToday = async () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const data = await getTeacherTimetable(dateStr);
      
      // Map API response to ClassItem format
      const mapped: ClassItem[] = (data || []).map((slot: any) => ({
        id: `${slot.id}-${slot.classId}`,
        slotId: slot.id,
        classId: slot.classId,
        className: slot.className || `Class ${slot.classId}`,
        start: slot.startTime ? slot.startTime.substring(0, 5) : '00:00',
        end: slot.endTime ? slot.endTime.substring(0, 5) : '00:00',
        subject: slot.subject || 'Unknown',
        room: slot.room || 'TBA',
      }));
      
      // Sort by start time
      mapped.sort((a, b) => a.start.localeCompare(b.start));
      
      setTodayClasses(mapped);
    } catch (err) {
      console.warn('Failed to load today timetable', err);
      setTodayClasses([]);
    }
  };

  const loadWeek = async () => {
    try {
      // Get the full week timetable
      const data = await getTeacherTimetable(); // No date = full week
      
      // Group by day of week
      const week: Record<number, ClassItem[]> = {};
      const dayMap: Record<string, number> = {
        MONDAY: 0,
        TUESDAY: 1,
        WEDNESDAY: 2,
        THURSDAY: 3,
        FRIDAY: 4,
        SATURDAY: 5,
      };
      
      // Initialize empty arrays for each day
      for (let i = 0; i < days.length; i++) {
        week[i] = [];
      }
      
      // Map API data to days
      (data || []).forEach((slot: any) => {
        const dayIndex = dayMap[slot.dayOfWeek];
        if (dayIndex !== undefined) {
          week[dayIndex].push({
            id: `${slot.id}-${slot.classId}`,
            slotId: slot.id,
            classId: slot.classId,
            className: slot.className || `Class ${slot.classId}`,
            start: slot.startTime ? slot.startTime.substring(0, 5) : '00:00',
            end: slot.endTime ? slot.endTime.substring(0, 5) : '00:00',
            subject: slot.subject || 'Unknown',
            room: slot.room || 'TBA',
            dayOfWeek: slot.dayOfWeek,
          });
        }
      });
      
      // Sort each day's classes by start time
      Object.keys(week).forEach((key) => {
        week[parseInt(key)].sort((a, b) => a.start.localeCompare(b.start));
      });
      
      setWeekClasses(week);
    } catch (err) {
      console.warn('Failed to load week timetable', err);
      // Keep empty week data
      const week: Record<number, ClassItem[]> = {};
      for (let i = 0; i < days.length; i++) {
        week[i] = [];
      }
      setWeekClasses(week);
    }
  };

  const loadClassStudents = async (classId: number, slotId: number) => {
    setLoadingStudents(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await getClassStudents(classId, slotId, today);
      setStudents(data || []);
    } catch (err) {
      console.warn('Failed to load students', err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleClassPress = (item: ClassItem) => {
    // Show class details when clicking on class
    setSelectedClass(item);
    setTempSubject(item.subject);
    setTempRoom(item.room);
    setClassDetailsOpen(true);
  };

  const handleMarkAttendance = () => {
    // Only allow attendance marking for today's classes
    if (activeTab !== 'today') {
      Alert.alert('Info', 'Attendance can only be marked for today\'s classes');
      return;
    }
    if (!selectedClass) return;
    
    setClassDetailsOpen(false);
    setMenuOpen(false);
    loadClassStudents(selectedClass.classId, selectedClass.slotId);
    setAttendanceMarkingOpen(true);
  };

  const markAllAbsent = () => {
    Alert.alert(
      'Mark All Absent',
      'This will mark all students as absent. You can then mark present students individually.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Absent',
          style: 'destructive',
          onPress: () => {
            setStudents(prev => prev.map(s => ({ ...s, attendanceStatus: 'ABSENT' as const })));
          },
        },
      ]
    );
  };

  const toggleStudentAttendance = (studentId: number, status: 'PRESENT' | 'ABSENT') => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, attendanceStatus: status } : s))
    );
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceData = students.map(s => ({
        timetableSlotId: selectedClass.slotId,
        studentId: s.id,
        date: today,
        status: s.attendanceStatus || 'ABSENT',
      }));

      await markAttendance(attendanceData);
      Alert.alert('Success', 'Attendance marked successfully');
      setAttendanceMarkingOpen(false);
      loadToday(); // Refresh
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark attendance');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          setProfileOpen(false);
        },
      },
    ]);
  };

  const openDrawer = () => {
    setProfileOpen(true);
  };

  const closeDrawer = () => {
    setProfileOpen(false);
  };

  const renderClass = ({ item }: { item: ClassItem }) => {
    return (
      <TouchableOpacity style={styles.classRow} onPress={() => handleClassPress(item)}>
        <View style={styles.timeCol}>
          <Text style={styles.timeText}>{item.start}</Text>
          <Text style={styles.timeSub}>{item.end}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.subjectText}>{item.subject}</Text>
          <Text style={styles.teacherText}>{item.className}</Text>
          <Text style={styles.roomText}>Room: {item.room}</Text>
        </View>
        {activeTab === 'today' && (
          <TouchableOpacity 
            style={styles.actionCol}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedClass(item);
              setTempSubject(item.subject);
              setTempRoom(item.room);
              loadClassStudents(item.classId, item.slotId);
              setAttendanceMarkingOpen(true);
            }}
          >
            <View style={styles.actionButton}>
              <Text style={styles.actionText}>Mark</Text>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderStudent = ({ item }: { item: Student }) => {
    return (
      <View style={styles.studentRow}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentRoll}>Roll: {item.rollNumber}</Text>
        </View>
        <View style={styles.attendanceButtons}>
          <TouchableOpacity
            style={[
              styles.attendanceBtn,
              styles.presentBtn,
              item.attendanceStatus === 'PRESENT' && styles.presentBtnActive,
            ]}
            onPress={() => toggleStudentAttendance(item.id, 'PRESENT')}
          >
            <Text
              style={[
                styles.attendanceBtnText,
                item.attendanceStatus === 'PRESENT' && styles.attendanceBtnTextActive,
              ]}
            >
              Present
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.attendanceBtn,
              styles.absentBtn,
              item.attendanceStatus === 'ABSENT' && styles.absentBtnActive,
            ]}
            onPress={() => toggleStudentAttendance(item.id, 'ABSENT')}
          >
            <Text
              style={[
                styles.attendanceBtnText,
                item.attendanceStatus === 'ABSENT' && styles.attendanceBtnTextActive,
              ]}
            >
              Absent
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const todayContent = () => {
    if (!todayClasses) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading timetable…</Text>
        </View>
      );
    }

    if (todayClasses.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No classes scheduled for today</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={todayClasses}
        keyExtractor={(i) => i.id}
        renderItem={renderClass}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 12 }}
      />
    );
  };

  const weekContent = () => {
    const classes = weekClasses[selectedDayIndex] || [];
    if (classes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No classes scheduled for this day</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={classes}
        keyExtractor={(i) => i.id}
        renderItem={renderClass}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ padding: 12 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Attendly - Teacher</Text>
        <TouchableOpacity style={styles.profileButton} onPress={openDrawer}>
          <View style={styles.profileIconCircle}>
            <Text style={styles.profileIconText}>
              {user?.name?.charAt(0).toUpperCase() || 'T'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'today' ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            {todayContent()}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Week Schedule</Text>
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.daysRow}
              >
                {days.map((d, i) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.dayButton,
                      i === selectedDayIndex && styles.dayButtonActive,
                    ]}
                    onPress={() => setSelectedDayIndex(i)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        i === selectedDayIndex && styles.dayTextActive,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={{ flex: 1 }}>
              {weekContent()}
            </View>
          </View>
        )}
      </View>

      {/* Bottom tabs */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('today')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'today' && styles.tabTextActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('week')}
        >
          <Text
            style={[styles.tabText, activeTab === 'week' && styles.tabTextActive]}
          >
            Week
          </Text>
        </TouchableOpacity>
      </View>

      {/* Class Details Modal */}
      <Modal visible={classDetailsOpen} animationType="slide" transparent>
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
                <TouchableOpacity 
                  style={styles.markAttendanceBtn}
                  onPress={handleMarkAttendance}
                >
                  <Text style={styles.markAttendanceBtnText}>Mark Attendance</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Attendance Marking Modal - Full Screen */}
      <Modal visible={attendanceMarkingOpen} animationType="slide" transparent={false}>
        <View style={styles.attendanceContainer}>
          {/* Header */}
          <View style={styles.attendanceHeader}>
            <TouchableOpacity onPress={() => setAttendanceMarkingOpen(false)} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.attendanceHeaderTitle}>{selectedClass?.className}</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(true)}
            >
              <Text style={styles.menuButtonText}>⋮</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <FlatList
            data={[{ key: 'content' }]}
            renderItem={() => (
              <View style={styles.attendanceContent}>
                {/* Students List */}
                <Text style={styles.studentsTitle}>Students</Text>

                {loadingStudents ? (
                  <Text style={styles.loadingText}>Loading students...</Text>
                ) : (
                  students.map((item) => (
                    <View key={item.id} style={styles.studentRow}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.name}</Text>
                        <Text style={styles.studentRoll}>Roll: {item.rollNumber}</Text>
                      </View>
                      <View style={styles.attendanceButtons}>
                        <TouchableOpacity
                          style={[
                            styles.attendanceBtn,
                            styles.presentBtn,
                            item.attendanceStatus === 'PRESENT' && styles.presentBtnActive,
                          ]}
                          onPress={() => toggleStudentAttendance(item.id, 'PRESENT')}
                        >
                          <Text
                            style={[
                              styles.attendanceBtnText,
                              item.attendanceStatus === 'PRESENT' && styles.attendanceBtnTextActive,
                            ]}
                          >
                            Present
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.attendanceBtn,
                            styles.absentBtn,
                            item.attendanceStatus === 'ABSENT' && styles.absentBtnActive,
                          ]}
                          onPress={() => toggleStudentAttendance(item.id, 'ABSENT')}
                        >
                          <Text
                            style={[
                              styles.attendanceBtnText,
                              item.attendanceStatus === 'ABSENT' && styles.attendanceBtnTextActive,
                            ]}
                          >
                            Absent
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}

                {/* Bottom Action Buttons */}
                <View style={styles.bottomActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setAttendanceMarkingOpen(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={saveAttendance}
                  >
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.key}
          />
        </View>
      </Modal>

      {/* Menu Modal (3 dots) */}
      <Modal visible={menuOpen} animationType="fade" transparent>
        <View style={styles.menuOverlay}>
          <TouchableOpacity 
            style={styles.menuOverlayTouchable}
            onPress={() => setMenuOpen(false)}
          />
          <View style={styles.menuContent}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setAttendanceMarkingOpen(false);
                setClassDetailsOpen(true);
              }}
            >
              <Text style={styles.menuItemText}>Class Details</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                markAllAbsent();
              }}
            >
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Mark All Absent</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Profile Modal - Full Screen */}
      <Modal visible={profileOpen} animationType="slide" transparent={false}>
        <View style={styles.profileContainer}>
          {/* Header */}
          <View style={styles.profileHeader}>
            <TouchableOpacity onPress={closeDrawer} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.profileHeaderTitle}>Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Profile Content */}
          <FlatList
            data={[{ key: 'content' }]}
            renderItem={() => (
              <View style={styles.profileContent}>
                {/* Profile Icon */}
                <View style={styles.profileLargeCircle}>
                  <Text style={styles.profileLargeText}>
                    {user?.name?.charAt(0).toUpperCase() || 'T'}
                  </Text>
                </View>

                {/* Teacher Details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{user?.name || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Employee ID:</Text>
                    <Text style={styles.detailValue}>{user?.id || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mail:</Text>
                    <Text style={styles.detailValue}>{user?.email || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Role:</Text>
                    <Text style={styles.detailValue}>Teacher</Text>
                  </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() =>
                      Alert.alert('Reset Password', 'Coming soon')
                    }
                  >
                    <Text style={styles.buttonText}>Reset Password</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.signoutButton}
                    onPress={handleLogout}
                  >
                    <Text style={styles.buttonText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.key}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    height: 74,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  appTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  profileButton: { width: 40, height: 40 },
  profileIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#6b7280' },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    elevation: 1,
  },
  timeCol: { width: 80 },
  timeText: { fontWeight: '700', color: '#111827' },
  timeSub: { color: '#6b7280', fontSize: 12 },
  infoCol: { flex: 1, paddingLeft: 8 },
  subjectText: { fontSize: 16, fontWeight: '600' },
  teacherText: { color: '#6b7280', marginTop: 4 },
  roomText: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  actionCol: { width: 80, alignItems: 'flex-end' },
  actionButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  bottomBar: {
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
  },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: '#6b7280', fontWeight: '600' },
  tabTextActive: { color: '#10b981' },
  daysRow: {
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 55,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  dayText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 13,
  },
  dayTextActive: { color: '#fff' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  // Attendance full screen styles
  attendanceContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  attendanceHeader: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#10b981',
    fontWeight: '700',
  },
  attendanceHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 28,
    color: '#111827',
    fontWeight: '700',
  },
  attendanceContent: {
    padding: 20,
  },
  // Profile full screen styles
  profileContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  profileHeader: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  profileContent: {
    padding: 20,
  },
  classInfoSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  classInfoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  label: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  studentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  loadingText: {
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  studentRoll: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  presentBtn: {
    borderColor: '#10b981',
    backgroundColor: '#fff',
  },
  presentBtnActive: {
    backgroundColor: '#10b981',
  },
  absentBtn: {
    borderColor: '#ef4444',
    backgroundColor: '#fff',
  },
  absentBtnActive: {
    backgroundColor: '#ef4444',
  },
  attendanceBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  attendanceBtnTextActive: {
    color: '#fff',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Class details modal styles
  detailsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 'auto',
    maxHeight: '70%',
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeIcon: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '700',
  },
  markAttendanceBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  markAttendanceBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Menu modal styles
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  profileLargeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  profileLargeText: { color: '#fff', fontSize: 48, fontWeight: '700' },
  detailsContainer: { marginBottom: 24 },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    width: 120,
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: { flex: 1, fontSize: 16, color: '#111827' },
  buttonContainer: { marginTop: 20 },
  resetButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  signoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

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
  TouchableWithoutFeedback,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getStudentTimetable, getStudentAttendance } from '../services/api';

type ClassItem = {
  id: string;
  start: string;
  end: string;
  subject: string;
  teacher: string;
  status: 'present' | 'absent' | 'leave' | 'not_marked';
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudentScreen() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [todayClasses, setTodayClasses] = useState<ClassItem[] | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [weekClasses, setWeekClasses] = useState<Record<number, ClassItem[]>>({});
  const [selectedSlot, setSelectedSlot] = useState<ClassItem | null>(null);
  const [slotDetailsOpen, setSlotDetailsOpen] = useState(false);

  useEffect(() => {
    loadToday();
    loadWeek();
  }, []);

  const loadToday = async () => {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const [timetableData, attendanceData] = await Promise.all([
        getStudentTimetable(dateStr),
        getStudentAttendance(dateStr)
      ]);
      
      const attendanceMap = new Map<number, string>();
      (attendanceData || []).forEach((att: any) => {
        if (att.timetableSlotId) {
          attendanceMap.set(att.timetableSlotId, att.status);
        }
      });
      
      const mapped: ClassItem[] = (timetableData || []).map((slot: any) => ({
        id: slot.id?.toString() || Math.random().toString(),
        start: slot.startTime ? slot.startTime.substring(0, 5) : '00:00',
        end: slot.endTime ? slot.endTime.substring(0, 5) : '00:00',
        subject: slot.subject || 'Unknown',
        teacher: slot.teacherName || 'TBA',
        status: (attendanceMap.get(slot.id) || 'NOT_MARKED').toLowerCase() as 'present' | 'absent' | 'leave' | 'not_marked',
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
      const data = await getStudentTimetable(); // No date = full week
      
      // For week view, we'll keep attendance check for today only
      // (Fetching attendance for all days would require week date range which isn't provided by the timetable API)
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const attendanceData = await getStudentAttendance(dateStr);
      
      // Create attendance map for today: timetableSlotId -> status
      const attendanceMap = new Map<number, string>();
      (attendanceData || []).forEach((att: any) => {
        if (att.timetableSlotId) {
          attendanceMap.set(att.timetableSlotId, att.status);
        }
      });
      
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
      
      // Map API data to days with attendance status
      (data || []).forEach((slot: any) => {
        const dayIndex = dayMap[slot.dayOfWeek];
        if (dayIndex !== undefined) {
          week[dayIndex].push({
            id: slot.id?.toString() || Math.random().toString(),
            start: slot.startTime ? slot.startTime.substring(0, 5) : '00:00',
            end: slot.endTime ? slot.endTime.substring(0, 5) : '00:00',
            subject: slot.subject || 'Unknown',
            teacher: slot.teacherName || 'TBA',
            status: (attendanceMap.get(slot.id) || 'NOT_MARKED').toLowerCase() as 'present' | 'absent' | 'leave' | 'not_marked',
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
    const color =
      item.status === 'present'
        ? '#10b981'
        : item.status === 'absent'
        ? '#ef4444'
        : item.status === 'leave'
        ? '#f59e0b'
        : '#9ca3af';

    return (
      <TouchableOpacity
        style={styles.classRow}
        onPress={() => {
          setSelectedSlot(item);
          setSlotDetailsOpen(true);
        }}
      >
        <View style={styles.timeCol}>
          <Text style={styles.timeText}>{item.start}</Text>
          <Text style={styles.timeSub}>{item.end}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.subjectText}>{item.subject}</Text>
          <Text style={styles.teacherText}>{item.teacher}</Text>
        </View>
        <View style={styles.statusCol}>
          <View style={[styles.statusPill, { backgroundColor: color }]}>
            <Text style={styles.statusText}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
          <Text style={styles.emptyText}>No timetable for today</Text>
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
          <Text style={styles.emptyText}>No timetable for this day</Text>
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
        <Text style={styles.appTitle}>Attendly</Text>
        <TouchableOpacity style={styles.profileButton} onPress={openDrawer}>
          <View style={styles.profileIconCircle}>
            <Text style={styles.profileIconText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'today' ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            {todayContent()}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Week Timetable</Text>
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

      {/* Slot Details Modal */}
      <Modal visible={slotDetailsOpen} animationType="slide" transparent>
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
                      <Text style={styles.slotDetailLabel}>Room:</Text>
                      <Text style={styles.slotDetailValue}>
                        {(selectedSlot as any).room || 'Not specified'}
                      </Text>
                    </View>
                    
                    <View style={styles.slotDetailRow}>
                      <Text style={styles.slotDetailLabel}>Attendance:</Text>
                      <View
                        style={[
                          styles.statusPillLarge,
                          {
                            backgroundColor:
                              selectedSlot.status === 'present'
                                ? '#10b981'
                                : selectedSlot.status === 'absent'
                                ? '#ef4444'
                                : selectedSlot.status === 'leave'
                                ? '#f59e0b'
                                : '#9ca3af',
                          },
                        ]}
                      >
                        <Text style={styles.statusTextLarge}>
                          {selectedSlot.status.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    
                    {(selectedSlot as any).notes && (
                      <View style={styles.slotDetailRow}>
                        <Text style={styles.slotDetailLabel}>Notes:</Text>
                        <Text style={styles.slotDetailValue}>
                          {(selectedSlot as any).notes}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSlotDetailsOpen(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>

                {/* Student Details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{user?.name || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reg no:</Text>
                    <Text style={styles.detailValue}>{user?.id || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mail:</Text>
                    <Text style={styles.detailValue}>{user?.email || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Department:</Text>
                    <Text style={styles.detailValue}>Computer Science</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Class:</Text>
                    <Text style={styles.detailValue}>3rd Year A</Text>
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
    backgroundColor: '#2563eb',
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
  statusCol: { width: 96, alignItems: 'flex-end' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  bottomBar: {
    height: 64,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
  },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { color: '#6b7280', fontWeight: '600' },
  tabTextActive: { color: '#2563eb' },
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
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#2563eb',
    fontWeight: '700',
  },
  profileHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  profileContent: {
    padding: 20,
  },
  profileLargeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2563eb',
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
    backgroundColor: '#2563eb',
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
  slotDetailsModal: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 40,
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  slotDetailsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  slotDetailsContent: {
    marginBottom: 20,
  },
  slotDetailRow: {
    marginBottom: 16,
  },
  slotDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  slotDetailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  statusPillLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusTextLarge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

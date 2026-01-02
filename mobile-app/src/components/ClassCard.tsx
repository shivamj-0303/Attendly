import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface ClassItem {
  classId: number;
  className: string;
  dayOfWeek?: string;
  end: string;
  id: string;
  room: string;
  slotId: number;
  start: string;
  subject: string;
}

interface ClassCardProps {
  item: ClassItem;
  onPress: () => void;
  showMarkButton?: boolean;
  onMarkPress?: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  item,
  onMarkPress,
  onPress,
  showMarkButton,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{item.start}</Text>
        <Text style={styles.timeSub}>{item.end}</Text>
      </View>
      <View style={styles.infoColumn}>
        <Text style={styles.subjectText}>{item.subject}</Text>
        <Text style={styles.classText}>{item.className}</Text>
        <Text style={styles.roomText}>Room: {item.room}</Text>
      </View>
      {showMarkButton && onMarkPress && (
        <TouchableOpacity
          style={styles.actionColumn}
          onPress={(e) => {
            e.stopPropagation();
            onMarkPress();
          }}
        >
          <View style={styles.markButton}>
            <Text style={styles.markButtonText}>Mark</Text>
          </View>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionColumn: {
    alignItems: 'flex-end',
    width: 80,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
  },
  classText: {
    color: '#6b7280',
    marginTop: 4,
  },
  infoColumn: {
    flex: 1,
    paddingLeft: 8,
  },
  markButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  roomText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeSub: {
    color: '#6b7280',
    fontSize: 12,
  },
  timeColumn: {
    width: 80,
  },
  timeText: {
    color: '#111827',
    fontWeight: '700',
  },
});

package com.attendly.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Attendance data stored as JSONB in timetable occurrence
 * Only stores exceptions (absent/leave students)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceData {
  
  // Student IDs who were absent
  private List<Long> absentIds;
  
  // Student IDs who were on leave
  private List<Long> leaveIds;
  
  // Teacher who marked attendance
  private Long markedBy;
  
  // When attendance was marked
  private LocalDateTime markedAt;
  
  // Total students in class at time of marking
  private Integer totalStudents;
  
  // Optional remarks
  private String remarks;
}

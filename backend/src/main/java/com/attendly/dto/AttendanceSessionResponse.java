package com.attendly.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for attendance session
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSessionResponse {
  private Long id;
  private Long timetableSlotId;
  private Long classId;
  private LocalDate date;
  private String status;
  private List<Long> absentStudentIds;
  private List<Long> leaveStudentIds;
  private Integer totalStudents;
  private Integer presentCount;
  private Integer absentCount;
  private Integer leaveCount;
  private Double attendancePercentage;
  private String remarks;
  private Long markedBy;
  private String markedByName;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}

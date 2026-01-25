package com.attendly.entity;

import com.attendly.dto.AttendanceData;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

/**
 * Timetable occurrence - represents a specific instance of a recurring timetable slot
 * Stores attendance data directly as JSONB for optimal storage
 * 
 * This links timetable slots (weekly recurring) to actual daily occurrences
 * Attendance is stored only when marked, as JSONB with absent/leave arrays
 */
@Entity
@Table(
    name = "timetable_occurrence",
    indexes = {
      @Index(name = "idx_occurrence_slot_date", columnList = "timetableSlotId,date"),
      @Index(name = "idx_occurrence_class_date", columnList = "classId,date"),
      @Index(name = "idx_occurrence_date", columnList = "date")
    },
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_occurrence_slot_date",
          columnNames = {"timetableSlotId", "date"})
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableOccurrence {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Timetable slot ID is required")
  @Column(nullable = false)
  private Long timetableSlotId;

  @NotNull(message = "Class ID is required")
  @Column(nullable = false)
  private Long classId;

  @NotNull(message = "Date is required")
  @Column(nullable = false)
  private LocalDate date;

  // Attendance data stored as JSONB
  // null = attendance not marked yet
  // Contains: absentIds, leaveIds, markedBy, markedAt, totalStudents, remarks
  @Type(JsonType.class)
  @Column(columnDefinition = "jsonb")
  private AttendanceData attendanceData;

  // Occurrence modifications
  @Column(nullable = false)
  private Boolean isCancelled = false;

  @Column(length = 500)
  private String cancellationReason;

  @Column
  private Long substituteTeacherId;

  @Column(length = 200)
  private String roomChange;

  @Column(nullable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
    if (this.isCancelled == null) {
      this.isCancelled = false;
    }
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }

  /**
   * Check if attendance has been marked for this occurrence
   */
  public boolean isAttendanceMarked() {
    return this.attendanceData != null && this.attendanceData.getMarkedBy() != null;
  }

  /**
   * Check if a student was present (not absent and not on leave)
   */
  public boolean isStudentPresent(Long studentId) {
    if (!isAttendanceMarked()) {
      return false; // Not marked yet
    }

    boolean isAbsent =
        attendanceData.getAbsentIds() != null
            && attendanceData.getAbsentIds().contains(studentId);
    boolean isOnLeave =
        attendanceData.getLeaveIds() != null
            && attendanceData.getLeaveIds().contains(studentId);

    return !isAbsent && !isOnLeave;
  }

  /**
   * Get attendance status for a student
   */
  public String getStudentStatus(Long studentId) {
    if (!isAttendanceMarked()) {
      return "NOT_MARKED";
    }

    if (attendanceData.getAbsentIds() != null
        && attendanceData.getAbsentIds().contains(studentId)) {
      return "ABSENT";
    }

    if (attendanceData.getLeaveIds() != null
        && attendanceData.getLeaveIds().contains(studentId)) {
      return "LEAVE";
    }

    return "PRESENT";
  }
}

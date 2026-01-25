package com.attendly.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

/**
 * Optimized attendance session - one record per class session
 * Stores attendance for entire class in a single record using JSON
 * Reduces database rows from 1000s to just a few per day
 */
@Entity
@Table(
    name = "attendance_session",
    indexes = {
      @Index(name = "idx_timetable_date", columnList = "timetableSlotId,date"),
      @Index(name = "idx_class_date", columnList = "classId,date")
    })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSession {

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

  @Column(nullable = false)
  private Long markedBy; // Teacher ID who marked attendance

  // Status of the session: COMPLETED, IN_PROGRESS, NOT_STARTED
  @Column(nullable = false, length = 20)
  private String status = "NOT_STARTED";

  // Store only ABSENT student IDs as JSON array - saves 90% space
  // Example: [123, 456, 789] for absent students
  @Type(JsonType.class)
  @Column(columnDefinition = "jsonb")
  private java.util.List<Long> absentStudentIds;

  // Store students on LEAVE as JSON array
  @Type(JsonType.class)
  @Column(columnDefinition = "jsonb")
  private java.util.List<Long> leaveStudentIds;

  // Total students in the class (for quick stats)
  @Column(nullable = false)
  private Integer totalStudents;

  @Column(length = 1000)
  private String remarks;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}

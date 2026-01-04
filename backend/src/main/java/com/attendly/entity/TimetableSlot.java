package com.attendly.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "timetable_slots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableSlot {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Class ID is required")
  @Column(nullable = false)
  private Long classId;

  @NotBlank(message = "Subject name is required")
  @Column(nullable = false, length = 100)
  private String subject;

  @NotNull(message = "Teacher ID is required")
  @Column(nullable = false)
  private Long teacherId;

  @Column(length = 100)
  private String teacherName;

  // Day of week: SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
  @NotBlank(message = "Day of week is required")
  @Column(nullable = false, length = 20)
  private String dayOfWeek;

  @NotNull(message = "Start time is required")
  @Column(nullable = false)
  private LocalTime startTime;

  @NotNull(message = "End time is required")
  @Column(nullable = false)
  private LocalTime endTime;

  @Column(length = 200)
  private String room;

  @Column(length = 500)
  private String notes;

  @Column(nullable = false)
  private Boolean isActive = true;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;
}

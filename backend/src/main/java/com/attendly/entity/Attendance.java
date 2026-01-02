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
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "attendance")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Timetable slot ID is required")
  @Column(nullable = false)
  private Long timetableSlotId;

  @NotNull(message = "Student ID is required")
  @Column(nullable = false)
  private Long studentId;

  @NotNull(message = "Date is required")
  @Column(nullable = false)
  private LocalDate date;

  // Status: PRESENT, ABSENT, LEAVE, NOT_MARKED
  @NotNull(message = "Status is required")
  @Column(nullable = false, length = 20)
  private String status = "NOT_MARKED";

  @Column(nullable = false)
  private Long markedBy; // Teacher ID who marked attendance

  @Column(length = 500)
  private String remarks;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;
}

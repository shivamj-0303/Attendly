package com.attendly.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {

  private Long id;

  private Long timetableSlotId;

  private String subject;

  private Long studentId;

  private String studentName;

  private LocalDate date;

  private String status; // PRESENT, ABSENT, LEAVE, NOT_MARKED

  private Long markedBy;

  private String markedByName;

  private String remarks;

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;
}

package com.attendly.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class AttendanceRequest {

  @NotNull(message = "Timetable slot ID is required")
  private Long timetableSlotId;

  @NotNull(message = "Student ID is required")
  private Long studentId;

  @NotNull(message = "Date is required")
  private LocalDate date;

  @NotBlank(message = "Status is required")
  private String status; // PRESENT, ABSENT, LEAVE, NOT_MARKED

  private String remarks;
}

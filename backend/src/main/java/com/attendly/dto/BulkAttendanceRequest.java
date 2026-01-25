package com.attendly.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for marking attendance for entire class
 * Much more efficient than individual student requests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkAttendanceRequest {

  @NotNull(message = "Timetable slot ID is required")
  private Long timetableSlotId;

  @NotNull(message = "Date is required")
  private LocalDate date;

  // Only send IDs of students who were ABSENT
  // Everyone else is considered PRESENT
  private List<Long> absentStudentIds;

  // Students on approved leave
  private List<Long> leaveStudentIds;

  private String remarks;
}

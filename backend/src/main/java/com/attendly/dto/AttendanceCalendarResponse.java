package com.attendly.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCalendarResponse {
  private int year;
  private int month;
  private String monthName; // January, February, etc
  private List<DayAttendance> days;
  
  // Summary for the month
  private int totalClassesConducted; // Only counted marked classes
  private int totalPresent;
  private int totalAbsent;
  private int totalLeave;
  private double monthlyPercentage;
}

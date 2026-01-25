package com.attendly.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DayAttendance {
  private LocalDate date;
  private String dayOfWeek; // MONDAY, TUESDAY, etc
  private int totalClasses; // Total classes scheduled
  private int classesPresent;
  private int classesAbsent;
  private int classesOnLeave;
  private int classesNotMarked;
  private String overallStatus; // PRESENT, ABSENT, LEAVE, MIXED, NOT_MARKED, NO_CLASS
  private double attendancePercentage; // For the day
}

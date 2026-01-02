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
public class AttendanceReportResponse {
  private double overallPercentage;
  private int totalClasses;
  private int classesPresent;
  private List<SubjectAttendanceSummary> subjectBreakdown;
}

package com.attendly.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectAttendanceSummary {
  private String subjectName;
  private int totalClasses;
  private int classesPresent;
  private double percentage;
}

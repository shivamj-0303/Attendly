package com.attendly.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableSlotResponse {

  private Long id;

  private Long classId;

  private String subject;

  private Long teacherId;

  private String teacherName;

  private String dayOfWeek;

  private LocalTime startTime;

  private LocalTime endTime;

  private String room;

  private String notes;

  private Boolean isActive;

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;
}

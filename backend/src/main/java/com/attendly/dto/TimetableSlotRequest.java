package com.attendly.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class TimetableSlotRequest {
    
    @NotNull(message = "Class ID is required")
    private Long classId;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotNull(message = "Teacher ID is required")
    private Long teacherId;
    
    private String teacherName;
    
    @NotBlank(message = "Day of week is required")
    private String dayOfWeek; // MONDAY, TUESDAY, etc.
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    private String room;
    
    private String notes;
}

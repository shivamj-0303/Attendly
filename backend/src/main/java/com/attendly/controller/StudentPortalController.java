package com.attendly.controller;

import com.attendly.dto.AttendanceReportResponse;
import com.attendly.dto.AttendanceResponse;
import com.attendly.dto.TimetableSlotResponse;
import com.attendly.entity.Student;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.StudentRepository;
import com.attendly.security.UserPrincipal;
import com.attendly.service.AttendanceService;
import com.attendly.service.TimetableService;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentPortalController {

  private final TimetableService timetableService;
  private final AttendanceService attendanceService;
  private final StudentRepository studentRepository;

  @GetMapping("/timetable")
  public ResponseEntity<List<TimetableSlotResponse>> getTimetable(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {

    // Get student details
    Student student =
        studentRepository
            .findById(userPrincipal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

    if (date != null) {
      // Get timetable for specific day
      DayOfWeek dayOfWeek = date.getDayOfWeek();
      String dayName = dayOfWeek.getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase();

      List<TimetableSlotResponse> slots =
          timetableService.getStudentTimetableByDay(student.getClassId(), dayName);
      return ResponseEntity.ok(slots);
    } else {
      // Get full week timetable
      List<TimetableSlotResponse> slots =
          timetableService.getStudentTimetable(student.getClassId());
      return ResponseEntity.ok(slots);
    }
  }

  @GetMapping("/attendance/today")
  public ResponseEntity<List<AttendanceResponse>> getTodayAttendance(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    List<AttendanceResponse> attendance =
        attendanceService.getTodayAttendanceForStudent(userPrincipal.getId());
    return ResponseEntity.ok(attendance);
  }

  @GetMapping("/attendance")
  public ResponseEntity<List<AttendanceResponse>> getAttendance(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate endDate,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    List<AttendanceResponse> attendance =
        attendanceService.getAttendanceByStudent(userPrincipal.getId(), startDate, endDate);
    return ResponseEntity.ok(attendance);
  }

  @GetMapping("/attendance/report")
  public ResponseEntity<AttendanceReportResponse> getAttendanceReport(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    AttendanceReportResponse report =
        attendanceService.getStudentAttendanceReport(userPrincipal.getId());
    return ResponseEntity.ok(report);
  }
}

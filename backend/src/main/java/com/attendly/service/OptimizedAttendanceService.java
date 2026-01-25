package com.attendly.service;

import com.attendly.dto.AttendanceReportResponse;
import com.attendly.dto.AttendanceRequest;
import com.attendly.dto.SubjectAttendanceSummary;
import com.attendly.entity.AttendanceSession;
import com.attendly.entity.Student;
import com.attendly.entity.TimetableSlot;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.AttendanceSessionRepository;
import com.attendly.repository.StudentRepository;
import com.attendly.repository.TimetableSlotRepository;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Optimized Attendance Service using session-based storage
 * Reduces database records by 90%+ by storing only absences
 */
@Service
@RequiredArgsConstructor
public class OptimizedAttendanceService {

  private final AttendanceSessionRepository sessionRepository;
  private final StudentRepository studentRepository;
  private final TimetableSlotRepository timetableSlotRepository;

  /**
   * Mark attendance for entire class in bulk
   * Much more efficient than marking individual students
   */
  @Transactional
  public AttendanceSession markClassAttendance(
      Long timetableSlotId,
      LocalDate date,
      List<Long> absentStudentIds,
      List<Long> leaveStudentIds,
      Long teacherId) {

    TimetableSlot slot =
        timetableSlotRepository
            .findById(timetableSlotId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Timetable slot not found with id: " + timetableSlotId));

    // Get total students in the class
    int totalStudents = studentRepository.countByClassId(slot.getClassId());

    // Check if session already exists
    Optional<AttendanceSession> existingSession =
        sessionRepository.findByTimetableSlotIdAndDate(timetableSlotId, date);

    AttendanceSession session;
    if (existingSession.isPresent()) {
      session = existingSession.get();
      session.setAbsentStudentIds(absentStudentIds != null ? absentStudentIds : new ArrayList<>());
      session.setLeaveStudentIds(leaveStudentIds != null ? leaveStudentIds : new ArrayList<>());
      session.setMarkedBy(teacherId);
      session.setStatus("COMPLETED");
      session.setTotalStudents(totalStudents);
    } else {
      session =
          AttendanceSession.builder()
              .timetableSlotId(timetableSlotId)
              .classId(slot.getClassId())
              .date(date)
              .absentStudentIds(absentStudentIds != null ? absentStudentIds : new ArrayList<>())
              .leaveStudentIds(leaveStudentIds != null ? leaveStudentIds : new ArrayList<>())
              .markedBy(teacherId)
              .status("COMPLETED")
              .totalStudents(totalStudents)
              .build();
    }

    return sessionRepository.save(session);
  }

  /**
   * Get attendance report for a student - optimized version
   * Only queries sessions, not individual records
   */
  public AttendanceReportResponse getStudentAttendanceReport(
      Long studentId, LocalDate startDate, LocalDate endDate) {

    Student student =
        studentRepository
            .findById(studentId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Student not found with id: " + studentId));

    Long classId = student.getClassId();

    // Get all completed sessions for the class
    List<AttendanceSession> sessions;
    if (startDate != null && endDate != null) {
      sessions =
          sessionRepository.findByClassIdAndDateBetweenAndStatus(
              classId, startDate, endDate, "COMPLETED");
    } else {
      // Get all completed sessions
      sessions =
          sessionRepository.findByClassIdAndDateBetweenAndStatus(
              classId, LocalDate.of(2020, 1, 1), LocalDate.now().plusYears(1), "COMPLETED");
    }

    // Calculate overall stats
    int totalClasses = sessions.size();
    int classesAbsent = 0;
    int classesOnLeave = 0;

    // Group by subject for subject-wise breakdown
    Map<String, SubjectStats> subjectStatsMap = new HashMap<>();

    for (AttendanceSession session : sessions) {
      // Check if student was absent or on leave
      boolean wasAbsent =
          session.getAbsentStudentIds() != null
              && session.getAbsentStudentIds().contains(studentId);
      boolean wasOnLeave =
          session.getLeaveStudentIds() != null
              && session.getLeaveStudentIds().contains(studentId);

      if (wasAbsent) classesAbsent++;
      if (wasOnLeave) classesOnLeave++;

      // Get subject info
      TimetableSlot slot =
          timetableSlotRepository.findById(session.getTimetableSlotId()).orElse(null);
      if (slot != null && slot.getSubject() != null) {
        String subjectName = slot.getSubject();
        SubjectStats stats = subjectStatsMap.getOrDefault(subjectName, new SubjectStats());
        stats.totalClasses++;

        // Present if not absent and not on leave
        if (!wasAbsent && !wasOnLeave) {
          stats.classesPresent++;
        }

        subjectStatsMap.put(subjectName, stats);
      }
    }

    // Calculate overall percentage (leave doesn't count as absent)
    int classesPresent = totalClasses - classesAbsent - classesOnLeave;
    // For percentage, we count leaves as present (or exclude from total)
    int effectiveTotal = totalClasses - classesOnLeave;
    double overallPercentage =
        effectiveTotal > 0 ? (classesPresent * 100.0) / effectiveTotal : 0.0;

    // Convert to list of SubjectAttendanceSummary
    List<SubjectAttendanceSummary> subjectBreakdown = new ArrayList<>();
    for (Map.Entry<String, SubjectStats> entry : subjectStatsMap.entrySet()) {
      String subjectName = entry.getKey();
      SubjectStats stats = entry.getValue();
      double percentage =
          stats.totalClasses > 0 ? (stats.classesPresent * 100.0) / stats.totalClasses : 0.0;

      subjectBreakdown.add(
          SubjectAttendanceSummary.builder()
              .subjectName(subjectName)
              .totalClasses(stats.totalClasses)
              .classesPresent(stats.classesPresent)
              .percentage(percentage)
              .build());
    }

    // Sort by subject name
    subjectBreakdown.sort((a, b) -> a.getSubjectName().compareTo(b.getSubjectName()));

    return AttendanceReportResponse.builder()
        .overallPercentage(overallPercentage)
        .totalClasses(effectiveTotal)
        .classesPresent(classesPresent)
        .subjectBreakdown(subjectBreakdown)
        .build();
  }

  /**
   * Get attendance for a specific session
   */
  public AttendanceSession getSessionAttendance(Long timetableSlotId, LocalDate date) {
    return sessionRepository
        .findByTimetableSlotIdAndDate(timetableSlotId, date)
        .orElseThrow(
            () ->
                new ResourceNotFoundException(
                    "Attendance session not found for slot " + timetableSlotId + " on " + date));
  }

  /**
   * Check if a student was present in a specific session
   */
  public boolean wasStudentPresent(Long timetableSlotId, LocalDate date, Long studentId) {
    Optional<AttendanceSession> session =
        sessionRepository.findByTimetableSlotIdAndDate(timetableSlotId, date);

    if (session.isEmpty() || !"COMPLETED".equals(session.get().getStatus())) {
      return false; // Session not marked yet
    }

    AttendanceSession s = session.get();
    boolean wasAbsent =
        s.getAbsentStudentIds() != null && s.getAbsentStudentIds().contains(studentId);
    boolean wasOnLeave =
        s.getLeaveStudentIds() != null && s.getLeaveStudentIds().contains(studentId);

    return !wasAbsent && !wasOnLeave;
  }

  // Helper class for calculating subject statistics
  private static class SubjectStats {
    int totalClasses = 0;
    int classesPresent = 0;
  }
}

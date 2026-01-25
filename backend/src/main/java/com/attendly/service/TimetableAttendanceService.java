package com.attendly.service;

import com.attendly.dto.AttendanceData;
import com.attendly.dto.AttendanceReportResponse;
import com.attendly.dto.SubjectAttendanceSummary;
import com.attendly.entity.Student;
import com.attendly.entity.TimetableOccurrence;
import com.attendly.entity.TimetableSlot;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.StudentRepository;
import com.attendly.repository.TimetableOccurrenceRepository;
import com.attendly.repository.TimetableSlotRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Timetable-linked attendance service
 * Stores attendance directly in timetable occurrences as JSONB
 * Optimal storage with natural data model
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TimetableAttendanceService {

  private final TimetableOccurrenceRepository occurrenceRepository;
  private final TimetableSlotRepository slotRepository;
  private final StudentRepository studentRepository;

  /**
   * Mark attendance for a timetable occurrence
   * Creates or updates the occurrence with attendance data
   */
  @Transactional
  public TimetableOccurrence markAttendance(
      Long timetableSlotId,
      LocalDate date,
      List<Long> absentStudentIds,
      List<Long> leaveStudentIds,
      Long teacherId,
      String remarks) {

    // Verify timetable slot exists
    TimetableSlot slot =
        slotRepository
            .findById(timetableSlotId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Timetable slot not found with id: " + timetableSlotId));

    // Get total students in class
    int totalStudents = studentRepository.countByClassId(slot.getClassId());

    // Create attendance data
    AttendanceData attendanceData =
        AttendanceData.builder()
            .absentIds(absentStudentIds != null ? absentStudentIds : new ArrayList<>())
            .leaveIds(leaveStudentIds != null ? leaveStudentIds : new ArrayList<>())
            .markedBy(teacherId)
            .markedAt(LocalDateTime.now())
            .totalStudents(totalStudents)
            .remarks(remarks)
            .build();

    // Check if occurrence already exists
    Optional<TimetableOccurrence> existingOccurrence =
        occurrenceRepository.findByTimetableSlotIdAndDate(timetableSlotId, date);

    TimetableOccurrence occurrence;
    if (existingOccurrence.isPresent()) {
      // Update existing occurrence
      occurrence = existingOccurrence.get();
      occurrence.setAttendanceData(attendanceData);
      log.info(
          "Updated attendance for slot {} on {}: {} absent, {} leave",
          timetableSlotId,
          date,
          absentStudentIds != null ? absentStudentIds.size() : 0,
          leaveStudentIds != null ? leaveStudentIds.size() : 0);
    } else {
      // Create new occurrence
      occurrence =
          TimetableOccurrence.builder()
              .timetableSlotId(timetableSlotId)
              .classId(slot.getClassId())
              .date(date)
              .attendanceData(attendanceData)
              .isCancelled(false)
              .build();
      log.info(
          "Created new occurrence for slot {} on {} with attendance",
          timetableSlotId,
          date);
    }

    return occurrenceRepository.save(occurrence);
  }

  /**
   * Get attendance report for a student
   * Efficiently queries only marked occurrences
   */
  public AttendanceReportResponse getStudentAttendanceReport(
      Long studentId, LocalDate startDate, LocalDate endDate) {

    Student student =
        studentRepository
            .findById(studentId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Student not found with id: " + studentId));

    Long classId = student.getClassId();

    // Get all marked occurrences for the class
    List<TimetableOccurrence> occurrences;
    if (startDate != null && endDate != null) {
      occurrences = occurrenceRepository.findMarkedOccurrences(classId, startDate, endDate);
    } else {
      // Default to all-time
      occurrences =
          occurrenceRepository.findMarkedOccurrences(
              classId, LocalDate.of(2020, 1, 1), LocalDate.now().plusYears(1));
    }

    // Calculate overall stats
    int totalClasses = occurrences.size();
    int classesAbsent = 0;
    int classesOnLeave = 0;

    // Group by subject for subject-wise breakdown
    Map<String, SubjectStats> subjectStatsMap = new HashMap<>();

    for (TimetableOccurrence occurrence : occurrences) {
      AttendanceData data = occurrence.getAttendanceData();
      if (data == null) continue; // Should not happen for marked occurrences

      // Check if student was absent or on leave
      boolean wasAbsent = data.getAbsentIds() != null && data.getAbsentIds().contains(studentId);
      boolean wasOnLeave = data.getLeaveIds() != null && data.getLeaveIds().contains(studentId);

      if (wasAbsent) classesAbsent++;
      if (wasOnLeave) classesOnLeave++;

      // Get subject info from timetable slot
      TimetableSlot slot = slotRepository.findById(occurrence.getTimetableSlotId()).orElse(null);
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

    log.info(
        "Generated attendance report for student {}: {}% attendance ({}/{} classes)",
        studentId,
        Math.round(overallPercentage),
        classesPresent,
        effectiveTotal);

    return AttendanceReportResponse.builder()
        .overallPercentage(overallPercentage)
        .totalClasses(effectiveTotal)
        .classesPresent(classesPresent)
        .subjectBreakdown(subjectBreakdown)
        .build();
  }

  /**
   * Get attendance for a specific occurrence
   */
  public TimetableOccurrence getOccurrence(Long timetableSlotId, LocalDate date) {
    return occurrenceRepository
        .findByTimetableSlotIdAndDate(timetableSlotId, date)
        .orElseThrow(
            () ->
                new ResourceNotFoundException(
                    "Occurrence not found for slot " + timetableSlotId + " on " + date));
  }

  /**
   * Check if student was present in a specific occurrence
   */
  public boolean wasStudentPresent(Long timetableSlotId, LocalDate date, Long studentId) {
    Optional<TimetableOccurrence> occurrence =
        occurrenceRepository.findByTimetableSlotIdAndDate(timetableSlotId, date);

    if (occurrence.isEmpty() || !occurrence.get().isAttendanceMarked()) {
      return false; // Not marked yet
    }

    return occurrence.get().isStudentPresent(studentId);
  }

  /**
   * Get student's attendance status for a specific occurrence
   */
  public String getStudentStatus(Long timetableSlotId, LocalDate date, Long studentId) {
    Optional<TimetableOccurrence> occurrence =
        occurrenceRepository.findByTimetableSlotIdAndDate(timetableSlotId, date);

    if (occurrence.isEmpty()) {
      return "NOT_MARKED";
    }

    return occurrence.get().getStudentStatus(studentId);
  }

  /**
   * Mark occurrence as cancelled
   */
  @Transactional
  public TimetableOccurrence markAsCancelled(
      Long timetableSlotId, LocalDate date, String reason) {

    TimetableSlot slot =
        slotRepository
            .findById(timetableSlotId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Timetable slot not found with id: " + timetableSlotId));

    Optional<TimetableOccurrence> existingOccurrence =
        occurrenceRepository.findByTimetableSlotIdAndDate(timetableSlotId, date);

    TimetableOccurrence occurrence;
    if (existingOccurrence.isPresent()) {
      occurrence = existingOccurrence.get();
      occurrence.setIsCancelled(true);
      occurrence.setCancellationReason(reason);
    } else {
      occurrence =
          TimetableOccurrence.builder()
              .timetableSlotId(timetableSlotId)
              .classId(slot.getClassId())
              .date(date)
              .isCancelled(true)
              .cancellationReason(reason)
              .build();
    }

    log.info("Marked occurrence {} on {} as cancelled: {}", timetableSlotId, date, reason);
    return occurrenceRepository.save(occurrence);
  }

  /**
   * Set substitute teacher for an occurrence
   */
  @Transactional
  public TimetableOccurrence setSubstituteTeacher(
      Long timetableSlotId, LocalDate date, Long substituteTeacherId) {

    TimetableSlot slot =
        slotRepository
            .findById(timetableSlotId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Timetable slot not found with id: " + timetableSlotId));

    Optional<TimetableOccurrence> existingOccurrence =
        occurrenceRepository.findByTimetableSlotIdAndDate(timetableSlotId, date);

    TimetableOccurrence occurrence;
    if (existingOccurrence.isPresent()) {
      occurrence = existingOccurrence.get();
      occurrence.setSubstituteTeacherId(substituteTeacherId);
    } else {
      occurrence =
          TimetableOccurrence.builder()
              .timetableSlotId(timetableSlotId)
              .classId(slot.getClassId())
              .date(date)
              .substituteTeacherId(substituteTeacherId)
              .isCancelled(false)
              .build();
    }

    log.info(
        "Set substitute teacher {} for occurrence {} on {}",
        substituteTeacherId,
        timetableSlotId,
        date);
    return occurrenceRepository.save(occurrence);
  }

  /**
   * Get attendance calendar for a specific month
   * Shows day-by-day attendance status
   */
  public com.attendly.dto.AttendanceCalendarResponse getAttendanceCalendar(
      Long studentId, int year, int month) {

    Student student =
        studentRepository
            .findById(studentId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Student not found with id: " + studentId));

    Long classId = student.getClassId();

    // Calculate start and end dates for the month
    LocalDate startDate = LocalDate.of(year, month, 1);
    LocalDate endDate = startDate.plusMonths(1).minusDays(1);

    // Get all timetable slots for the class
    List<TimetableSlot> allSlots = slotRepository.findByClassIdAndIsActiveTrue(classId);
    
    // Get all marked occurrences for the month
    List<TimetableOccurrence> markedOccurrences =
        occurrenceRepository.findByClassIdAndDateBetween(classId, startDate, endDate);
    
    // Create a map of date -> list of occurrences for quick lookup
    Map<LocalDate, List<TimetableOccurrence>> occurrencesByDate = new HashMap<>();
    for (TimetableOccurrence occurrence : markedOccurrences) {
      occurrencesByDate
          .computeIfAbsent(occurrence.getDate(), k -> new ArrayList<>())
          .add(occurrence);
    }

    // Build day-by-day attendance
    List<com.attendly.dto.DayAttendance> days = new ArrayList<>();
    int totalClassesConducted = 0;
    int totalPresent = 0;
    int totalAbsent = 0;
    int totalLeave = 0;

    LocalDate currentDate = startDate;
    while (!currentDate.isAfter(endDate)) {
      String dayOfWeek =
          currentDate.getDayOfWeek().getDisplayName(
              java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH).toUpperCase();

      // Find which slots are scheduled for this day
      List<TimetableSlot> daySlots =
          allSlots.stream()
              .filter(slot -> slot.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
              .toList();

      int dayTotalClasses = daySlots.size();
      int dayPresent = 0;
      int dayAbsent = 0;
      int dayLeave = 0;
      int dayNotMarked = 0;

      // Check attendance for each scheduled slot
      List<TimetableOccurrence> dayOccurrences =
          occurrencesByDate.getOrDefault(currentDate, new ArrayList<>());
      
      for (TimetableSlot slot : daySlots) {
        // Find if this slot has a marked occurrence
        TimetableOccurrence occurrence =
            dayOccurrences.stream()
                .filter(occ -> occ.getTimetableSlotId().equals(slot.getId()))
                .findFirst()
                .orElse(null);

        if (occurrence == null || !occurrence.isAttendanceMarked()) {
          dayNotMarked++;
        } else {
          String status = occurrence.getStudentStatus(studentId);
          switch (status) {
            case "PRESENT":
              dayPresent++;
              totalPresent++;
              totalClassesConducted++;
              break;
            case "ABSENT":
              dayAbsent++;
              totalAbsent++;
              totalClassesConducted++;
              break;
            case "LEAVE":
              dayLeave++;
              totalLeave++;
              totalClassesConducted++;
              break;
          }
        }
      }

      // Determine overall status for the day
      String overallStatus;
      if (dayTotalClasses == 0) {
        overallStatus = "NO_CLASS";
      } else if (dayNotMarked == dayTotalClasses) {
        overallStatus = "NOT_MARKED";
      } else if (dayAbsent > 0 && dayPresent == 0 && dayLeave == 0) {
        overallStatus = "ABSENT";
      } else if (dayLeave > 0 && dayAbsent == 0 && dayPresent == 0) {
        overallStatus = "LEAVE";
      } else if (dayPresent > 0 && dayAbsent == 0 && dayLeave == 0) {
        overallStatus = "PRESENT";
      } else {
        overallStatus = "MIXED";
      }

      // Calculate day percentage (exclude not marked and leave)
      int markedClasses = dayTotalClasses - dayNotMarked;
      int effectiveClasses = markedClasses - dayLeave;
      double dayPercentage =
          effectiveClasses > 0 ? (dayPresent * 100.0) / effectiveClasses : 0.0;

      days.add(
          com.attendly.dto.DayAttendance.builder()
              .date(currentDate)
              .dayOfWeek(dayOfWeek)
              .totalClasses(dayTotalClasses)
              .classesPresent(dayPresent)
              .classesAbsent(dayAbsent)
              .classesOnLeave(dayLeave)
              .classesNotMarked(dayNotMarked)
              .overallStatus(overallStatus)
              .attendancePercentage(dayPercentage)
              .build());

      currentDate = currentDate.plusDays(1);
    }

    // Calculate monthly percentage
    int effectiveTotal = totalClassesConducted - totalLeave;
    double monthlyPercentage = effectiveTotal > 0 ? (totalPresent * 100.0) / effectiveTotal : 0.0;

    String monthName =
        startDate.getMonth().getDisplayName(
            java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH);

    log.info(
        "Generated calendar for student {} for {}-{}: {}% attendance",
        studentId,
        year,
        month,
        Math.round(monthlyPercentage));

    return com.attendly.dto.AttendanceCalendarResponse.builder()
        .year(year)
        .month(month)
        .monthName(monthName)
        .days(days)
        .totalClassesConducted(totalClassesConducted)
        .totalPresent(totalPresent)
        .totalAbsent(totalAbsent)
        .totalLeave(totalLeave)
        .monthlyPercentage(monthlyPercentage)
        .build();
  }

  // Helper class for calculating subject statistics
  private static class SubjectStats {
    int totalClasses = 0;
    int classesPresent = 0;
  }
}

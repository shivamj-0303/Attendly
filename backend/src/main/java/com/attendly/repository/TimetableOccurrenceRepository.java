package com.attendly.repository;

import com.attendly.entity.TimetableOccurrence;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TimetableOccurrenceRepository extends JpaRepository<TimetableOccurrence, Long> {

  Optional<TimetableOccurrence> findByTimetableSlotIdAndDate(Long timetableSlotId, LocalDate date);

  List<TimetableOccurrence> findByClassIdAndDate(Long classId, LocalDate date);

  List<TimetableOccurrence> findByClassIdAndDateBetween(
      Long classId, LocalDate startDate, LocalDate endDate);

  // Get only occurrences where attendance was marked
  @Query(
      "SELECT o FROM TimetableOccurrence o WHERE o.classId = :classId "
          + "AND o.date BETWEEN :startDate AND :endDate "
          + "AND o.attendanceData IS NOT NULL")
  List<TimetableOccurrence> findMarkedOccurrences(
      @Param("classId") Long classId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  // Get occurrences where a specific student was absent
  @Query(
      value =
          "SELECT * FROM timetable_occurrence "
              + "WHERE class_id = :classId "
              + "AND date BETWEEN :startDate AND :endDate "
              + "AND attendance_data IS NOT NULL "
              + "AND jsonb_exists(attendance_data->'absentIds', :studentId)",
      nativeQuery = true)
  List<TimetableOccurrence> findAbsentOccurrencesForStudent(
      @Param("classId") Long classId,
      @Param("studentId") String studentId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  // Count total marked occurrences for a class in date range
  @Query(
      "SELECT COUNT(o) FROM TimetableOccurrence o "
          + "WHERE o.classId = :classId "
          + "AND o.date BETWEEN :startDate AND :endDate "
          + "AND o.attendanceData IS NOT NULL")
  Long countMarkedOccurrences(
      @Param("classId") Long classId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  // Find occurrences that are cancelled
  List<TimetableOccurrence> findByClassIdAndDateBetweenAndIsCancelled(
      Long classId, LocalDate startDate, LocalDate endDate, Boolean isCancelled);

  // Find occurrences with substitute teacher
  List<TimetableOccurrence> findBySubstituteTeacherIdAndDate(Long substituteTeacherId, LocalDate date);

  // Delete old occurrences (for cleanup)
  void deleteByDateBefore(LocalDate date);
}

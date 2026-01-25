package com.attendly.repository;

import com.attendly.entity.AttendanceSession;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

  Optional<AttendanceSession> findByTimetableSlotIdAndDate(Long timetableSlotId, LocalDate date);

  List<AttendanceSession> findByClassIdAndDate(Long classId, LocalDate date);

  List<AttendanceSession> findByClassIdAndDateBetween(
      Long classId, LocalDate startDate, LocalDate endDate);

  @Query(
      value =
          "SELECT * FROM attendance_session a WHERE a.class_id = :classId "
              + "AND jsonb_exists(a.absent_student_ids, CAST(:studentId AS TEXT)) "
              + "AND a.date BETWEEN :startDate AND :endDate",
      nativeQuery = true)
  List<AttendanceSession> findAbsentSessionsForStudent(
      @Param("classId") Long classId,
      @Param("studentId") Long studentId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  @Query(
      value =
          "SELECT * FROM attendance_session a WHERE a.class_id = :classId "
              + "AND (jsonb_exists(a.absent_student_ids, CAST(:studentId AS TEXT)) "
              + "OR jsonb_exists(a.leave_student_ids, CAST(:studentId AS TEXT))) "
              + "AND a.date BETWEEN :startDate AND :endDate",
      nativeQuery = true)
  List<AttendanceSession> findAbsentOrLeaveSessionsForStudent(
      @Param("classId") Long classId,
      @Param("studentId") Long studentId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  @Query(
      "SELECT COUNT(a) FROM AttendanceSession a WHERE a.classId = :classId "
          + "AND a.date BETWEEN :startDate AND :endDate AND a.status = 'COMPLETED'")
  Long countCompletedSessionsForClass(
      @Param("classId") Long classId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  List<AttendanceSession> findByClassIdAndDateBetweenAndStatus(
      Long classId, LocalDate startDate, LocalDate endDate, String status);
}

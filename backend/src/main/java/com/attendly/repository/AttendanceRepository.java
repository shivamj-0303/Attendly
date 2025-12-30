package com.attendly.repository;

import com.attendly.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    List<Attendance> findByStudentId(Long studentId);
    
    List<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);
    
    List<Attendance> findByTimetableSlotIdAndDate(Long timetableSlotId, LocalDate date);
    
    Optional<Attendance> findByTimetableSlotIdAndStudentIdAndDate(Long timetableSlotId, Long studentId, LocalDate date);
    
    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    
    List<Attendance> findByTimetableSlotIdAndDateBetween(Long timetableSlotId, LocalDate startDate, LocalDate endDate);
}

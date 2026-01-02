package com.attendly.repository;

import com.attendly.entity.TimetableSlot;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {

  List<TimetableSlot> findByClassId(Long classId);

  List<TimetableSlot> findByClassIdAndDayOfWeek(Long classId, String dayOfWeek);

  List<TimetableSlot> findByClassIdAndIsActiveTrue(Long classId);

  Optional<TimetableSlot> findByIdAndClassId(Long id, Long classId);

  List<TimetableSlot> findByTeacherId(Long teacherId);

  List<TimetableSlot> findByTeacherIdAndDayOfWeekAndIsActiveTrue(Long teacherId, String dayOfWeek);

  List<TimetableSlot> findByTeacherIdAndIsActiveTrue(Long teacherId);

  // Check for overlapping slots
  List<TimetableSlot> findByClassIdAndDayOfWeekAndIsActiveTrue(Long classId, String dayOfWeek);
}

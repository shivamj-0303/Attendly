package com.attendly.service;

import com.attendly.dto.TimetableSlotRequest;
import com.attendly.dto.TimetableSlotResponse;
import com.attendly.entity.Teacher;
import com.attendly.entity.TimetableSlot;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.ClassRepository;
import com.attendly.repository.TeacherRepository;
import com.attendly.repository.TimetableSlotRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TimetableService {

  private final TimetableSlotRepository timetableSlotRepository;
  private final ClassRepository classRepository;
  private final TeacherRepository teacherRepository;

  @Transactional
  public TimetableSlotResponse createSlot(TimetableSlotRequest request, Long adminId) {
    // Verify class exists and belongs to admin
    classRepository
        .findByIdAndAdminId(request.getClassId(), adminId)
        .orElseThrow(
            () ->
                new ResourceNotFoundException("Class not found with id: " + request.getClassId()));

    // Verify teacher exists
    Teacher teacher =
        teacherRepository
            .findById(request.getTeacherId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Teacher not found with id: " + request.getTeacherId()));

    // Validate time
    if (request.getEndTime().isBefore(request.getStartTime())
        || request.getEndTime().equals(request.getStartTime())) {
      throw new IllegalArgumentException("End time must be after start time");
    }

    // Check for overlapping slots
    List<TimetableSlot> existingSlots =
        timetableSlotRepository.findByClassIdAndDayOfWeekAndIsActiveTrue(
            request.getClassId(), request.getDayOfWeek());

    for (TimetableSlot slot : existingSlots) {
      if (hasTimeOverlap(
          request.getStartTime(), request.getEndTime(), slot.getStartTime(), slot.getEndTime())) {
        throw new IllegalArgumentException(
            "Time slot overlaps with existing slot: "
                + slot.getSubject()
                + " ("
                + slot.getStartTime()
                + " - "
                + slot.getEndTime()
                + ")");
      }
    }

    TimetableSlot slot =
        TimetableSlot.builder()
            .classId(request.getClassId())
            .subject(request.getSubject())
            .teacherId(request.getTeacherId())
            .teacherName(teacher.getName())
            .dayOfWeek(request.getDayOfWeek())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .room(request.getRoom())
            .notes(request.getNotes())
            .isActive(true)
            .build();

    TimetableSlot savedSlot = timetableSlotRepository.save(slot);
    return mapToResponse(savedSlot);
  }

  public List<TimetableSlotResponse> getSlotsByClass(Long classId, Long adminId) {
    // Verify class belongs to admin
    classRepository
        .findByIdAndAdminId(classId, adminId)
        .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));

    return timetableSlotRepository.findByClassIdAndIsActiveTrue(classId).stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
  }

  public List<TimetableSlotResponse> getSlotsByClassAndDay(
      Long classId, String dayOfWeek, Long adminId) {
    // Verify class belongs to admin
    classRepository
        .findByIdAndAdminId(classId, adminId)
        .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));

    return timetableSlotRepository
        .findByClassIdAndDayOfWeekAndIsActiveTrue(classId, dayOfWeek)
        .stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public TimetableSlotResponse updateSlot(Long id, TimetableSlotRequest request, Long adminId) {
    TimetableSlot slot =
        timetableSlotRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Timetable slot not found with id: " + id));

    // Verify class belongs to admin
    classRepository
        .findByIdAndAdminId(slot.getClassId(), adminId)
        .orElseThrow(() -> new ResourceNotFoundException("Unauthorized to modify this timetable"));

    // Validate time
    if (request.getEndTime().isBefore(request.getStartTime())
        || request.getEndTime().equals(request.getStartTime())) {
      throw new IllegalArgumentException("End time must be after start time");
    }

    // Check for overlapping slots (excluding current slot)
    List<TimetableSlot> existingSlots =
        timetableSlotRepository.findByClassIdAndDayOfWeekAndIsActiveTrue(
            request.getClassId(), request.getDayOfWeek());

    for (TimetableSlot existingSlot : existingSlots) {
      if (!existingSlot.getId().equals(id)
          && hasTimeOverlap(
              request.getStartTime(),
              request.getEndTime(),
              existingSlot.getStartTime(),
              existingSlot.getEndTime())) {
        throw new IllegalArgumentException(
            "Time slot overlaps with existing slot: "
                + existingSlot.getSubject()
                + " ("
                + existingSlot.getStartTime()
                + " - "
                + existingSlot.getEndTime()
                + ")");
      }
    }

    // Verify teacher exists
    Teacher teacher =
        teacherRepository
            .findById(request.getTeacherId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Teacher not found with id: " + request.getTeacherId()));

    slot.setSubject(request.getSubject());
    slot.setTeacherId(request.getTeacherId());
    slot.setTeacherName(teacher.getName());
    slot.setDayOfWeek(request.getDayOfWeek());
    slot.setStartTime(request.getStartTime());
    slot.setEndTime(request.getEndTime());
    slot.setRoom(request.getRoom());
    slot.setNotes(request.getNotes());

    TimetableSlot updatedSlot = timetableSlotRepository.save(slot);
    return mapToResponse(updatedSlot);
  }

  @Transactional
  public void deleteSlot(Long id, Long adminId) {
    TimetableSlot slot =
        timetableSlotRepository
            .findById(id)
            .orElseThrow(
                () -> new ResourceNotFoundException("Timetable slot not found with id: " + id));

    // Verify class belongs to admin
    classRepository
        .findByIdAndAdminId(slot.getClassId(), adminId)
        .orElseThrow(() -> new ResourceNotFoundException("Unauthorized to delete this timetable"));

    // Soft delete
    slot.setIsActive(false);
    timetableSlotRepository.save(slot);
  }

  // Student-facing methods (no admin check needed)
  public List<TimetableSlotResponse> getStudentTimetable(Long classId) {
    return timetableSlotRepository.findByClassIdAndIsActiveTrue(classId).stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
  }

  public List<TimetableSlotResponse> getStudentTimetableByDay(Long classId, String dayOfWeek) {
    return timetableSlotRepository
        .findByClassIdAndDayOfWeekAndIsActiveTrue(classId, dayOfWeek)
        .stream()
        .map(this::mapToResponse)
        .collect(Collectors.toList());
  }

  private boolean hasTimeOverlap(
      java.time.LocalTime start1,
      java.time.LocalTime end1,
      java.time.LocalTime start2,
      java.time.LocalTime end2) {
    return start1.isBefore(end2) && end1.isAfter(start2);
  }

  private TimetableSlotResponse mapToResponse(TimetableSlot slot) {
    return TimetableSlotResponse.builder()
        .id(slot.getId())
        .classId(slot.getClassId())
        .subject(slot.getSubject())
        .teacherId(slot.getTeacherId())
        .teacherName(slot.getTeacherName())
        .dayOfWeek(slot.getDayOfWeek())
        .startTime(slot.getStartTime())
        .endTime(slot.getEndTime())
        .room(slot.getRoom())
        .notes(slot.getNotes())
        .isActive(slot.getIsActive())
        .createdAt(slot.getCreatedAt())
        .updatedAt(slot.getUpdatedAt())
        .build();
  }
}

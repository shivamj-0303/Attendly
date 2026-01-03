package com.attendly.controller;

import com.attendly.entity.Attendance;
import com.attendly.entity.Student;
import com.attendly.entity.TimetableSlot;
import com.attendly.repository.AttendanceRepository;
import com.attendly.repository.StudentRepository;
import com.attendly.repository.TimetableSlotRepository;
import com.attendly.security.UserPrincipal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teacher")
@CrossOrigin(origins = "*")
public class TeacherPortalController {

  @Autowired private TimetableSlotRepository timetableSlotRepository;

  @Autowired private StudentRepository studentRepository;

  @Autowired private AttendanceRepository attendanceRepository;

  @GetMapping("/timetable")
  public ResponseEntity<List<Map<String, Object>>> getTeacherTimetable(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {

    Long teacherId = userPrincipal.getId();

    if (date != null) {
      DayOfWeek dayOfWeekEnum = date.getDayOfWeek();
      String dayOfWeek = dayOfWeekEnum.toString(); // Convert to String: MONDAY, TUESDAY, etc.
      List<TimetableSlot> slots =
          timetableSlotRepository.findByTeacherIdAndDayOfWeekAndIsActiveTrue(teacherId, dayOfWeek);

      List<Map<String, Object>> response =
          slots.stream()
              .map(
                  slot -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", slot.getId());
                    map.put("classId", slot.getClassId());
                    map.put(
                        "className",
                        "Class " + slot.getClassId()); // You might want to fetch actual class name
                    map.put("subject", slot.getSubject());
                    map.put("dayOfWeek", slot.getDayOfWeek());
                    map.put("startTime", slot.getStartTime().toString());
                    map.put("endTime", slot.getEndTime().toString());
                    map.put("room", slot.getRoom());
                    map.put("notes", slot.getNotes());
                    return map;
                  })
              .collect(Collectors.toList());

      return ResponseEntity.ok(response);
    } else {
      List<TimetableSlot> slots = timetableSlotRepository.findByTeacherIdAndIsActiveTrue(teacherId);

      List<Map<String, Object>> response =
          slots.stream()
              .map(
                  slot -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", slot.getId());
                    map.put("classId", slot.getClassId());
                    map.put("className", "Class " + slot.getClassId());
                    map.put("subject", slot.getSubject());
                    map.put("dayOfWeek", slot.getDayOfWeek().toString());
                    map.put("startTime", slot.getStartTime().toString());
                    map.put("endTime", slot.getEndTime().toString());
                    map.put("room", slot.getRoom());
                    map.put("notes", slot.getNotes());
                    return map;
                  })
              .collect(Collectors.toList());

      return ResponseEntity.ok(response);
    }
  }

  @GetMapping("/class/{classId}/students")
  public ResponseEntity<List<Map<String, Object>>> getClassStudents(
      @PathVariable Long classId,
      @RequestParam Long slotId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {

    Optional<TimetableSlot> slotOpt = timetableSlotRepository.findById(slotId);
    if (slotOpt.isEmpty() || !slotOpt.get().getTeacherId().equals(userPrincipal.getId())) {
      return ResponseEntity.status(403).build();
    }

    List<Student> students = studentRepository.findByClassIdOrderByRollNumber(classId);

    List<Attendance> attendanceList =
        attendanceRepository.findByTimetableSlotIdAndDate(slotId, date);

    Map<Long, Attendance> attendanceMap =
        attendanceList.stream().collect(Collectors.toMap(Attendance::getStudentId, a -> a));

    List<Map<String, Object>> response =
        students.stream()
            .map(
                student -> {
                  Map<String, Object> map = new HashMap<>();
                  map.put("id", student.getId());
                  map.put("name", student.getName());
                  map.put("rollNumber", student.getRollNumber());
                  map.put("email", student.getEmail());

                  Attendance attendance = attendanceMap.get(student.getId());
                  if (attendance != null) {
                    map.put("attendanceStatus", attendance.getStatus().toString());
                  } else {
                    map.put("attendanceStatus", "NOT_MARKED");
                  }

                  return map;
                })
            .collect(Collectors.toList());

    return ResponseEntity.ok(response);
  }
}

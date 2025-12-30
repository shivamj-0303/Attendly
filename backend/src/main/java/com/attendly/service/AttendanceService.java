package com.attendly.service;

import com.attendly.dto.AttendanceRequest;
import com.attendly.dto.AttendanceResponse;
import com.attendly.entity.Attendance;
import com.attendly.entity.Student;
import com.attendly.entity.TimetableSlot;
import com.attendly.entity.Teacher;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.AttendanceRepository;
import com.attendly.repository.StudentRepository;
import com.attendly.repository.TimetableSlotRepository;
import com.attendly.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final TimetableSlotRepository timetableSlotRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request, Long teacherId) {
        // Verify timetable slot exists
        TimetableSlot slot = timetableSlotRepository.findById(request.getTimetableSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Timetable slot not found with id: " + request.getTimetableSlotId()));

        // Verify student exists
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));

        // Verify student belongs to the same class
        if (!student.getClassId().equals(slot.getClassId())) {
            throw new IllegalArgumentException("Student does not belong to this class");
        }

        // Check if attendance already exists
        Optional<Attendance> existingAttendance = attendanceRepository
                .findByTimetableSlotIdAndStudentIdAndDate(
                        request.getTimetableSlotId(),
                        request.getStudentId(),
                        request.getDate()
                );

        Attendance attendance;
        if (existingAttendance.isPresent()) {
            // Update existing attendance
            attendance = existingAttendance.get();
            attendance.setStatus(request.getStatus());
            attendance.setMarkedBy(teacherId);
            attendance.setRemarks(request.getRemarks());
        } else {
            // Create new attendance record
            attendance = Attendance.builder()
                    .timetableSlotId(request.getTimetableSlotId())
                    .studentId(request.getStudentId())
                    .date(request.getDate())
                    .status(request.getStatus())
                    .markedBy(teacherId)
                    .remarks(request.getRemarks())
                    .build();
        }

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return mapToResponse(savedAttendance, student, slot);
    }

    @Transactional
    public List<AttendanceResponse> markBulkAttendance(List<AttendanceRequest> requests, Long teacherId) {
        return requests.stream()
                .map(request -> markAttendance(request, teacherId))
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByStudent(Long studentId, LocalDate startDate, LocalDate endDate) {
        // Verify student exists
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        List<Attendance> attendanceList;
        if (startDate != null && endDate != null) {
            attendanceList = attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate);
        } else {
            attendanceList = attendanceRepository.findByStudentId(studentId);
        }

        return attendanceList.stream()
                .map(attendance -> {
                    TimetableSlot slot = timetableSlotRepository.findById(attendance.getTimetableSlotId())
                            .orElse(null);
                    return mapToResponse(attendance, student, slot);
                })
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceBySlot(Long slotId, LocalDate date) {
        // Verify slot exists
        TimetableSlot slot = timetableSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable slot not found with id: " + slotId));

        List<Attendance> attendanceList = attendanceRepository.findByTimetableSlotIdAndDate(slotId, date);

        return attendanceList.stream()
                .map(attendance -> {
                    Student student = studentRepository.findById(attendance.getStudentId())
                            .orElse(null);
                    return mapToResponse(attendance, student, slot);
                })
                .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getTodayAttendanceForStudent(Long studentId) {
        LocalDate today = LocalDate.now();
        return getAttendanceByStudent(studentId, today, today);
    }

    private AttendanceResponse mapToResponse(Attendance attendance, Student student, TimetableSlot slot) {
        AttendanceResponse.AttendanceResponseBuilder builder = AttendanceResponse.builder()
                .id(attendance.getId())
                .timetableSlotId(attendance.getTimetableSlotId())
                .studentId(attendance.getStudentId())
                .date(attendance.getDate())
                .status(attendance.getStatus())
                .markedBy(attendance.getMarkedBy())
                .remarks(attendance.getRemarks())
                .createdAt(attendance.getCreatedAt())
                .updatedAt(attendance.getUpdatedAt());

        if (student != null) {
            builder.studentName(student.getName());
        }

        if (slot != null) {
            builder.subject(slot.getSubject());
        }

        if (attendance.getMarkedBy() != null) {
            teacherRepository.findById(attendance.getMarkedBy())
                    .ifPresent(teacher -> builder.markedByName(teacher.getName()));
        }

        return builder.build();
    }
}

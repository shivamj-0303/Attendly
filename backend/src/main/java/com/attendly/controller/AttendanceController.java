package com.attendly.controller;

import com.attendly.dto.AttendanceRequest;
import com.attendly.dto.AttendanceResponse;
import com.attendly.security.UserPrincipal;
import com.attendly.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    public ResponseEntity<AttendanceResponse> markAttendance(
            @Valid @RequestBody AttendanceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AttendanceResponse response = attendanceService.markAttendance(request, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/mark/bulk")
    public ResponseEntity<List<AttendanceResponse>> markBulkAttendance(
            @Valid @RequestBody List<AttendanceRequest> requests,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AttendanceResponse> responses = attendanceService.markBulkAttendance(requests, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByStudent(
            @PathVariable Long studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceResponse> attendance = attendanceService.getAttendanceByStudent(studentId, startDate, endDate);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/slot/{slotId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceBySlot(
            @PathVariable Long slotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceResponse> attendance = attendanceService.getAttendanceBySlot(slotId, date);
        return ResponseEntity.ok(attendance);
    }
}

package com.attendly.controller;

import com.attendly.dto.TimetableSlotRequest;
import com.attendly.dto.TimetableSlotResponse;
import com.attendly.security.UserPrincipal;
import com.attendly.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @PostMapping
    public ResponseEntity<TimetableSlotResponse> createSlot(
            @Valid @RequestBody TimetableSlotRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TimetableSlotResponse response = timetableService.createSlot(request, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<TimetableSlotResponse>> getSlotsByClass(
            @PathVariable Long classId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<TimetableSlotResponse> slots = timetableService.getSlotsByClass(classId, userPrincipal.getId());
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/class/{classId}/day/{dayOfWeek}")
    public ResponseEntity<List<TimetableSlotResponse>> getSlotsByClassAndDay(
            @PathVariable Long classId,
            @PathVariable String dayOfWeek,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<TimetableSlotResponse> slots = timetableService.getSlotsByClassAndDay(
                classId, dayOfWeek, userPrincipal.getId());
        return ResponseEntity.ok(slots);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimetableSlotResponse> updateSlot(
            @PathVariable Long id,
            @Valid @RequestBody TimetableSlotRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TimetableSlotResponse response = timetableService.updateSlot(id, request, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        timetableService.deleteSlot(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}

package com.attendly.controller;

import com.attendly.entity.Teacher;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.TeacherRepository;
import com.attendly.security.UserPrincipal;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teacher")
@RequiredArgsConstructor
public class TeacherProfileController {

  private final TeacherRepository teacherRepository;

  @GetMapping("/profile")
  public ResponseEntity<Teacher> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    Teacher teacher =
        teacherRepository
            .findById(userPrincipal.getId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Teacher not found with id: " + userPrincipal.getId()));
    return ResponseEntity.ok(teacher);
  }

  @PutMapping("/profile")
  public ResponseEntity<Teacher> updateProfile(
      @RequestBody Map<String, String> updates,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    
    Teacher teacher =
        teacherRepository
            .findById(userPrincipal.getId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Teacher not found with id: " + userPrincipal.getId()));

    // Only allow updating phone number
    if (updates.containsKey("phone")) {
      teacher.setPhone(updates.get("phone"));
    }

    teacherRepository.save(teacher);
    return ResponseEntity.ok(teacher);
  }
}

package com.attendly.controller;

import com.attendly.dto.TeacherRequest;
import com.attendly.entity.Teacher;
import com.attendly.security.UserPrincipal;
import com.attendly.service.TeacherService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/teachers")
@RequiredArgsConstructor
public class TeacherController {

  private final TeacherService teacherService;

  @PostMapping
  public ResponseEntity<Teacher> createTeacher(
      @Valid @RequestBody TeacherRequest request,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    Teacher teacher = teacherService.createTeacher(request, userPrincipal.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(teacher);
  }

  @GetMapping
  public ResponseEntity<List<Teacher>> getAllTeachers(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    List<Teacher> teachers = teacherService.getAllTeachers(userPrincipal.getId());
    return ResponseEntity.ok(teachers);
  }

  @GetMapping("/department/{departmentId}")
  public ResponseEntity<List<Teacher>> getTeachersByDepartment(
      @PathVariable Long departmentId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
    List<Teacher> teachers =
        teacherService.getTeachersByDepartment(departmentId, userPrincipal.getId());
    return ResponseEntity.ok(teachers);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Teacher> getTeacherById(
      @PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
    Teacher teacher = teacherService.getTeacherById(id, userPrincipal.getId());
    return ResponseEntity.ok(teacher);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Teacher> updateTeacher(
      @PathVariable Long id,
      @Valid @RequestBody TeacherRequest request,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    Teacher teacher = teacherService.updateTeacher(id, request, userPrincipal.getId());
    return ResponseEntity.ok(teacher);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTeacher(
      @PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
    teacherService.deleteTeacher(id, userPrincipal.getId());
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/search")
  public ResponseEntity<List<Teacher>> searchTeachers(
      @RequestParam String q,
      @RequestParam(required = false) Long departmentId,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    List<Teacher> teachers;
    if (departmentId != null) {
      teachers = teacherService.searchTeachersInDepartment(q, departmentId);
    } else {
      teachers = teacherService.searchTeachers(q, userPrincipal.getId());
    }
    return ResponseEntity.ok(teachers);
  }
}

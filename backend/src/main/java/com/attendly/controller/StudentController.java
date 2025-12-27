package com.attendly.controller;

import com.attendly.dto.StudentRequest;
import com.attendly.entity.Student;
import com.attendly.security.UserPrincipal;
import com.attendly.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<Student> createStudent(
            @Valid @RequestBody StudentRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Student student = studentService.createStudent(request, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(student);
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Student> students = studentService.getAllStudents(userPrincipal.getId());
        return ResponseEntity.ok(students);
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Student>> getStudentsByClass(
            @PathVariable Long classId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Student> students = studentService.getStudentsByClass(classId, userPrincipal.getId());
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Student student = studentService.getStudentById(id, userPrincipal.getId());
        return ResponseEntity.ok(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Student student = studentService.updateStudent(id, request, userPrincipal.getId());
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        studentService.deleteStudent(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Student>> searchStudents(
            @RequestParam String q,
            @RequestParam Long classId) {
        List<Student> students = studentService.searchStudents(q, classId);
        return ResponseEntity.ok(students);
    }
}

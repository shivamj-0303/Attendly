package com.attendly.controller;

import com.attendly.dto.ClassRequest;
import com.attendly.entity.Class;
import com.attendly.security.UserPrincipal;
import com.attendly.service.ClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @PostMapping
    public ResponseEntity<Class> createClass(
            @Valid @RequestBody ClassRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Class classEntity = classService.createClass(request, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(classEntity);
    }

    @GetMapping
    public ResponseEntity<List<Class>> getAllClasses(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Class> classes = classService.getAllClasses(userPrincipal.getId());
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Class>> getClassesByDepartment(
            @PathVariable Long departmentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Class> classes = classService.getClassesByDepartment(departmentId, userPrincipal.getId());
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Class> getClassById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Class classEntity = classService.getClassById(id, userPrincipal.getId());
        return ResponseEntity.ok(classEntity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Class> updateClass(
            @PathVariable Long id,
            @Valid @RequestBody ClassRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Class classEntity = classService.updateClass(id, request, userPrincipal.getId());
        return ResponseEntity.ok(classEntity);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        classService.deleteClass(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Class>> searchClasses(
            @RequestParam String q,
            @RequestParam Long departmentId) {
        List<Class> classes = classService.searchClasses(q, departmentId);
        return ResponseEntity.ok(classes);
    }
}

package com.attendly.controller;

import com.attendly.dto.DepartmentRequest;
import com.attendly.entity.Department;
import com.attendly.security.UserPrincipal;
import com.attendly.service.DepartmentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/departments")
@RequiredArgsConstructor
public class DepartmentController {

  private final DepartmentService departmentService;

  @PostMapping
  public ResponseEntity<Department> createDepartment(
      @Valid @RequestBody DepartmentRequest request,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    Department department = departmentService.createDepartment(request, userPrincipal.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(department);
  }

  @GetMapping
  public ResponseEntity<List<Department>> getAllDepartments(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    List<Department> departments = departmentService.getAllDepartments(userPrincipal.getId());
    return ResponseEntity.ok(departments);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Department> getDepartmentById(
      @PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
    Department department = departmentService.getDepartmentById(id, userPrincipal.getId());
    return ResponseEntity.ok(department);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Department> updateDepartment(
      @PathVariable Long id,
      @Valid @RequestBody DepartmentRequest request,
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    Department department = departmentService.updateDepartment(id, request, userPrincipal.getId());
    return ResponseEntity.ok(department);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteDepartment(
      @PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
    departmentService.deleteDepartment(id, userPrincipal.getId());
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/search")
  public ResponseEntity<List<Department>> searchDepartments(
      @RequestParam String q, @AuthenticationPrincipal UserPrincipal userPrincipal) {
    List<Department> departments = departmentService.searchDepartments(q, userPrincipal.getId());
    return ResponseEntity.ok(departments);
  }
}

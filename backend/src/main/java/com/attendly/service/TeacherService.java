package com.attendly.service;

import com.attendly.dto.TeacherRequest;
import com.attendly.entity.Teacher;
import com.attendly.exception.ResourceAlreadyExistsException;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.DepartmentRepository;
import com.attendly.repository.TeacherRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TeacherService {

  private final TeacherRepository teacherRepository;
  private final DepartmentRepository departmentRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  public Teacher createTeacher(TeacherRequest request, Long adminId) {
    // Check if email already exists
    if (teacherRepository.existsByEmail(request.getEmail())) {
      throw new ResourceAlreadyExistsException(
          "Teacher with email " + request.getEmail() + " already exists");
    }

    // Verify department exists
    if (request.getDepartmentId() != null) {
      departmentRepository
          .findByIdAndAdminId(request.getDepartmentId(), adminId)
          .orElseThrow(
              () ->
                  new ResourceNotFoundException(
                      "Department not found with id: " + request.getDepartmentId()));
    }

    Teacher teacher =
        Teacher.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone())
            .departmentId(request.getDepartmentId())
            .adminId(adminId)
            .isActive(true)
            .build();

    return teacherRepository.save(teacher);
  }

  public List<Teacher> getAllTeachers(Long adminId) {
    return teacherRepository.findByAdminId(adminId);
  }

  public List<Teacher> getTeachersByDepartment(Long departmentId, Long adminId) {
    // Verify department belongs to admin
    departmentRepository
        .findByIdAndAdminId(departmentId, adminId)
        .orElseThrow(
            () -> new ResourceNotFoundException("Department not found with id: " + departmentId));

    return teacherRepository.findByDepartmentId(departmentId);
  }

  public Teacher getTeacherById(Long id, Long adminId) {
    return teacherRepository
        .findByIdAndAdminId(id, adminId)
        .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
  }

  @Transactional
  public Teacher updateTeacher(Long id, TeacherRequest request, Long adminId) {
    Teacher teacher = getTeacherById(id, adminId);

    // Check if new email conflicts with another teacher
    if (!teacher.getEmail().equals(request.getEmail())
        && teacherRepository.existsByEmail(request.getEmail())) {
      throw new ResourceAlreadyExistsException(
          "Teacher with email " + request.getEmail() + " already exists");
    }

    // Verify department if changed
    if (request.getDepartmentId() != null
        && !request.getDepartmentId().equals(teacher.getDepartmentId())) {
      departmentRepository
          .findByIdAndAdminId(request.getDepartmentId(), adminId)
          .orElseThrow(
              () ->
                  new ResourceNotFoundException(
                      "Department not found with id: " + request.getDepartmentId()));
    }

    teacher.setName(request.getName());
    teacher.setEmail(request.getEmail());
    if (request.getPassword() != null && !request.getPassword().isEmpty()) {
      teacher.setPassword(passwordEncoder.encode(request.getPassword()));
    }
    teacher.setPhone(request.getPhone());
    teacher.setDepartmentId(request.getDepartmentId());

    return teacherRepository.save(teacher);
  }

  @Transactional
  public void deleteTeacher(Long id, Long adminId) {
    Teacher teacher = getTeacherById(id, adminId);
    teacher.setIsActive(false);
    teacherRepository.save(teacher);
  }

  public List<Teacher> searchTeachers(String query, Long adminId) {
    return teacherRepository.findByAdminIdAndNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        adminId, query, query);
  }

  public List<Teacher> searchTeachersInDepartment(String query, Long departmentId) {
    return teacherRepository
        .findByDepartmentIdAndNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            departmentId, query, query);
  }
}

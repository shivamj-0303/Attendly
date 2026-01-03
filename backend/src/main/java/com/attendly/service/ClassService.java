package com.attendly.service;

import com.attendly.dto.ClassRequest;
import com.attendly.entity.Class;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.ClassRepository;
import com.attendly.repository.DepartmentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClassService {

  private final ClassRepository classRepository;
  private final DepartmentRepository departmentRepository;

  @Transactional
  public Class createClass(ClassRequest request, Long adminId) {
    // Verify department exists
    departmentRepository
        .findByIdAndAdminId(request.getDepartmentId(), adminId)
        .orElseThrow(
            () ->
                new ResourceNotFoundException(
                    "Department not found with id: " + request.getDepartmentId()));

    Class classEntity =
        Class.builder()
            .name(request.getName())
            .semester(request.getSemester())
            .year(request.getYear())
            .departmentId(request.getDepartmentId())
            .adminId(adminId)
            .isActive(true)
            .build();

    return classRepository.save(classEntity);
  }

  public List<Class> getAllClasses(Long adminId) {
    return classRepository.findByAdminId(adminId);
  }

  public List<Class> getClassesByDepartment(Long departmentId, Long adminId) {
    // Verify department belongs to admin
    departmentRepository
        .findByIdAndAdminId(departmentId, adminId)
        .orElseThrow(
            () -> new ResourceNotFoundException("Department not found with id: " + departmentId));

    return classRepository.findByDepartmentId(departmentId);
  }

  public Class getClassById(Long id, Long adminId) {
    return classRepository
        .findByIdAndAdminId(id, adminId)
        .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + id));
  }

  @Transactional
  public Class updateClass(Long id, ClassRequest request, Long adminId) {
    Class classEntity = getClassById(id, adminId);

    // Verify department if changed
    if (!classEntity.getDepartmentId().equals(request.getDepartmentId())) {
      departmentRepository
          .findByIdAndAdminId(request.getDepartmentId(), adminId)
          .orElseThrow(
              () ->
                  new ResourceNotFoundException(
                      "Department not found with id: " + request.getDepartmentId()));
    }

    classEntity.setName(request.getName());
    classEntity.setSemester(request.getSemester());
    classEntity.setYear(request.getYear());
    classEntity.setDepartmentId(request.getDepartmentId());

    return classRepository.save(classEntity);
  }

  @Transactional
  public void deleteClass(Long id, Long adminId) {
    Class classEntity = getClassById(id, adminId);
    classEntity.setIsActive(false);
    classRepository.save(classEntity);
  }

  public List<Class> searchClasses(String query, Long departmentId) {
    return classRepository.findByDepartmentIdAndNameContainingIgnoreCase(departmentId, query);
  }
}

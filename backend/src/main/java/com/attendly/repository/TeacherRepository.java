package com.attendly.repository;

import com.attendly.entity.Teacher;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

  Optional<Teacher> findByEmail(String email);

  List<Teacher> findByAdminId(Long adminId);

  List<Teacher> findByAdminIdAndIsActive(Long adminId, Boolean isActive);

  List<Teacher> findByDepartmentId(Long departmentId);

  List<Teacher> findByDepartmentIdAndIsActive(Long departmentId, Boolean isActive);

  List<Teacher> findByAdminIdAndDepartmentId(Long adminId, Long departmentId);

  List<Teacher> findByAdminIdAndDepartmentIdAndIsActive(Long adminId, Long departmentId, Boolean isActive);

  Optional<Teacher> findByIdAndAdminId(Long id, Long adminId);

  boolean existsByEmail(String email);

  List<Teacher> findByAdminIdAndNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
      Long adminId, String nameQuery, String emailQuery);

  List<Teacher> findByAdminIdAndIsActiveAndNameContainingIgnoreCaseOrAdminIdAndIsActiveAndEmailContainingIgnoreCase(
      Long adminId1, Boolean isActive1, String nameQuery,
      Long adminId2, Boolean isActive2, String emailQuery);

  List<Teacher> findByDepartmentIdAndNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
      Long departmentId, String nameQuery, String emailQuery);

  List<Teacher> findByDepartmentIdAndIsActiveAndNameContainingIgnoreCaseOrDepartmentIdAndIsActiveAndEmailContainingIgnoreCase(
      Long departmentId1, Boolean isActive1, String nameQuery,
      Long departmentId2, Boolean isActive2, String emailQuery);
}

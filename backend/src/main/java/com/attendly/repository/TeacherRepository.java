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

  List<Teacher> findByDepartmentId(Long departmentId);

  List<Teacher> findByAdminIdAndDepartmentId(Long adminId, Long departmentId);

  Optional<Teacher> findByIdAndAdminId(Long id, Long adminId);

  boolean existsByEmail(String email);

  List<Teacher> findByAdminIdAndNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
      Long adminId, String nameQuery, String emailQuery);

  List<Teacher> findByDepartmentIdAndNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
      Long departmentId, String nameQuery, String emailQuery);
}

package com.attendly.repository;

import com.attendly.entity.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

  Optional<Student> findByEmail(String email);

  Optional<Student> findByRollNumber(String rollNumber);

  List<Student> findByAdminId(Long adminId);

  List<Student> findByClassId(Long classId);

  List<Student> findByClassIdOrderByRollNumber(Long classId);

  List<Student> findByDepartmentId(Long departmentId);

  Optional<Student> findByIdAndAdminId(Long id, Long adminId);

  boolean existsByEmail(String email);

  boolean existsByRollNumber(String rollNumber);

  boolean existsByRegistrationNumber(String registrationNumber);

  List<Student> findByClassIdAndNameContainingIgnoreCaseOrRollNumberContainingIgnoreCase(
      Long classId, String nameQuery, String rollQuery);
}

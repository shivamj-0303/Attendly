package com.attendly.repository;

import com.attendly.entity.Class;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {

  List<Class> findByAdminId(Long adminId);

  List<Class> findByDepartmentId(Long departmentId);

  List<Class> findByAdminIdAndDepartmentId(Long adminId, Long departmentId);

  Optional<Class> findByIdAndAdminId(Long id, Long adminId);

  List<Class> findByDepartmentIdAndNameContainingIgnoreCase(Long departmentId, String nameQuery);
}

package com.attendly.repository;

import com.attendly.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    List<Department> findByAdminId(Long adminId);
    
    List<Department> findByAdminIdAndIsActive(Long adminId, Boolean isActive);
    
    Optional<Department> findByIdAndAdminId(Long id, Long adminId);
    
    boolean existsByCodeAndAdminId(String code, Long adminId);
    
    List<Department> findByAdminIdAndNameContainingIgnoreCaseOrCodeContainingIgnoreCase(
        Long adminId, String nameQuery, String codeQuery
    );
}

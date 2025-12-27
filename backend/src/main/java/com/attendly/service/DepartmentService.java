package com.attendly.service;

import com.attendly.dto.DepartmentRequest;
import com.attendly.entity.Department;
import com.attendly.exception.ResourceAlreadyExistsException;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Transactional
    public Department createDepartment(DepartmentRequest request, Long adminId) {
        // Check if department code already exists for this admin
        if (departmentRepository.existsByCodeAndAdminId(request.getCode(), adminId)) {
            throw new ResourceAlreadyExistsException("Department with code " + request.getCode() + " already exists");
        }

        Department department = Department.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .adminId(adminId)
                .isActive(true)
                .build();

        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments(Long adminId) {
        return departmentRepository.findByAdminIdAndIsActive(adminId, true);
    }

    public Department getDepartmentById(Long id, Long adminId) {
        return departmentRepository.findByIdAndAdminId(id, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    @Transactional
    public Department updateDepartment(Long id, DepartmentRequest request, Long adminId) {
        Department department = getDepartmentById(id, adminId);

        // Check if new code conflicts with another department
        if (!department.getCode().equals(request.getCode()) &&
                departmentRepository.existsByCodeAndAdminId(request.getCode(), adminId)) {
            throw new ResourceAlreadyExistsException("Department with code " + request.getCode() + " already exists");
        }

        department.setName(request.getName());
        department.setCode(request.getCode());
        department.setDescription(request.getDescription());

        return departmentRepository.save(department);
    }

    @Transactional
    public void deleteDepartment(Long id, Long adminId) {
        Department department = getDepartmentById(id, adminId);
        department.setIsActive(false);
        departmentRepository.save(department);
    }

    public List<Department> searchDepartments(String query, Long adminId) {
        return departmentRepository.findByAdminIdAndNameContainingIgnoreCaseOrCodeContainingIgnoreCase(
                adminId, query, query
        );
    }
}

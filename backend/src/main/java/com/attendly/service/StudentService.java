package com.attendly.service;

import com.attendly.dto.StudentRequest;
import com.attendly.entity.Student;
import com.attendly.exception.ResourceAlreadyExistsException;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.ClassRepository;
import com.attendly.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Student createStudent(StudentRequest request, Long adminId) {
        // Check if email already exists
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Student with email " + request.getEmail() + " already exists");
        }

        // Check if roll number already exists
        if (studentRepository.existsByRollNumber(request.getRollNumber())) {
            throw new ResourceAlreadyExistsException("Student with roll number " + request.getRollNumber() + " already exists");
        }

        // Verify class exists
        classRepository.findByIdAndAdminId(request.getClassId(), adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));

        Student student = Student.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .rollNumber(request.getRollNumber())
                .classId(request.getClassId())
                .departmentId(request.getDepartmentId())
                .adminId(adminId)
                .isActive(true)
                .build();

        return studentRepository.save(student);
    }

    public List<Student> getAllStudents(Long adminId) {
        return studentRepository.findByAdminId(adminId);
    }

    public List<Student> getStudentsByClass(Long classId, Long adminId) {
        // Verify class belongs to admin
        classRepository.findByIdAndAdminId(classId, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
        
        return studentRepository.findByClassId(classId);
    }

    public Student getStudentById(Long id, Long adminId) {
        return studentRepository.findByIdAndAdminId(id, adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    @Transactional
    public Student updateStudent(Long id, StudentRequest request, Long adminId) {
        Student student = getStudentById(id, adminId);

        // Check if new email conflicts with another student
        if (!student.getEmail().equals(request.getEmail()) &&
                studentRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Student with email " + request.getEmail() + " already exists");
        }

        // Check if new roll number conflicts with another student
        if (!student.getRollNumber().equals(request.getRollNumber()) &&
                studentRepository.existsByRollNumber(request.getRollNumber())) {
            throw new ResourceAlreadyExistsException("Student with roll number " + request.getRollNumber() + " already exists");
        }

        // Verify class if changed
        if (!student.getClassId().equals(request.getClassId())) {
            classRepository.findByIdAndAdminId(request.getClassId(), adminId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId()));
        }

        student.setName(request.getName());
        student.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            student.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        student.setPhone(request.getPhone());
        student.setRollNumber(request.getRollNumber());
        student.setClassId(request.getClassId());
        student.setDepartmentId(request.getDepartmentId());

        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id, Long adminId) {
        Student student = getStudentById(id, adminId);
        student.setIsActive(false);
        studentRepository.save(student);
    }

    public List<Student> searchStudents(String query, Long classId) {
        return studentRepository.findByClassIdAndNameContainingIgnoreCaseOrRollNumberContainingIgnoreCase(
                classId, query, query
        );
    }
}

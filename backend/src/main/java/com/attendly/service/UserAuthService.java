package com.attendly.service;

import com.attendly.dto.AuthResponse;
import com.attendly.dto.LoginRequest;
import com.attendly.entity.Student;
import com.attendly.entity.Teacher;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.StudentRepository;
import com.attendly.repository.TeacherRepository;
import com.attendly.security.JwtService;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserAuthService {

  private final StudentRepository studentRepository;
  private final TeacherRepository teacherRepository;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;
  private final RefreshTokenService refreshTokenService;

  @Transactional
  public AuthResponse studentLogin(LoginRequest request) {
    // Get student details
    Student student =
        studentRepository
            .findByEmail(request.getEmail())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Student not found with email: " + request.getEmail()));

    // Verify password
    if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
      throw new org.springframework.security.authentication.BadCredentialsException(
          "Invalid email or password");
    }

    // Check if student is active
    if (!student.getIsActive()) {
      throw new ResourceNotFoundException("Student account is inactive");
    }

    // Generate JWT token with extra claims
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", student.getId());
    claims.put("name", student.getName());
    claims.put("role", "STUDENT");
    claims.put("classId", student.getClassId());
    claims.put("departmentId", student.getDepartmentId());

    // Create a simple user details object for JWT generation
    org.springframework.security.core.userdetails.User userDetails =
        new org.springframework.security.core.userdetails.User(
            student.getEmail(), student.getPassword(), java.util.Collections.emptyList());

    String jwtToken = jwtService.generateToken(claims, userDetails);

    // Generate refresh token
    var refreshToken =
        refreshTokenService.createRefreshToken(student.getEmail(), "STUDENT", userDetails);

    return AuthResponse.builder()
        .token(jwtToken)
        .refreshToken(refreshToken.getToken())
        .id(student.getId())
        .name(student.getName())
        .email(student.getEmail())
        .role("STUDENT")
        .build();
  }

  @Transactional
  public AuthResponse teacherLogin(LoginRequest request) {
    // Get teacher details
    Teacher teacher =
        teacherRepository
            .findByEmail(request.getEmail())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Teacher not found with email: " + request.getEmail()));

    // Verify password
    if (!passwordEncoder.matches(request.getPassword(), teacher.getPassword())) {
      throw new org.springframework.security.authentication.BadCredentialsException(
          "Invalid email or password");
    }

    // Check if teacher is active
    if (!teacher.getIsActive()) {
      throw new ResourceNotFoundException("Teacher account is inactive");
    }

    // Generate JWT token with extra claims
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", teacher.getId());
    claims.put("name", teacher.getName());
    claims.put("role", "TEACHER");
    claims.put("departmentId", teacher.getDepartmentId());

    // Create a simple user details object for JWT generation
    org.springframework.security.core.userdetails.User userDetails =
        new org.springframework.security.core.userdetails.User(
            teacher.getEmail(), teacher.getPassword(), java.util.Collections.emptyList());

    String jwtToken = jwtService.generateToken(claims, userDetails);

    // Generate refresh token
    var refreshToken =
        refreshTokenService.createRefreshToken(teacher.getEmail(), "TEACHER", userDetails);

    return AuthResponse.builder()
        .token(jwtToken)
        .refreshToken(refreshToken.getToken())
        .id(teacher.getId())
        .name(teacher.getName())
        .email(teacher.getEmail())
        .role("TEACHER")
        .build();
  }

  @Transactional
  public AuthResponse refreshStudentToken(String refreshTokenStr) {
    return refreshTokenService
        .findByToken(refreshTokenStr)
        .filter(rt -> rt.getUserType().equals("STUDENT"))
        .map(refreshTokenService::verifyExpiration)
        .map(
            refreshToken -> {
              Student student =
                  studentRepository
                      .findByEmail(refreshToken.getUsername())
                      .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

              Map<String, Object> claims = new HashMap<>();
              claims.put("userId", student.getId());
              claims.put("name", student.getName());
              claims.put("role", "STUDENT");
              claims.put("classId", student.getClassId());
              claims.put("departmentId", student.getDepartmentId());

              org.springframework.security.core.userdetails.User userDetails =
                  new org.springframework.security.core.userdetails.User(
                      student.getEmail(), student.getPassword(), java.util.Collections.emptyList());

              String newAccessToken = jwtService.generateToken(claims, userDetails);

              return AuthResponse.builder()
                  .token(newAccessToken)
                  .refreshToken(refreshTokenStr)
                  .id(student.getId())
                  .name(student.getName())
                  .email(student.getEmail())
                  .role("STUDENT")
                  .build();
            })
        .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
  }

  @Transactional
  public AuthResponse refreshTeacherToken(String refreshTokenStr) {
    return refreshTokenService
        .findByToken(refreshTokenStr)
        .filter(rt -> rt.getUserType().equals("TEACHER"))
        .map(refreshTokenService::verifyExpiration)
        .map(
            refreshToken -> {
              Teacher teacher =
                  teacherRepository
                      .findByEmail(refreshToken.getUsername())
                      .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

              Map<String, Object> claims = new HashMap<>();
              claims.put("userId", teacher.getId());
              claims.put("name", teacher.getName());
              claims.put("role", "TEACHER");
              claims.put("departmentId", teacher.getDepartmentId());

              org.springframework.security.core.userdetails.User userDetails =
                  new org.springframework.security.core.userdetails.User(
                      teacher.getEmail(),
                      teacher.getPassword(),
                      java.util.Collections.emptyList());

              String newAccessToken = jwtService.generateToken(claims, userDetails);

              return AuthResponse.builder()
                  .token(newAccessToken)
                  .refreshToken(refreshTokenStr)
                  .id(teacher.getId())
                  .name(teacher.getName())
                  .email(teacher.getEmail())
                  .role("TEACHER")
                  .build();
            })
        .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
  }
}

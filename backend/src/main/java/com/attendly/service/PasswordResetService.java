package com.attendly.service;

import com.attendly.dto.OtpVerificationRequest;
import com.attendly.dto.PasswordResetRequest;
import com.attendly.dto.ResetPasswordRequest;
import com.attendly.entity.OtpVerification;
import com.attendly.entity.Student;
import com.attendly.entity.Teacher;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.StudentRepository;
import com.attendly.repository.TeacherRepository;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

  private final EmailService emailService;
  private final OtpService otpService;
  private final PasswordEncoder passwordEncoder;
  private final StudentRepository studentRepository;
  private final TeacherRepository teacherRepository;

  @Transactional
  public Map<String, String> requestPasswordReset(PasswordResetRequest request) {
    String email = request.getEmail();
    String userType = request.getUserType().toUpperCase();

    Long userId = null;
    String phone = null;
    String userName = null;

    // Find user by email and type
    if ("STUDENT".equals(userType)) {
      Student student =
          studentRepository
              .findByEmail(email)
              .orElseThrow(() -> new ResourceNotFoundException("Student not found with this email"));
      userId = student.getId();
      phone = student.getPhone();
      userName = student.getName();
    } else if ("TEACHER".equals(userType)) {
      Teacher teacher =
          teacherRepository
              .findByEmail(email)
              .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with this email"));
      userId = teacher.getId();
      phone = teacher.getPhone();
      userName = teacher.getName();
    } else {
      throw new IllegalArgumentException("Invalid user type");
    }

    // Generate OTP
    OtpVerification otp = otpService.createOtp(userId, userType, "PASSWORD_RESET");

    // Send OTP via email
    emailService.sendOtpEmail(email, userName, otp.getOtpCode(), "PASSWORD_RESET");

    Map<String, String> response = new HashMap<>();
    response.put("message", "OTP sent to your registered email address");
    response.put("email", maskEmail(email));
    if (phone != null && !phone.isEmpty()) {
      response.put("phone", maskPhoneNumber(phone));
    }

    return response;
  }

  /**
   * Verify OTP only (optional endpoint - kept for backward compatibility)
   * Note: The resetPassword method now handles verification inline, so this is not required.
   */
  @Transactional
  public Map<String, String> verifyOtp(OtpVerificationRequest request) {
    // Verify OTP exists and is valid (doesn't mark as verified to allow reset to use it)
    OtpVerification otp = otpService.getOtpByCodeAllowVerified(request.getOtpCode());

    Map<String, String> response = new HashMap<>();
    response.put("message", "OTP verified successfully");
    response.put("verified", "true");

    return response;
  }

  /**
   * Reset password with OTP verification in a single atomic operation.
   * This verifies the OTP and resets the password in one transaction.
   */
  @Transactional
  public Map<String, String> resetPassword(ResetPasswordRequest request) {
    // Verify OTP code exists and is not expired (will throw exception if invalid)
    OtpVerification otp = otpService.verifyOtpByCode(request.getOtpCode());

    // Update password based on user type
    if ("STUDENT".equals(otp.getUserType())) {
      Student student =
          studentRepository
              .findById(otp.getUserId())
              .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
      student.setPassword(passwordEncoder.encode(request.getNewPassword()));
      student.setFirstLogin(false);
      studentRepository.save(student);
    } else if ("TEACHER".equals(otp.getUserType())) {
      Teacher teacher =
          teacherRepository
              .findById(otp.getUserId())
              .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
      teacher.setPassword(passwordEncoder.encode(request.getNewPassword()));
      teacherRepository.save(teacher);
    } else {
      throw new IllegalArgumentException("Invalid user type: " + otp.getUserType());
    }

    // Delete the OTP after successful password reset (single-use enforcement)
    otpService.deleteOtp(otp);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Password reset successfully");

    return response;
  }

  private String maskPhoneNumber(String phone) {
    if (phone == null || phone.length() < 4) {
      return "****";
    }
    return "******" + phone.substring(phone.length() - 4);
  }

  private String maskEmail(String email) {
    if (email == null || !email.contains("@")) {
      return "****@****.com";
    }
    String[] parts = email.split("@");
    String localPart = parts[0];
    String domain = parts[1];

    if (localPart.length() <= 2) {
      return "**@" + domain;
    }

    String masked = localPart.substring(0, 2) + "****";
    return masked + "@" + domain;
  }
}

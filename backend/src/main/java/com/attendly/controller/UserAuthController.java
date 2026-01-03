package com.attendly.controller;

import com.attendly.dto.AuthResponse;
import com.attendly.dto.LoginRequest;
import com.attendly.dto.OtpVerificationRequest;
import com.attendly.dto.PasswordResetRequest;
import com.attendly.dto.ResetPasswordRequest;
import com.attendly.service.PasswordResetService;
import com.attendly.service.UserAuthService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/user")
@RequiredArgsConstructor
public class UserAuthController {

  private final PasswordResetService passwordResetService;
  private final UserAuthService userAuthService;

  @PostMapping("/student/login")
  public ResponseEntity<AuthResponse> studentLogin(@Valid @RequestBody LoginRequest request) {
    AuthResponse response = userAuthService.studentLogin(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/teacher/login")
  public ResponseEntity<AuthResponse> teacherLogin(@Valid @RequestBody LoginRequest request) {
    AuthResponse response = userAuthService.teacherLogin(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/request-password-reset")
  public ResponseEntity<Map<String, String>> requestPasswordReset(
      @Valid @RequestBody PasswordResetRequest request) {
    Map<String, String> response = passwordResetService.requestPasswordReset(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/verify-otp")
  public ResponseEntity<Map<String, String>> verifyOtp(
      @Valid @RequestBody OtpVerificationRequest request) {
    Map<String, String> response = passwordResetService.verifyOtp(request);
    return ResponseEntity.ok(response);
  }

  @PostMapping("/reset-password")
  public ResponseEntity<Map<String, String>> resetPassword(
      @Valid @RequestBody ResetPasswordRequest request) {
    Map<String, String> response = passwordResetService.resetPassword(request);
    return ResponseEntity.ok(response);
  }
}

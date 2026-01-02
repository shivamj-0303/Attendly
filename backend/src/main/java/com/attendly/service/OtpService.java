package com.attendly.service;

import com.attendly.entity.OtpVerification;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.OtpVerificationRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OtpService {

  private final OtpVerificationRepository otpVerificationRepository;
  private static final int OTP_LENGTH = 6;
  private static final int OTP_VALIDITY_MINUTES = 10;

  /**
   * Generate a random 6-digit OTP code
   */
  private String generateOtpCode() {
    SecureRandom random = new SecureRandom();
    int otp = 100000 + random.nextInt(900000); // Generates 6-digit number
    return String.valueOf(otp);
  }

  /**
   * Create and save a new OTP for a user
   */
  @Transactional
  public OtpVerification createOtp(Long userId, String userType, String purpose) {
    // Invalidate any existing OTPs for this user and purpose
    Optional<OtpVerification> existingOtp =
        otpVerificationRepository
            .findByUserIdAndUserTypeAndPurposeAndVerifiedFalseAndExpiryTimeAfter(
                userId, userType, purpose, LocalDateTime.now());

    existingOtp.ifPresent(otpVerificationRepository::delete);

    // Create new OTP
    String otpCode = generateOtpCode();
    LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

    OtpVerification otp =
        OtpVerification.builder()
            .userId(userId)
            .userType(userType)
            .purpose(purpose)
            .otpCode(otpCode)
            .expiryTime(expiryTime)
            .verified(false)
            .build();

    return otpVerificationRepository.save(otp);
  }

  /**
   * Verify an OTP code
   */
  @Transactional
  public boolean verifyOtp(String otpCode, Long userId, String userType, String purpose) {
    Optional<OtpVerification> otpOpt =
        otpVerificationRepository
            .findByUserIdAndUserTypeAndPurposeAndVerifiedFalseAndExpiryTimeAfter(
                userId, userType, purpose, LocalDateTime.now());

    if (otpOpt.isEmpty()) {
      return false;
    }

    OtpVerification otp = otpOpt.get();

    if (!otp.getOtpCode().equals(otpCode)) {
      return false;
    }

    if (otp.isExpired()) {
      return false;
    }

    // Mark as verified
    otp.setVerified(true);
    otpVerificationRepository.save(otp);

    return true;
  }

  /**
   * Verify OTP by code only (for simpler verification flow)
   */
  @Transactional
  public OtpVerification verifyOtpByCode(String otpCode) {
    OtpVerification otp =
        otpVerificationRepository
            .findByOtpCodeAndVerifiedFalseAndExpiryTimeAfter(otpCode, LocalDateTime.now())
            .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired OTP"));

    otp.setVerified(true);
    return otpVerificationRepository.save(otp);
  }

  /**
   * Fetch OTP by code regardless of whether it's already marked verified. Used during reset
   * so a previously-verified OTP can be accepted.
   */
  @Transactional
  public OtpVerification getOtpByCodeAllowVerified(String otpCode) {
    OtpVerification otp =
        otpVerificationRepository
            .findByOtpCodeAndExpiryTimeAfter(otpCode, LocalDateTime.now())
            .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired OTP"));

    if (otp.isExpired()) {
      throw new ResourceNotFoundException("Invalid or expired OTP");
    }

    return otp;
  }

  @Transactional
  public OtpVerification markOtpAsVerified(OtpVerification otp) {
    if (otp.getVerified() == null || !otp.getVerified()) {
      otp.setVerified(true);
      return otpVerificationRepository.save(otp);
    }
    return otp;
  }

  /**
   * Check if OTP exists and is valid
   */
  public boolean isOtpValid(Long userId, String userType, String purpose) {
    Optional<OtpVerification> otp =
        otpVerificationRepository
            .findByUserIdAndUserTypeAndPurposeAndVerifiedFalseAndExpiryTimeAfter(
                userId, userType, purpose, LocalDateTime.now());
    return otp.isPresent();
  }

  /**
   * Delete an OTP after successful use (enforces single-use)
   */
  @Transactional
  public void deleteOtp(OtpVerification otp) {
    otpVerificationRepository.delete(otp);
  }

  /**
   * Clean up expired OTPs
   */
  @Transactional
  public void cleanupExpiredOtps() {
    otpVerificationRepository.deleteByExpiryTimeBefore(LocalDateTime.now());
  }
}

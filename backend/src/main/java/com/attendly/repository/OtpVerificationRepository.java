package com.attendly.repository;

import com.attendly.entity.OtpVerification;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

  Optional<OtpVerification> findByUserIdAndUserTypeAndPurposeAndVerifiedFalseAndExpiryTimeAfter(
      Long userId, String userType, String purpose, LocalDateTime currentTime);

  Optional<OtpVerification> findByOtpCodeAndVerifiedFalseAndExpiryTimeAfter(
      String otpCode, LocalDateTime currentTime);

  Optional<OtpVerification> findByOtpCodeAndExpiryTimeAfter(String otpCode, LocalDateTime currentTime);

  List<OtpVerification> findByExpiryTimeBefore(LocalDateTime time);

  void deleteByExpiryTimeBefore(LocalDateTime time);
}

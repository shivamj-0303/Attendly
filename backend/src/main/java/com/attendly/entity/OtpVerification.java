package com.attendly.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "otp_verifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpVerification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long userId;

  @Column(nullable = false, length = 10)
  private String otpCode;

  @Column(nullable = false)
  private String userType; // "STUDENT" or "TEACHER"

  @Column(nullable = false)
  private String purpose; // "PASSWORD_RESET" or "PHONE_VERIFICATION"

  @Column(nullable = false)
  private Boolean verified = false;

  @Column(nullable = false)
  private LocalDateTime expiryTime;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  public boolean isExpired() {
    return LocalDateTime.now().isAfter(expiryTime);
  }
}

package com.attendly.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpVerificationRequest {

  @NotBlank(message = "OTP code is required")
  @Size(min = 6, max = 6, message = "OTP must be 6 digits")
  private String otpCode;
}

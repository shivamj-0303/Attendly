package com.attendly.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

  private String token;
  private String type = "Bearer";
  private Long id;
  private String name;
  private String email;
  private String role;
  private String message;

  public AuthResponse(String token, Long id, String name, String email, String role) {
    this.token = token;
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }
}

package com.attendly.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkStudentImportRequest {

  @NotEmpty(message = "students list cannot be empty")
  private List<StudentItem> students;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class StudentItem {
    @NotNull
    private String name;

    @NotNull
    private String email;

    @NotNull
    private String phone;

    // Roll number is optional - will be auto-generated if not provided
    private String rollNumber;

    private String registrationNumber;

    @NotNull
    private Long classId;

    @NotNull
    private Long departmentId;
  }
}

package com.attendly.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassRequest {

    @NotBlank(message = "Class name is required")
    @Size(min = 2, max = 100, message = "Class name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Semester is required")
    private Integer semester;

    @NotNull(message = "Year is required")
    private Integer year;

    @NotNull(message = "Department ID is required")
    private Long departmentId;
}

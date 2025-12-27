package com.attendly.controller;

import com.attendly.dto.AuthResponse;
import com.attendly.dto.LoginRequest;
import com.attendly.service.UserAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/user")
@RequiredArgsConstructor
public class UserAuthController {

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
}

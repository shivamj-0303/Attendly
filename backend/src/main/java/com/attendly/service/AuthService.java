package com.attendly.service;

import com.attendly.dto.AuthResponse;
import com.attendly.dto.LoginRequest;
import com.attendly.dto.SignupRequest;
import com.attendly.entity.Admin;
import com.attendly.exception.ResourceAlreadyExistsException;
import com.attendly.repository.AdminRepository;
import com.attendly.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        // Check if admin already exists
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Admin already exists with email: " + request.getEmail());
        }

        // Check if institution name already exists
        if (adminRepository.existsByInstitution(request.getInstitution())) {
            throw new ResourceAlreadyExistsException("Institution already registered: " + request.getInstitution());
        }

        // Create new admin
        Admin admin = Admin.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .institution(request.getInstitution())
                .institutionAddress(request.getInstitutionAddress())
                .institutionCity(request.getInstitutionCity())
                .institutionState(request.getInstitutionState())
                .institutionPostalCode(request.getInstitutionPostalCode())
                .institutionPhone(request.getInstitutionPhone())
                .institutionEmail(request.getInstitutionEmail())
                .role(Admin.Role.ADMIN)
                .isActive(true)
                .build();

        admin = adminRepository.save(admin);

        // Generate JWT token with extra claims
        Map<String, Object> claims = new HashMap<>();
        claims.put("adminId", admin.getId());
        claims.put("name", admin.getName());
        String jwtToken = jwtService.generateToken(claims, admin);

        return new AuthResponse(
                jwtToken,
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getRole().name()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Get admin details
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new com.attendly.exception.ResourceNotFoundException("Admin not found"));

        // Generate JWT token with extra claims
        Map<String, Object> claims = new HashMap<>();
        claims.put("adminId", admin.getId());
        claims.put("name", admin.getName());
        String jwtToken = jwtService.generateToken(claims, admin);

        return new AuthResponse(
                jwtToken,
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getRole().name()
        );
    }
}

package com.attendly.service;

import com.attendly.entity.RefreshToken;
import com.attendly.repository.RefreshTokenRepository;
import com.attendly.security.JwtService;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefreshTokenService {

  @Autowired private RefreshTokenRepository refreshTokenRepository;

  @Autowired private JwtService jwtService;

  @Value("${jwt.refresh-expiration}")
  private long refreshTokenDurationMs;

  @Transactional
  public RefreshToken createRefreshToken(String username, String userType, UserDetails userDetails) {
    // Delete any existing refresh token for this user
    refreshTokenRepository.deleteByUsername(username);

    // Generate new refresh token
    String token = jwtService.generateRefreshToken(userDetails);

    RefreshToken refreshToken =
        new RefreshToken(
            token,
            username,
            userType,
            LocalDateTime.now().plusSeconds(refreshTokenDurationMs / 1000));

    return refreshTokenRepository.save(refreshToken);
  }

  public Optional<RefreshToken> findByToken(String token) {
    return refreshTokenRepository.findByToken(token);
  }

  public RefreshToken verifyExpiration(RefreshToken token) {
    if (token.isExpired()) {
      refreshTokenRepository.delete(token);
      throw new RuntimeException(
          "Refresh token was expired. Please make a new signin request");
    }
    return token;
  }

  @Transactional
  public void deleteByUsername(String username) {
    refreshTokenRepository.deleteByUsername(username);
  }

  @Transactional
  public void deleteExpiredTokens() {
    refreshTokenRepository.deleteExpiredTokens();
  }

  @Transactional
  public void revokeToken(String token) {
    refreshTokenRepository
        .findByToken(token)
        .ifPresent(
            rt -> {
              rt.setRevoked(true);
              refreshTokenRepository.save(rt);
            });
  }
}

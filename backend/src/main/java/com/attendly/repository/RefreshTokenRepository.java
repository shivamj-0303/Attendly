package com.attendly.repository;

import com.attendly.entity.RefreshToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

  Optional<RefreshToken> findByToken(String token);

  Optional<RefreshToken> findByUsername(String username);

  @Modifying
  @Query("DELETE FROM RefreshToken rt WHERE rt.username = :username")
  void deleteByUsername(String username);

  @Modifying
  @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < CURRENT_TIMESTAMP")
  void deleteExpiredTokens();
}

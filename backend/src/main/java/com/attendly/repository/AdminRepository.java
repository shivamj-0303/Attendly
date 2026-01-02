package com.attendly.repository;

import com.attendly.entity.Admin;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

  Optional<Admin> findByEmail(String email);

  boolean existsByEmail(String email);

  boolean existsByInstitution(String institution);
}

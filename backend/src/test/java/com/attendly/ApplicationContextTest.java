package com.attendly;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Application Context Tests")
class ApplicationContextTest {

  @Test
  @DisplayName("Should load application context successfully")
  void contextLoads() {
    // This test verifies that the Spring application context loads correctly
    assertThat(true).isTrue();
  }
}

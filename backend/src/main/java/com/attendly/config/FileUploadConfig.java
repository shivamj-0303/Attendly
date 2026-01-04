package com.attendly.config;

import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

  @Value("${file.upload-dir:uploads/profile-photos}")
  private String uploadDir;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Convert to absolute path
    String absolutePath = Paths.get(uploadDir).toAbsolutePath().toString();
    
    // Serve uploaded files from /uploads/profile-photos/** URL pattern
    registry
        .addResourceHandler("/uploads/profile-photos/**")
        .addResourceLocations("file:" + absolutePath + "/");
  }
}

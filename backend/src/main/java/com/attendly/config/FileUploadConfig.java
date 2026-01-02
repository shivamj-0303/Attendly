package com.attendly.config;

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
    // Serve uploaded files from /uploads/** URL pattern
    registry
        .addResourceHandler("/uploads/**")
        .addResourceLocations("file:" + uploadDir + "/");
  }
}

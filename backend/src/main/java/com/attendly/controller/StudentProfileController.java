package com.attendly.controller;

import com.attendly.entity.Student;
import com.attendly.exception.ResourceNotFoundException;
import com.attendly.repository.StudentRepository;
import com.attendly.security.UserPrincipal;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentProfileController {

  private final StudentRepository studentRepository;

  @Value("${file.upload-dir:uploads/profile-photos}")
  private String uploadDir;

  @PostMapping("/upload-profile-photo")
  public ResponseEntity<Map<String, String>> uploadProfilePhoto(
      @RequestParam("file") MultipartFile file,
      @AuthenticationPrincipal UserPrincipal userPrincipal)
      throws IOException {

    // Validate file
    if (file.isEmpty()) {
      throw new IllegalArgumentException("File is empty");
    }

    // Validate file type
    String contentType = file.getContentType();
    if (contentType == null
        || !(contentType.equals("image/jpeg")
            || contentType.equals("image/png")
            || contentType.equals("image/jpg"))) {
      throw new IllegalArgumentException("Only JPEG and PNG images are allowed");
    }

    // Validate file size (max 5MB)
    if (file.getSize() > 5 * 1024 * 1024) {
      throw new IllegalArgumentException("File size must not exceed 5MB");
    }

    // Get student
    Student student =
        studentRepository
            .findById(userPrincipal.getId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Student not found with id: " + userPrincipal.getId()));

    // Create upload directory if it doesn't exist
    Path uploadPath = Paths.get(uploadDir);
    if (!Files.exists(uploadPath)) {
      Files.createDirectories(uploadPath);
    }

    // Generate unique filename
    String originalFilename = file.getOriginalFilename();
    String fileExtension = "";
    if (originalFilename != null && originalFilename.contains(".")) {
      fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
    }
    String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

    // Save file
    Path filePath = uploadPath.resolve(uniqueFilename);
    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

    // Update student profile photo URL
    String photoUrl = "/uploads/profile-photos/" + uniqueFilename;
    student.setProfilePhotoUrl(photoUrl);
    studentRepository.save(student);

    // Return response
    Map<String, String> response = new HashMap<>();
    response.put("message", "Profile photo uploaded successfully");
    response.put("photoUrl", photoUrl);

    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/delete-profile-photo")
  public ResponseEntity<Map<String, String>> deleteProfilePhoto(
      @AuthenticationPrincipal UserPrincipal userPrincipal) throws IOException {

    // Get student
    Student student =
        studentRepository
            .findById(userPrincipal.getId())
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Student not found with id: " + userPrincipal.getId()));

    // Delete file if exists
    if (student.getProfilePhotoUrl() != null && !student.getProfilePhotoUrl().isEmpty()) {
      String filename = student.getProfilePhotoUrl().replace("/uploads/profile-photos/", "");
      Path filePath = Paths.get(uploadDir).resolve(filename);
      if (Files.exists(filePath)) {
        Files.delete(filePath);
      }
    }

    // Update student profile
    student.setProfilePhotoUrl(null);
    studentRepository.save(student);

    // Return response
    Map<String, String> response = new HashMap<>();
    response.put("message", "Profile photo deleted successfully");

    return ResponseEntity.ok(response);
  }
}

package com.attendly.service;

import com.attendly.repository.AdminRepository;
import com.attendly.repository.StudentRepository;
import com.attendly.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find in Admin repository first
        var admin = adminRepository.findByEmail(username);
        if (admin.isPresent()) {
            return admin.get();
        }
        
        // Try Student repository
        var student = studentRepository.findByEmail(username);
        if (student.isPresent()) {
            return student.get();
        }
        
        // Try Teacher repository
        var teacher = teacherRepository.findByEmail(username);
        if (teacher.isPresent()) {
            return teacher.get();
        }
        
        throw new UsernameNotFoundException("User not found with email: " + username);
    }
}

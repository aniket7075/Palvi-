package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.*;
import com.palvi.Palvi.Hotel.entity.User;
import com.palvi.Palvi.Hotel.exception.BadRequestException;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.repository.UserRepository;
import com.palvi.Palvi.Hotel.security.JwtTokenProvider;
import com.palvi.Palvi.Hotel.service.AuthService;
import com.palvi.Palvi.Hotel.service.EmailService;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        String refresh = tokenProvider.generateRefreshToken(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        return AuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refresh)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().getName())
                .outletId(user.getOutlet() != null ? user.getOutlet().getId() : null)
                .outletName(user.getOutlet() != null ? user.getOutlet().getOutletName() : null)
                .build();
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));
        
        // Generate random 4-digit OTP (between 1000 and 9999)
        int randomPin = (int) (Math.random() * 9000) + 1000;
        String otp = String.valueOf(randomPin);

        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otp);

        System.out.println("----------------------------------------");
        System.out.println("FORGOT PASSWORD OTP SENT TO: " + user.getEmail());
        System.out.println("OTP CODE: " + otp);
        System.out.println("----------------------------------------");
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getToken())) {
            throw new BadRequestException("Incorrect verification code.");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification code has expired.");
        }
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getToken())) {
            throw new BadRequestException("Incorrect verification code.");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification code has expired.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        // Clear OTP code and expiry
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    @Override
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Old password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}

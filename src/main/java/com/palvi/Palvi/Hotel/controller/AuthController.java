package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.*;
import com.palvi.Palvi.Hotel.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication Controller", description = "Endpoints for user login, password resets, and changes")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user credentials and returns JWT access & refresh tokens")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot Password Request", description = "Generates a password reset request and outputs code to system logs")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("Password reset code sent to your email. Check system logs for code token.");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset Password", description = "Resets user password using the verification code")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password has been reset successfully.");
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change Password", description = "Updates password for currently authenticated user")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok("Password changed successfully.");
    }

    @PostMapping("/logout")
    @Operation(summary = "User Logout", description = "Clears security contexts and logs out user")
    public ResponseEntity<String> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logged out successfully.");
    }
}

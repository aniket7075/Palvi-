package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.*;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void verifyOtp(VerifyOtpRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(String email, ChangePasswordRequest request);
}

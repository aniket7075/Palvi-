package com.palvi.Palvi.Hotel.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
}

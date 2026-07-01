package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Palvi Hotel - Password Reset OTP");
        message.setText("Dear User,\n\n" +
                "You requested to reset your password. Use the following 4-digit verification code to proceed:\n\n" +
                "OTP Code: " + otpCode + "\n\n" +
                "This code is valid for 5 minutes. If you did not request this, please ignore this email.\n\n" +
                "Regards,\n" +
                "Palvi Hotel Team");
        mailSender.send(message);
    }
}

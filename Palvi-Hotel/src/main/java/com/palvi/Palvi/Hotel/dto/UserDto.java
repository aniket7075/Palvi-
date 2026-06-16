package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String role;
    private Long outletId;
    private String outletName;
    private String password;
}

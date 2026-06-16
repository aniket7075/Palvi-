package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.UserDto;
import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.entity.Role;
import com.palvi.Palvi.Hotel.entity.User;
import com.palvi.Palvi.Hotel.exception.BadRequestException;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.repository.RoleRepository;
import com.palvi.Palvi.Hotel.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Controller", description = "Endpoints for Admin to CRUD managers and user accounts")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping
    @Operation(summary = "Create Manager / User", description = "Admin can register new manager/user accounts")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        Role role = roleRepository.findByName(dto.getRole() != null ? dto.getRole() : "MANAGER")
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        Outlet outlet = null;
        if (dto.getOutletId() != null) {
            outlet = outletRepository.findById(dto.getOutletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Outlet not found"));
        }

        User user = User.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .mobileNumber(dto.getMobileNumber())
                .password(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "Manager@123"))
                .role(role)
                .outlet(outlet)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        return new ResponseEntity<>(mapToDto(saved), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get All Users", description = "Retrieves list of all users/managers")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> list = userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get User by ID", description = "Retrieves details of a user account")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(mapToDto(user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update User Details", description = "Admin can edit manager/user info")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getEmail().equals(dto.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        Role role = roleRepository.findByName(dto.getRole() != null ? dto.getRole() : "MANAGER")
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        Outlet outlet = null;
        if (dto.getOutletId() != null) {
            outlet = outletRepository.findById(dto.getOutletId())
                    .orElseThrow(() -> new ResourceNotFoundException("Outlet not found"));
        }

        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setMobileNumber(dto.getMobileNumber());
        user.setRole(role);
        user.setOutlet(outlet);

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        User updated = userRepository.save(user);
        return ResponseEntity.ok(mapToDto(updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete User Profile", description = "Admin can remove a user/manager account")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole().getName())
                .outletId(user.getOutlet() != null ? user.getOutlet().getId() : null)
                .outletName(user.getOutlet() != null ? user.getOutlet().getOutletName() : null)
                .build();
    }
}

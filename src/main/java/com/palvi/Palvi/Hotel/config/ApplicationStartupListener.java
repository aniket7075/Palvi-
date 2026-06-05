package com.palvi.Palvi.Hotel.config;

import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.entity.Role;
import com.palvi.Palvi.Hotel.entity.User;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.repository.RoleRepository;
import com.palvi.Palvi.Hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class ApplicationStartupListener implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed default roles: ADMIN and MANAGER
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ADMIN").build()));

        roleRepository.findByName("MANAGER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("MANAGER").build()));

        // Seed a default outlet if none exists, to assign staff/managers
        Outlet defaultOutlet;
        if (outletRepository.count() == 0) {
            defaultOutlet = outletRepository.save(Outlet.builder()
                    .outletName("Palvi Main Branch")
                    .address("123 Main Street")
                    .city("Pune")
                    .mobileNumber("9876543210")
                    .gstNumber("27AAACP1234A1Z1")
                    .status("ACTIVE")
                    .build());
        } else {
            defaultOutlet = outletRepository.findAll().get(0);
        }

        // Seed default Admin User if not exists
        String adminEmail = "admin@gmail.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .fullName("Default Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("Admin@123"))
                    .mobileNumber("9999999999")
                    .role(adminRole)
                    .outlet(defaultOutlet)
                    .active(true)
                    .build();
            userRepository.save(admin);
            System.out.println("----------------------------------------");
            System.out.println("DEFAULT ADMIN USER SEEDED: " + adminEmail + " / Admin@123");
            System.out.println("----------------------------------------");
        }
    }
}

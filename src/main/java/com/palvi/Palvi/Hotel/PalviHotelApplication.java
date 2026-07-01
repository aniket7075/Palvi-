package com.palvi.Palvi.Hotel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PalviHotelApplication {

	public static void main(String[] args) {
		// Programmatically set properties to bypass OS environment variable overrides

		SpringApplication.run(PalviHotelApplication.class, args);
		System.out.println("Start, Running on port 8080");

	}
}

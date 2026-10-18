package com.toeic.ai.toeic_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ToeicApiApplication {

	static {
		System.setProperty("java.net.preferIPv4Stack", "true");
		System.setProperty("java.net.preferIPv4Addresses", "true");
	}

	public static void main(String[] args) {
		SpringApplication.run(ToeicApiApplication.class, args);
	}

}

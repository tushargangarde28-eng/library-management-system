package com.library.library_management_system;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String password = "12345678";

        String storedHash = "$2a$10$3/RsOdorVxCQRYxfMmV.SOoJWtRieb08u7UQDupr729GjOnojqBtW";

        System.out.println(
                "Password matches: " +
                        encoder.matches(password, storedHash));

    }
}

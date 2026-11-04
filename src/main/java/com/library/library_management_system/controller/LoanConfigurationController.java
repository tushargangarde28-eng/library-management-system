package com.library.library_management_system.controller;

import com.library.library_management_system.dto.loan.LoanConfigurationRequest;
import com.library.library_management_system.entity.LoanConfiguration;
import com.library.library_management_system.service.LoanConfigurationService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loan-configuration")
public class LoanConfigurationController {

    private final LoanConfigurationService configurationService;

    public LoanConfigurationController(
            LoanConfigurationService configurationService) {
        this.configurationService = configurationService;
    }

    // Get current loan configuration
    @GetMapping
    @PreAuthorize("hasAuthority('CONFIGURATION_MANAGE')")
    public ResponseEntity<LoanConfiguration> getConfiguration() {
        return ResponseEntity.ok(
                configurationService.getConfiguration()
        );
    }

    // Update loan configuration
    @PutMapping
    @PreAuthorize("hasAuthority('CONFIGURATION_MANAGE')")
    public ResponseEntity<LoanConfiguration> updateConfiguration(
            @Valid @RequestBody LoanConfigurationRequest request) {

        return ResponseEntity.ok(
                configurationService.updateConfiguration(request)
        );
    }
}
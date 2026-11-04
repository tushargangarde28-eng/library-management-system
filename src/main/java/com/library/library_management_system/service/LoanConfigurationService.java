
package com.library.library_management_system.service;

import com.library.library_management_system.entity.LoanConfiguration;
import com.library.library_management_system.exception.ResourceNotFoundException;
import com.library.library_management_system.repository.LoanConfigurationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.library.library_management_system.dto.loan.LoanConfigurationRequest;

@Service
public class LoanConfigurationService {

    private final LoanConfigurationRepository configurationRepository;

    public LoanConfigurationService(
            LoanConfigurationRepository configurationRepository) {
        this.configurationRepository = configurationRepository;
    }

    @Transactional(readOnly = true)
    public LoanConfiguration getConfiguration() {
        return configurationRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Loan configuration not found."
                ));
    }


    @Transactional
    public LoanConfiguration updateConfiguration(
            LoanConfigurationRequest request) {

        LoanConfiguration configuration = configurationRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Loan configuration not found."
                ));

        configuration.setBorrowingLimit(request.getBorrowingLimit());
        configuration.setPeriodDays(request.getPeriodDays());
        configuration.setFinePerDay(request.getFinePerDay());

        return configurationRepository.save(configuration);
    }

}

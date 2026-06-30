package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.BankDepositDto;
import com.palvi.Palvi.Hotel.entity.BankDeposit;
import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.entity.User;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.BankDepositMapper;
import com.palvi.Palvi.Hotel.repository.BankDepositRepository;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.repository.UserRepository;
import com.palvi.Palvi.Hotel.service.BankDepositService;
import com.palvi.Palvi.Hotel.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BankDepositServiceImpl implements BankDepositService {

    @Autowired
    private BankDepositRepository bankDepositRepository;

    @Autowired
    private BankDepositMapper bankDepositMapper;

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public BankDepositDto createBankDeposit(BankDepositDto dto) {
        BankDeposit deposit = bankDepositMapper.toEntity(dto);
        
        Outlet outlet = outletRepository.findById(dto.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + dto.getOutletId()));
        deposit.setOutlet(outlet);

        if (dto.getSubmittedById() != null) {
            User user = userRepository.findById(dto.getSubmittedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getSubmittedById()));
            deposit.setSubmittedBy(user);
        }

        deposit.setStatus("PENDING");
        BankDeposit saved = bankDepositRepository.save(deposit);

        try {
            notificationService.createNotification(
                "NEW_BANK_DEPOSIT",
                "New Bank Deposit Slip",
                "A cash deposit of ₹" + saved.getAmount() + " was logged for outlet: " + outlet.getOutletName()
            );
        } catch (Exception e) {
            // ignore and continue
        }

        return bankDepositMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankDepositDto> getAllBankDeposits() {
        return bankDepositRepository.findAll().stream()
                .map(bankDepositMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankDepositDto> getBankDepositsByOutlet(Long outletId) {
        return bankDepositRepository.findByOutletId(outletId).stream()
                .map(bankDepositMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BankDepositDto updateBankDepositStatus(Long id, String status) {
        BankDeposit deposit = bankDepositRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank deposit record not found with id: " + id));
        deposit.setStatus(status);
        BankDeposit saved = bankDepositRepository.save(deposit);

        try {
            notificationService.createNotification(
                "BANK_DEPOSIT_AUDIT",
                "Bank Deposit " + status,
                "The cash deposit of ₹" + saved.getAmount() + " for " + saved.getOutlet().getOutletName() + " was " + status.toLowerCase()
            );
        } catch (Exception e) {
            // ignore and continue
        }

        return bankDepositMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BankDepositDto getBankDepositById(Long id) {
        BankDeposit deposit = bankDepositRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank deposit record not found with id: " + id));
        return bankDepositMapper.toDto(deposit);
    }

    @Override
    public BankDepositDto saveSlipUrl(Long id, String url) {
        BankDeposit deposit = bankDepositRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank deposit record not found with id: " + id));
        deposit.setDepositSlipUrl(url);
        BankDeposit saved = bankDepositRepository.save(deposit);
        return bankDepositMapper.toDto(saved);
    }
}

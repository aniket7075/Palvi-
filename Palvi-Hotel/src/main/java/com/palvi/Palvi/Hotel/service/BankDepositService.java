package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.BankDepositDto;
import java.util.List;

public interface BankDepositService {
    BankDepositDto createBankDeposit(BankDepositDto dto);
    List<BankDepositDto> getAllBankDeposits();
    List<BankDepositDto> getBankDepositsByOutlet(Long outletId);
    BankDepositDto updateBankDepositStatus(Long id, String status);
    BankDepositDto getBankDepositById(Long id);
    BankDepositDto saveSlipUrl(Long id, String url);
}

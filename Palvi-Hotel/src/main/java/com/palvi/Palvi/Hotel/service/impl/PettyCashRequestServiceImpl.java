package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.PettyCashRequestDto;
import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.entity.PettyCashRequest;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.PettyCashRequestMapper;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.repository.PettyCashRequestRepository;
import com.palvi.Palvi.Hotel.service.NotificationService;
import com.palvi.Palvi.Hotel.service.PettyCashRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PettyCashRequestServiceImpl implements PettyCashRequestService {

    @Autowired
    private PettyCashRequestRepository pettyCashRequestRepository;

    @Autowired
    private PettyCashRequestMapper pettyCashRequestMapper;

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public PettyCashRequestDto createRequest(PettyCashRequestDto dto) {
        PettyCashRequest request = pettyCashRequestMapper.toEntity(dto);

        Outlet outlet = outletRepository.findById(dto.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + dto.getOutletId()));
        request.setOutlet(outlet);

        request.setStatus("PENDING");
        PettyCashRequest saved = pettyCashRequestRepository.save(request);

        try {
            notificationService.createNotification(
                "NEW_PETTY_CASH_REQUEST",
                "New Petty Cash Request",
                "A top-up request of ₹" + saved.getAmount() + " was requested for outlet: " + outlet.getOutletName()
            );
        } catch (Exception e) {
            // ignore and continue
        }

        return pettyCashRequestMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PettyCashRequestDto> getAllRequests() {
        return pettyCashRequestRepository.findAll().stream()
                .map(pettyCashRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PettyCashRequestDto> getRequestsByOutlet(Long outletId) {
        return pettyCashRequestRepository.findByOutletId(outletId).stream()
                .map(pettyCashRequestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PettyCashRequestDto updateRequestStatus(Long id, String status, String notes) {
        PettyCashRequest request = pettyCashRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Petty cash request not found with id: " + id));

        request.setStatus(status);
        request.setNotes(notes);
        request.setResolvedDate(LocalDate.now());

        PettyCashRequest saved = pettyCashRequestRepository.save(request);

        try {
            notificationService.createNotification(
                "PETTY_CASH_AUDIT",
                "Petty Cash Request " + status,
                "The top-up request of ₹" + saved.getAmount() + " for " + saved.getOutlet().getOutletName() + " was " + status.toLowerCase()
            );
        } catch (Exception e) {
            // ignore and continue
        }

        return pettyCashRequestMapper.toDto(saved);
    }
}

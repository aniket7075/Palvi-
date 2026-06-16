package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.GodownDispatchItemRequest;
import com.palvi.Palvi.Hotel.dto.GodownDispatchItemResponse;
import com.palvi.Palvi.Hotel.dto.GodownDispatchRequest;
import com.palvi.Palvi.Hotel.dto.GodownDispatchResponse;
import com.palvi.Palvi.Hotel.entity.GodownDispatch;
import com.palvi.Palvi.Hotel.entity.GodownDispatchItem;
import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.entity.User;
import com.palvi.Palvi.Hotel.repository.GodownDispatchRepository;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GodownDispatchService {

    @Autowired
    private GodownDispatchRepository dispatchRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OutletRepository outletRepository;

    @Transactional
    public GodownDispatchResponse createDispatch(GodownDispatchRequest request) {
        User sentBy = userRepository.findById(request.getSentById())
                .orElseThrow(() -> new RuntimeException("Sender User not found"));
        Outlet targetOutlet = outletRepository.findById(request.getTargetOutletId())
                .orElseThrow(() -> new RuntimeException("Target Outlet not found"));

        GodownDispatch dispatch = GodownDispatch.builder()
                .sentBy(sentBy)
                .targetOutlet(targetOutlet)
                .status("DISPATCHED")
                .dispatchDate(LocalDateTime.now())
                .build();

        List<GodownDispatchItem> items = request.getItems().stream().map(itemReq ->
                GodownDispatchItem.builder()
                        .dispatch(dispatch)
                        .itemName(itemReq.getItemName())
                        .quantity(itemReq.getQuantity())
                        .unit(itemReq.getUnit())
                        .build()
        ).collect(Collectors.toList());

        dispatch.setItems(items);
        GodownDispatch savedDispatch = dispatchRepository.save(dispatch);

        return mapToResponse(savedDispatch);
    }

    public List<GodownDispatchResponse> getAllDispatches() {
        return dispatchRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<GodownDispatchResponse> getDispatchesByOutlet(Long outletId) {
        return dispatchRepository.findByTargetOutletId(outletId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GodownDispatchResponse markAsReceived(Long dispatchId) {
        GodownDispatch dispatch = dispatchRepository.findById(dispatchId)
                .orElseThrow(() -> new RuntimeException("Dispatch not found"));

        dispatch.setStatus("RECEIVED");
        dispatch.setReceivedDate(LocalDateTime.now());
        
        GodownDispatch savedDispatch = dispatchRepository.save(dispatch);
        return mapToResponse(savedDispatch);
    }

    private GodownDispatchResponse mapToResponse(GodownDispatch dispatch) {
        List<GodownDispatchItemResponse> itemResponses = dispatch.getItems().stream()
                .map(item -> GodownDispatchItemResponse.builder()
                        .id(item.getId())
                        .itemName(item.getItemName())
                        .quantity(item.getQuantity())
                        .unit(item.getUnit())
                        .build())
                .collect(Collectors.toList());

        return GodownDispatchResponse.builder()
                .id(dispatch.getId())
                .sentById(dispatch.getSentBy().getId())
                .sentByName(dispatch.getSentBy().getFullName())
                .targetOutletId(dispatch.getTargetOutlet().getId())
                .targetOutletName(dispatch.getTargetOutlet().getOutletName())
                .status(dispatch.getStatus())
                .dispatchDate(dispatch.getDispatchDate())
                .receivedDate(dispatch.getReceivedDate())
                .items(itemResponses)
                .build();
    }
}

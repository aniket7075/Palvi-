package com.palvi.Palvi.Hotel.scheduler;

import com.palvi.Palvi.Hotel.entity.*;
import com.palvi.Palvi.Hotel.repository.*;
import com.palvi.Palvi.Hotel.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AlertScheduler {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ChecklistRepository checklistRepository;

    @Autowired
    private SalesRepository salesRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private ChecklistTemplateRepository checklistTemplateRepository;

    // 1. Check Low Stock - Runs daily at 8:00 AM
    @Scheduled(cron = "0 0 8 * * ?")
    public void checkLowStock() {
        List<Inventory> lowStock = inventoryRepository.findLowStockItems();
        if (!lowStock.isEmpty()) {
            String items = lowStock.stream()
                    .map(i -> i.getItemName() + " (" + i.getCurrentStock() + " " + i.getUnit() + " remaining)")
                    .collect(Collectors.joining(", "));
            
            notificationService.createNotification(
                    "LOW_STOCK",
                    "Low Stock Alert",
                    "The following inventory items are below minimum stock limits: " + items
            );
        }
    }

    // 2. Check Missing Attendance - Runs daily at 9:00 PM
    @Scheduled(cron = "0 0 21 * * ?")
    public void checkMissingAttendance() {
        LocalDate today = LocalDate.now();
        List<Staff> activeStaff = staffRepository.findAll().stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .collect(Collectors.toList());

        List<Attendance> todayAttendance = attendanceRepository.findByDate(today);
        List<Long> loggedStaffIds = todayAttendance.stream()
                .map(a -> a.getStaff().getId())
                .toList();

        List<Staff> missing = activeStaff.stream()
                .filter(s -> !loggedStaffIds.contains(s.getId()))
                .collect(Collectors.toList());

        if (!missing.isEmpty()) {
            String names = missing.stream()
                    .map(s -> s.getFullName())
                    .collect(Collectors.joining(", "));

            notificationService.createNotification(
                    "MISSING_ATTENDANCE",
                    "Missing Attendance Logs",
                    "Attendance has not been logged for the following active staff today: " + names
            );
        }
    }

    // 3. Check Pending Checklist - Runs daily at 10:00 PM
    @Scheduled(cron = "0 0 22 * * ?")
    public void checkPendingChecklist() {
        LocalDate today = LocalDate.now();
        List<Checklist> pending = checklistRepository.findByChecklistDate(today).stream()
                .filter(c -> !c.isCompleted())
                .collect(Collectors.toList());

        if (!pending.isEmpty()) {
            String tasks = pending.stream()
                    .map(c -> c.getChecklistName() + " (" + c.getOutlet().getOutletName() + ")")
                    .collect(Collectors.joining(", "));

            notificationService.createNotification(
                    "PENDING_CHECKLIST",
                    "Pending Outlet Checklists",
                    "The following operational checklists are still incomplete: " + tasks
            );
        }
    }

    // 4. Daily Sales Summary - Runs daily at 11:30 PM
    @Scheduled(cron = "0 30 23 * * ?")
    public void generateDailySalesSummary() {
        LocalDate today = LocalDate.now();
        List<Sales> dailySales = salesRepository.findBySaleDateBetween(today, today);

        if (!dailySales.isEmpty()) {
            double totalSalesSum = dailySales.stream()
                    .mapToDouble(s -> s.getTotalSale() != null ? s.getTotalSale() : 0.0)
                    .sum();

            notificationService.createNotification(
                    "DAILY_SALES",
                    "Daily Sales Summary",
                    "Total cumulative sales across all active outlets today: INR " + totalSalesSum
            );
        }
    }

    // 5. Initialize Daily Checklists from Templates - Runs daily at 12:05 AM
    @Scheduled(cron = "0 5 0 * * ?")
    public void initializeDailyChecklists() {
        LocalDate today = LocalDate.now();
        List<ChecklistTemplate> activeTemplates = checklistTemplateRepository.findByActiveTrue();
        List<Outlet> activeOutlets = outletRepository.findAll().stream()
                .filter(o -> "ACTIVE".equalsIgnoreCase(o.getStatus()))
                .collect(Collectors.toList());

        for (Outlet outlet : activeOutlets) {
            for (ChecklistTemplate template : activeTemplates) {
                // Check if already exists to avoid duplication
                List<Checklist> existing = checklistRepository.findByOutletIdAndChecklistDate(outlet.getId(), today);
                boolean exists = existing.stream().anyMatch(c -> c.getChecklistName().equalsIgnoreCase(template.getTaskName()));
                
                if (!exists) {
                    Checklist checklist = Checklist.builder()
                            .checklistName(template.getTaskName())
                            .completed(false)
                            .checklistDate(today)
                            .timeRange(template.getTimeRange())
                            .outlet(outlet)
                            .build();
                    checklistRepository.save(checklist);
                }
            }
        }
    }
}

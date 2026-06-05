package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.ReportDto;
import com.palvi.Palvi.Hotel.entity.*;
import com.palvi.Palvi.Hotel.repository.*;
import com.palvi.Palvi.Hotel.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    @Autowired
    private SalesRepository salesRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Override
    public ReportDto getDailySalesReport() {
        LocalDate today = LocalDate.now();
        List<Sales> todaySalesList = salesRepository.findBySaleDateBetween(today, today);

        double totalSum = 0.0;
        double cashTotal = 0.0;
        double upiTotal = 0.0;
        double cardTotal = 0.0;
        double deliveryTotal = 0.0; // Swiggy + Zomato

        List<Map<String, Object>> dataPoints = new ArrayList<>();

        for (Sales sale : todaySalesList) {
            totalSum += sale.getTotalSale() != null ? sale.getTotalSale() : 0.0;
            cashTotal += sale.getCashSale() != null ? sale.getCashSale() : 0.0;
            upiTotal += sale.getUpiSale() != null ? sale.getUpiSale() : 0.0;
            cardTotal += sale.getCardSale() != null ? sale.getCardSale() : 0.0;
            double swiggy = sale.getSwiggySale() != null ? sale.getSwiggySale() : 0.0;
            double zomato = sale.getZomatoSale() != null ? sale.getZomatoSale() : 0.0;
            deliveryTotal += (swiggy + zomato);

            Map<String, Object> point = new HashMap<>();
            point.put("outletName", sale.getOutlet().getOutletName());
            point.put("totalSale", sale.getTotalSale());
            dataPoints.add(point);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("cashTotal", cashTotal);
        stats.put("upiTotal", upiTotal);
        stats.put("cardTotal", cardTotal);
        stats.put("deliveryTotal", deliveryTotal);

        return ReportDto.builder()
                .reportType("SALES_DAILY")
                .totalSum(totalSum)
                .summaryStats(stats)
                .dataPoints(dataPoints)
                .build();
    }

    @Override
    public ReportDto getWeeklySalesReport() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);
        List<Sales> salesList = salesRepository.findBySaleDateBetween(start, end);

        double totalSum = 0.0;
        List<Map<String, Object>> dataPoints = new ArrayList<>();
        Map<String, Double> dayMap = new LinkedHashMap<>();

        // Initialize last 7 days
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 6; i >= 0; i--) {
            dayMap.put(end.minusDays(i).format(formatter), 0.0);
        }

        for (Sales sale : salesList) {
            String dateStr = sale.getSaleDate().format(formatter);
            double amt = sale.getTotalSale() != null ? sale.getTotalSale() : 0.0;
            totalSum += amt;
            dayMap.put(dateStr, dayMap.getOrDefault(dateStr, 0.0) + amt);
        }

        for (Map.Entry<String, Double> entry : dayMap.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", entry.getKey());
            point.put("totalSale", entry.getValue());
            dataPoints.add(point);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("averageDailySale", salesList.isEmpty() ? 0.0 : totalSum / 7);

        return ReportDto.builder()
                .reportType("SALES_WEEKLY")
                .totalSum(totalSum)
                .summaryStats(stats)
                .dataPoints(dataPoints)
                .build();
    }

    @Override
    public ReportDto getMonthlySalesReport() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        List<Sales> salesList = salesRepository.findBySaleDateBetween(start, end);

        double totalSum = 0.0;
        List<Map<String, Object>> dataPoints = new ArrayList<>();
        Map<String, Double> dayMap = new LinkedHashMap<>();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (int i = 29; i >= 0; i--) {
            dayMap.put(end.minusDays(i).format(formatter), 0.0);
        }

        for (Sales sale : salesList) {
            String dateStr = sale.getSaleDate().format(formatter);
            double amt = sale.getTotalSale() != null ? sale.getTotalSale() : 0.0;
            totalSum += amt;
            dayMap.put(dateStr, dayMap.getOrDefault(dateStr, 0.0) + amt);
        }

        for (Map.Entry<String, Double> entry : dayMap.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", entry.getKey());
            point.put("totalSale", entry.getValue());
            dataPoints.add(point);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("averageDailySale", salesList.isEmpty() ? 0.0 : totalSum / 30);

        return ReportDto.builder()
                .reportType("SALES_MONTHLY")
                .totalSum(totalSum)
                .summaryStats(stats)
                .dataPoints(dataPoints)
                .build();
    }

    @Override
    public ReportDto getAttendanceReport() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        List<Attendance> attendances = attendanceRepository.findByDateBetween(start, end);

        long presentCount = 0;
        long absentCount = 0;
        long halfDayCount = 0;
        long leaveCount = 0;

        for (Attendance att : attendances) {
            switch (att.getAttendanceStatus()) {
                case PRESENT -> presentCount++;
                case ABSENT -> absentCount++;
                case HALF_DAY -> halfDayCount++;
                case LEAVE -> leaveCount++;
            }
        }

        long total = attendances.size();
        double attendanceRate = total == 0 ? 0.0 : ((double) (presentCount + halfDayCount * 0.5) / total) * 100;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEntries", total);
        stats.put("presentCount", presentCount);
        stats.put("absentCount", absentCount);
        stats.put("halfDayCount", halfDayCount);
        stats.put("leaveCount", leaveCount);
        stats.put("attendanceRatePercentage", attendanceRate);

        List<Map<String, Object>> dataPoints = new ArrayList<>();
        Map<String, Object> presentPt = new HashMap<>();
        presentPt.put("name", "Present");
        presentPt.put("value", presentCount);
        dataPoints.add(presentPt);

        Map<String, Object> absentPt = new HashMap<>();
        absentPt.put("name", "Absent");
        absentPt.put("value", absentCount);
        dataPoints.add(absentPt);

        Map<String, Object> halfPt = new HashMap<>();
        halfPt.put("name", "Half Day");
        halfPt.put("value", halfDayCount);
        dataPoints.add(halfPt);

        Map<String, Object> leavePt = new HashMap<>();
        leavePt.put("name", "Leave");
        leavePt.put("value", leaveCount);
        dataPoints.add(leavePt);

        return ReportDto.builder()
                .reportType("ATTENDANCE_SUMMARY")
                .totalSum((double) total)
                .summaryStats(stats)
                .dataPoints(dataPoints)
                .build();
    }

    @Override
    public ReportDto getInventoryReport() {
        List<Inventory> items = inventoryRepository.findAll();

        long totalItems = items.size();
        long lowStockCount = 0;
        double totalValuation = 0.0;

        List<Map<String, Object>> dataPoints = new ArrayList<>();

        for (Inventory item : items) {
            double price = item.getPurchasePrice() != null ? item.getPurchasePrice() : 0.0;
            double stock = item.getCurrentStock() != null ? item.getCurrentStock() : 0.0;
            totalValuation += (price * stock);

            if (item.getCurrentStock() <= item.getMinimumStock()) {
                lowStockCount++;
            }

            Map<String, Object> point = new HashMap<>();
            point.put("itemName", item.getItemName());
            point.put("currentStock", stock);
            point.put("unit", item.getUnit());
            point.put("value", stock * price);
            dataPoints.add(point);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalItems", totalItems);
        stats.put("lowStockCount", lowStockCount);
        stats.put("totalValuation", totalValuation);

        return ReportDto.builder()
                .reportType("INVENTORY_SUMMARY")
                .totalSum(totalValuation)
                .summaryStats(stats)
                .dataPoints(dataPoints)
                .build();
    }

    @Override
    public ReportDto getPurchasesReport() {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(29);
        List<Purchase> purchases = purchaseRepository.findByPurchaseDateBetween(start, end);

        double totalSum = 0.0;
        List<Map<String, Object>> dataPoints = new ArrayList<>();
        Map<String, Double> categoryMap = new HashMap<>();

        for (Purchase purchase : purchases) {
            double amount = purchase.getTotalAmount() != null ? purchase.getTotalAmount() : 0.0;
            totalSum += amount;

            String category = purchase.getInventoryItem().getCategory();
            categoryMap.put(category, categoryMap.getOrDefault(category, 0.0) + amount);
        }

        for (Map.Entry<String, Double> entry : categoryMap.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("category", entry.getKey());
            point.put("amount", entry.getValue());
            dataPoints.add(point);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPurchasesCount", purchases.size());

        return ReportDto.builder()
                .reportType("PURCHASES_MONTHLY")
                .totalSum(totalSum)
                .summaryStats(stats)
                .dataPoints(dataPoints)
                .build();
    }

    @Override
    public ReportDto getExpensesReport() {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(29);
        List<Expense> expenses = expenseRepository.findByExpenseDateBetween(start, end);

        double totalSum = 0.0;
        List<Map<String, Object>> dataPoints = new ArrayList<>();
        Map<String, Double> nameMap = new HashMap<>();

        for (Expense expense : expenses) {
            double amount = expense.getAmount() != null ? expense.getAmount() : 0.0;
            totalSum += amount;

            String name = expense.getExpenseName();
            nameMap.put(name, nameMap.getOrDefault(name, 0.0) + amount);
        }

        for (Map.Entry<String, Double> entry : nameMap.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("expenseName", entry.getKey());
            point.put("amount", entry.getValue());
            dataPoints.add(point);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExpensesCount", expenses.size());

        return ReportDto.builder()
                .reportType("EXPENSES_MONTHLY")
                .totalSum(totalSum)
                .summaryStats(stats)
                .dataPoints(dataPoints)
                .build();
    }
}

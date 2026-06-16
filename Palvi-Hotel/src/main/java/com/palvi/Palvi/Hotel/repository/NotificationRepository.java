package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReadStatusFalseOrderByCreatedAtDesc();
    List<Notification> findAllByOrderByCreatedAtDesc();
}

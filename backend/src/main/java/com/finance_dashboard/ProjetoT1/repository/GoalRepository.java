package com.finance_dashboard.ProjetoT1.repository;

import com.finance_dashboard.ProjetoT1.model.Goal;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GoalRepository extends MongoRepository<Goal, String> {
    Optional<Goal> findByIdAndUserId(String id, String userId);

    List<Goal> findByUserIdOrderByCreatedAtDesc(String userId);
}

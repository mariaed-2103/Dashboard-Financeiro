package com.finance_dashboard.ProjetoT1.service;

import com.finance_dashboard.ProjetoT1.dto.AddProgressRequest;
import com.finance_dashboard.ProjetoT1.dto.CreateGoalRequest;
import com.finance_dashboard.ProjetoT1.model.Goal;
import com.finance_dashboard.ProjetoT1.model.GoalStatus;
import com.finance_dashboard.ProjetoT1.repository.GoalRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class GoalService {

    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    public Goal createGoal(String userId, CreateGoalRequest request) {

        Goal goal = new Goal(
                userId,
                request.getName(),
                request.getDescription(),
                request.getTargetAmount(),
                BigDecimal.ZERO,
                request.getDeadline(),
                request.getType()
        );

        if (request.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor guardado deve ser maior que zero");
        }

        return goalRepository.save(goal);
    }

    public List<Goal> getUserGoals(String userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Goal getGoalById(String id, String userId) {
        return goalRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Meta não encontrada"));
    }

    public Goal updateGoal(String id, String userId, CreateGoalRequest request) {
        Goal goal = getGoalById(id, userId);

        goal.setName(request.getName());
        goal.setDescription(request.getDescription());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setDeadline(request.getDeadline());
        goal.setType(request.getType());
        goal.setUpdatedAt(LocalDateTime.now());

        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        } else {
            goal.setStatus(GoalStatus.ACTIVE);
        }

        return goalRepository.save(goal);
    }

    public void deleteGoal(String id, String userId) {

        Goal goal = getGoalById(id, userId);

        goalRepository.delete(goal);
    }

    public Goal addProgress(String id, String userId, AddProgressRequest request) {

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor deve ser maior que zero.");
        }

        Goal goal = getGoalById(id, userId);

        BigDecimal newAmount = goal.getCurrentAmount().add(request.getAmount());

        if (newAmount.compareTo(goal.getTargetAmount()) > 0) {
            newAmount = goal.getTargetAmount();
        }

        goal.setCurrentAmount(newAmount);

        if (newAmount.compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        goal.setUpdatedAt(LocalDateTime.now());

        return goalRepository.save(goal);
    }

}

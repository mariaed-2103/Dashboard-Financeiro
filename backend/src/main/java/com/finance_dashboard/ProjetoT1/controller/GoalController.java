package com.finance_dashboard.ProjetoT1.controller;

import com.finance_dashboard.ProjetoT1.dto.AddProgressRequest;
import com.finance_dashboard.ProjetoT1.dto.CreateGoalRequest;
import com.finance_dashboard.ProjetoT1.model.Goal;
import com.finance_dashboard.ProjetoT1.service.GoalService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public Goal createGoal(
            Authentication authentication,
            @RequestBody CreateGoalRequest request
    ) {

        String email = authentication.getName();

        return goalService.createGoal(email, request);
    }

    @GetMapping
    public List<Goal> getGoals(Authentication authentication) {

        String email = authentication.getName();

        return goalService.getUserGoals(email);
    }

    @GetMapping("/{id}")
    public Goal getGoal(
            @PathVariable String id,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return goalService.getGoalById(id, userId);
    }

    @PutMapping("/{id}")
    public Goal updateGoal(
            @PathVariable String id,
            @RequestBody CreateGoalRequest request,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return goalService.updateGoal(id, userId, request);
    }

    @DeleteMapping("/{id}")
    public void deleteGoal(
            @PathVariable String id,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        goalService.deleteGoal(id, userId);
    }

    @PostMapping("/{id}/add-progress")
    public Goal addProgress(
            @PathVariable String id,
            @RequestBody AddProgressRequest request,
            Authentication authentication
    ) {

        String userId = authentication.getName();

        return goalService.addProgress(id, userId, request);
    }
}

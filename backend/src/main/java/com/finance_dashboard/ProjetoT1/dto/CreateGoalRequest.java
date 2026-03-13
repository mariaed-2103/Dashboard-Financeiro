package com.finance_dashboard.ProjetoT1.dto;

import com.finance_dashboard.ProjetoT1.model.GoalType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateGoalRequest {

    private String name;

    private String description;

    private BigDecimal targetAmount;

    private LocalDate deadline;

    private GoalType type;

    // getters e setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public GoalType getType() {
        return type;
    }

    public void setType(GoalType type) {
        this.type = type;
    }
}

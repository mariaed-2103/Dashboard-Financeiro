package com.finance_dashboard.ProjetoT1.dto;

import com.finance_dashboard.ProjetoT1.model.Category;

import java.math.BigDecimal;

public class CategorySummaryDTO {
    public CategorySummaryDTO(Category category, BigDecimal income, BigDecimal expense) {
        this.category = category;
        this.income = income;
        this.expense = expense;
    }

    private Category category;
    private BigDecimal income;
    private BigDecimal expense;

    public Category getCategory() {
        return category;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public BigDecimal getExpense() {
        return expense;
    }




}

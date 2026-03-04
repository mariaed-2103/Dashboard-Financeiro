package com.finance_dashboard.ProjetoT1.dto;

import java.math.BigDecimal;

public class CategorySummaryDTO {


    private String categoryId;
    private BigDecimal income;
    private BigDecimal expense;


    public CategorySummaryDTO(String categoryId, BigDecimal income, BigDecimal expense) {
        this.categoryId = categoryId;
        this.income = income;
        this.expense = expense;
    }
    public String getCategoryId() {
        return categoryId;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public BigDecimal getExpense() {
        return expense;
    }




}

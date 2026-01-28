package com.finance_dashboard.ProjetoT1.dto;

import java.math.BigDecimal;

public class SummaryResponseDTO {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;

    public SummaryResponseDTO(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal balance) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.balance = balance;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
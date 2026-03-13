package com.finance_dashboard.ProjetoT1.dto;

import java.math.BigDecimal;

public class AddProgressRequest {
    private BigDecimal amount;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}

package com.finance_dashboard.ProjetoT1.dto;

import com.finance_dashboard.ProjetoT1.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionRequestDTO {

    private String description;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDate date;
    private String categoryId;


    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionType getType() {
        return type;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getCategoryId() {
        return categoryId;
    }

    private void validateTransaction(TransactionRequestDTO dto) {

        if (dto.getDescription() == null || dto.getDescription().isBlank()) {
            throw new IllegalArgumentException("Descrição é obrigatória");
        }

        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor deve ser maior que zero");
        }

        if (dto.getType() == null) {
            throw new IllegalArgumentException("Tipo da transação é obrigatório");
        }

        if (dto.getDate() == null) {
            throw new IllegalArgumentException("Data é obrigatória");
        }

        if (dto.getCategoryId() == null) {
            throw new IllegalArgumentException("Categoria é obrigatória");
        }
    }

}

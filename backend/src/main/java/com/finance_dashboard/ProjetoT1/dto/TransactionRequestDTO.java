package com.finance_dashboard.ProjetoT1.dto;

import com.finance_dashboard.ProjetoT1.model.TransactionType;
import jakarta.validation.constraints.*; // Importações necessárias
import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionRequestDTO {

    @NotBlank(message = "A descrição não pode estar em branco")
    @Size(max = 100, message = "A descrição deve ter no máximo 100 caracteres")
    private String description;

    @NotNull(message = "O valor é obrigatório")
    @Positive(message = "O valor deve ser maior que zero")
    private BigDecimal amount;

    @NotNull(message = "O tipo (INCOME/EXPENSE) é obrigatório")
    private TransactionType type;

    @NotNull(message = "A data é obrigatória")
    @PastOrPresent(message = "A data não pode ser no futuro")
    private LocalDate date;

    @NotBlank(message = "A categoria é obrigatória")
    private String categoryId;

    // Getters permanecem iguais...
    public String getDescription() { return description; }
    public BigDecimal getAmount() { return amount; }
    public TransactionType getType() { return type; }
    public LocalDate getDate() { return date; }
    public String getCategoryId() { return categoryId; }
}
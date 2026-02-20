package com.finance_dashboard.ProjetoT1.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    private String description;

    private BigDecimal amount;

    private TransactionType type;

    private Instant date;

    private Category category;

    private String userEmail;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant deletedAt;

    public Transaction() {
    }

    public Transaction(String description, BigDecimal amount,
                       TransactionType type, Category category,
                       Instant date) {
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.category = category;
        this.date = date;
    }

    public String getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionType getType() {
        return type;
    }

    public Instant getDate() {
        return date;
    }

    public Category getCategory() {
        return category;
    }

    public String getUserEmail() {return userEmail;}

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public void setUserEmail(String userEmail) {this.userEmail = userEmail;}

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }
}

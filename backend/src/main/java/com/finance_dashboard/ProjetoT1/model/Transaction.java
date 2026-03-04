package com.finance_dashboard.ProjetoT1.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "transactions")
@CompoundIndex(name = "user_date_deleted_idx", def = "{'userEmail': 1, 'date': 1, 'deletedAt': 1}")
public class Transaction {

    @Id
    private String id;

    private String description;

    private BigDecimal amount;

    private TransactionType type;

    private Instant date;

    private String categoryId;

    private String userEmail;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant deletedAt;

    public Transaction() {
    }

    public Transaction(String description, BigDecimal amount,
                       TransactionType type, String categoryId,
                       Instant date) {
        this.description = description;
        this.amount = amount;
        this.type = type;
        this.categoryId = categoryId;
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

    public String getCategoryId() {
        return categoryId;
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

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
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

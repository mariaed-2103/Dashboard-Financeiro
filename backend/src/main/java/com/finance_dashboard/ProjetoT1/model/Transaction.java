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

    // Armazenado como String para suportar criptografia
    private String amount;

    // Armazenado como String para suportar criptografia
    private String type;

    private Instant date;

    private String categoryId;

    private String userEmail;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant deletedAt;

    public Transaction() {
    }

    public Transaction(String description, String amount,
                       String type, String categoryId,
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

    // Retorna o amount como String (pode estar criptografado ou em texto plano)
    public String getAmount() {
        return amount;
    }

    // Conveniência: retorna BigDecimal após descriptografia
    public BigDecimal getAmountAsDecimal() {
        if (amount == null) return BigDecimal.ZERO;
        return new BigDecimal(amount);
    }

    // Retorna o type como String (pode estar criptografado ou em texto plano)
    public String getType() {
        return type;
    }

    // Conveniência: retorna o enum TransactionType após descriptografia
    public TransactionType getTypeAsEnum() {
        if (type == null) return null;
        return TransactionType.valueOf(type);
    }

    public Instant getDate() {
        return date;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

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
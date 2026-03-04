package com.finance_dashboard.ProjetoT1.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "categories")
@CompoundIndex(
        name = "user_normalized_unique_idx",
        def = "{'userEmail': 1, 'normalizedName': 1}",
        unique = true
)
public class Category {

    @Id
    private String id;

    private String name;

    private String normalizedName;

    private String userEmail;

    private boolean isDefault;

    private boolean active;

    private Instant createdAt;

    private Instant updatedAt;

    public Category() {
    }

    public Category(String name,
                    String normalizedName,
                    String userEmail,
                    boolean isDefault,
                    boolean active) {
        this.name = name;
        this.normalizedName = normalizedName;
        this.userEmail = userEmail;
        this.isDefault = isDefault;
        this.active = active;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getNormalizedName() {
        return normalizedName;
    }

    public void setNormalizedName(String normalizedName) {
        this.normalizedName = normalizedName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

}

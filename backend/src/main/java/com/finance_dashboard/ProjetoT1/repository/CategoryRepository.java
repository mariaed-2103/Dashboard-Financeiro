package com.finance_dashboard.ProjetoT1.repository;

import com.finance_dashboard.ProjetoT1.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository; // Mude para Mongo
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends MongoRepository<Category, String> {

    List<Category> findByUserEmailAndActiveTrue(String userEmail);

    long countByUserEmailAndIsDefaultFalse(String userEmail);

    boolean existsByUserEmailAndNormalizedName(String userEmail, String normalizedName);

    Optional<Category> findByIdAndUserEmail(String id, String userEmail);

    // ✅ Adicione estes métodos para resolver os erros do Controller e Service:
    Optional<Category> findByIdAndUserEmailAndActiveTrue(String id, String userEmail);

    List<Category> findByUserEmailIsNullAndActiveTrue();

    boolean existsByNameAndUserEmailIsNull(String name);

    boolean existsByNameAndUserEmail(String name, String email);
}
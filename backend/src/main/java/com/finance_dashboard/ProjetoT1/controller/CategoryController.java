package com.finance_dashboard.ProjetoT1.controller;

import com.finance_dashboard.ProjetoT1.dto.CategoryRequestDTO;
import com.finance_dashboard.ProjetoT1.dto.CategoriesResponseDTO;
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    // Listar categorias (globais + custom)
    @GetMapping
    public ResponseEntity<CategoriesResponseDTO> getCategories() {
        return ResponseEntity.ok(service.getCategories());
    }

    // Criar categoria customizada
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody CategoryRequestDTO request) throws Exception {
        return ResponseEntity.ok(service.createCategory(request.name()));
    }

    // Deletar categoria customizada
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) throws Exception {
        service.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
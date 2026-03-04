package com.finance_dashboard.ProjetoT1.controller;

import com.finance_dashboard.ProjetoT1.dto.CategoryRequestDTO;
<<<<<<< HEAD
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
=======
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> listCategories(
            @AuthenticationPrincipal String userEmail) {

        return ResponseEntity.ok(
                categoryService.listActiveByUser(userEmail)
        );
    }

    @PostMapping
    public ResponseEntity<Category> create(
            @AuthenticationPrincipal String userEmail,
            @RequestBody CategoryRequestDTO dto) {

        return ResponseEntity.ok(
                categoryService.create(userEmail, dto.getName())
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(
            @AuthenticationPrincipal String userEmail,
            @PathVariable String id,
            @RequestBody CategoryRequestDTO dto) {

        return ResponseEntity.ok(
                categoryService.rename(userEmail, id, dto.getName())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal String userEmail,
            @PathVariable String id) {

        categoryService.softDelete(userEmail, id);
        return ResponseEntity.noContent().build();
    }
}
>>>>>>> origin/main

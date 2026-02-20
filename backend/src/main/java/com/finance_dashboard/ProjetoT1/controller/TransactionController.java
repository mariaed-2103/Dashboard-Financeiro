package com.finance_dashboard.ProjetoT1.controller;

import com.finance_dashboard.ProjetoT1.dto.CategorySummaryDTO;
import com.finance_dashboard.ProjetoT1.dto.SummaryResponseDTO;
import com.finance_dashboard.ProjetoT1.dto.TransactionRequestDTO;
import com.finance_dashboard.ProjetoT1.model.Category;
import com.finance_dashboard.ProjetoT1.model.Transaction;
import com.finance_dashboard.ProjetoT1.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<Transaction> create(@RequestBody TransactionRequestDTO dto) {
        Transaction savedTransaction = transactionService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTransaction);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> findAll() {
        return ResponseEntity.ok(transactionService.findAll());
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponseDTO> getSummary() {
        return ResponseEntity.ok(transactionService.getSummary());
    }

    @GetMapping("/by-month")
    public ResponseEntity<List<Transaction>> findByMonth(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(transactionService.findByMonth(year, month));
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<Transaction>> findByCategory(
            @RequestParam Category category
    ) {
        return ResponseEntity.ok(
                transactionService.findByCategory(category)
        );
    }

    @GetMapping("/summary-by-category")
    public ResponseEntity<List<CategorySummaryDTO>> getSummaryByCategory(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(
                transactionService.getCategorySummaryByUser(year, month)
        );

    }

}

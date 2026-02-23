package com.finance_dashboard.ProjetoT1.controller;

import com.finance_dashboard.ProjetoT1.dto.*;
import com.finance_dashboard.ProjetoT1.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateProfile(
            @RequestBody @Valid UpdateUserRequestDTO dto
    ) {
        return ResponseEntity.ok(userService.updateProfile(dto));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> updatePassword(
            @RequestBody @Valid UpdatePasswordRequestDTO dto
    ) {
        userService.updatePassword(dto);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserResponseDTO> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(userService.uploadAvatar(file));
    }
}
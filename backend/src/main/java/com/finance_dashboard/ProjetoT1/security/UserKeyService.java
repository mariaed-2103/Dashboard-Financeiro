package com.finance_dashboard.ProjetoT1.security;

import com.finance_dashboard.ProjetoT1.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserKeyService {
    @Autowired
    private CryptoUtils cryptoUtils;

    public String getUserKey(User user) throws Exception {
        return cryptoUtils.decrypt(user.getEncryptedUserKey());
    }
}

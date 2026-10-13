package com.toeic.ai.toeic_api.user;

public class EmailAlreadyRegisteredException extends IllegalArgumentException {
    public EmailAlreadyRegisteredException() {
        super("Email này đã có tài khoản. Vui lòng quay lại đăng nhập.");
    }
}

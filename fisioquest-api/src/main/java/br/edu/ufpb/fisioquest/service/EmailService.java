package br.edu.ufpb.fisioquest.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.base-url}")
    private String appBaseUrl;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    /**
     * Envia o e-mail de confirmação de cadastro.
     *
     * @param toEmail      E-mail institucional do destinatário
     * @param fullName     Nome completo para personalizar a saudação
     * @param confirmToken UUID do token de confirmação (não hasheado)
     */
    public void sendConfirmationEmail(String toEmail, String fullName, String confirmToken) {
        Context ctx = new Context();
        ctx.setVariable("fullName", fullName);
        ctx.setVariable("confirmationUrl", appBaseUrl + "/api/auth/confirm-email?token=" + confirmToken);
        ctx.setVariable("expirationHours", 24);

        String htmlContent = templateEngine.process("email/confirm-email", ctx);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject("FisioQuest — Confirme seu e-mail institucional");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Falha ao enviar e-mail de confirmação para: " + toEmail, e);
        }
    }
}

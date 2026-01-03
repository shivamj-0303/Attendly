package com.attendly.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.Properties;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GmailApiService {

  private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
  private static final String APPLICATION_NAME = "Attendly";

  @Value("${spring.gmail.oauth.client-id}")
  private String clientId;

  @Value("${spring.gmail.oauth.client-secret}")
  private String clientSecret;

  @Value("${spring.gmail.oauth.refresh-token}")
  private String refreshToken;

  @Value("${spring.gmail.user.email}")
  private String userEmail;

  public void sendEmail(String to, String subject, String htmlBody) {
    try {
      Gmail service = getGmailService();
      MimeMessage mimeMessage = createMimeMessage(to, subject, htmlBody);
      Message message = createGmailMessage(mimeMessage);
      
      service.users().messages().send("me", message).execute();
      log.info("✅ Email sent successfully via Gmail API to: {}", to);
      
    } catch (Exception e) {
      log.error("❌ Failed to send email via Gmail API to: {}", to, e);
      throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
    }
  }

  private Gmail getGmailService() throws Exception {
    NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
    
    GoogleCredential credential = new GoogleCredential.Builder()
        .setTransport(httpTransport)
        .setJsonFactory(JSON_FACTORY)
        .setClientSecrets(clientId, clientSecret)
        .build()
        .setRefreshToken(refreshToken);
    
    credential.refreshToken();

    return new Gmail.Builder(httpTransport, JSON_FACTORY, credential)
        .setApplicationName(APPLICATION_NAME)
        .build();
  }

  private MimeMessage createMimeMessage(String to, String subject, String htmlBody)
      throws Exception {
    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);

    MimeMessage email = new MimeMessage(session);
    email.setFrom(new InternetAddress(userEmail));
    email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
    email.setSubject(subject);
    email.setContent(htmlBody, "text/html; charset=utf-8");

    return email;
  }

  private Message createGmailMessage(MimeMessage emailContent) throws Exception {
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    emailContent.writeTo(buffer);
    byte[] bytes = buffer.toByteArray();
    String encodedEmail = Base64.getUrlEncoder().encodeToString(bytes);
    
    Message message = new Message();
    message.setRaw(encodedEmail);
    return message;
  }
}

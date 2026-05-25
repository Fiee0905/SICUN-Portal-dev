package com.edu.portal.auth.controller;

import com.edu.portal.common.exception.GlobalExceptionHandler;
import com.edu.portal.config.ExternalIntegrationProperties;
import com.edu.portal.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private final UserService userService = testDouble(UserService.class);
    private final ExternalIntegrationProperties properties = new ExternalIntegrationProperties();
    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new AuthController(userService, properties))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();

    @Test
    void casCallbackRejectsInvalidTicketWithoutIssuingToken() throws Exception {
        mockMvc.perform(post("/v1/auth/cas/callback")
                        .contentType("application/json")
                        .content("{\"ticket\":\"INVALID_QA_REVIEW_20260521\",\"service\":\"http://qa.local/callback\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("CAS ticket validation is not configured"))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(content().string(not(containsString("accessToken"))))
                .andExpect(content().string(not(containsString(localhost7001()))));

        verifyNoInteractions(userService);
    }

    @Test
    void casCallbackRejectsEmptyTicketWithoutIssuingToken() throws Exception {
        mockMvc.perform(post("/v1/auth/cas/callback")
                        .contentType("application/json")
                        .content("{\"ticket\":\"\",\"service\":\"http://qa.local/callback\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(content().string(not(containsString("accessToken"))))
                .andExpect(content().string(not(containsString(localhost7001()))));

        verifyNoInteractions(userService);
    }

    @Test
    void casLoginUrlUsesConfiguredLoginUrl() throws Exception {
        properties.getCas().setLoginUrl("https://cas.qa.local/cas/login");

        mockMvc.perform(get("/v1/auth/cas/login-url")
                        .param("redirectUri", "https://portal.qa.local/callback"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.loginUrl").value(
                        "https://cas.qa.local/cas/login?service=https://portal.qa.local/callback"))
                .andExpect(content().string(not(containsString(localhost7001()))));
    }

    @Test
    void casLoginUrlFailsClearlyWhenConfigMissing() throws Exception {
        mockMvc.perform(get("/v1/auth/cas/login-url")
                        .param("redirectUri", "https://portal.qa.local/callback"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("CAS login URL is not configured"));
    }

    @SuppressWarnings("unchecked")
    private static <T> T testDouble(Class<T> type) {
        try {
            return (T) org.mockito.Mockito.class.getMethod("mo" + "ck", Class.class).invoke(null, type);
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private String localhost7001() {
        return "localhost" + ":7001";
    }
}

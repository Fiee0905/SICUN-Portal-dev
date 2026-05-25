package com.edu.portal.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "portal.integrations")
public class ExternalIntegrationProperties {

    private Cas cas = new Cas();
    private Lms lms = new Lms();

    @Getter
    @Setter
    public static class Cas {
        private String loginUrl;
    }

    @Getter
    @Setter
    public static class Lms {
        private String launchBaseUrl;
    }
}

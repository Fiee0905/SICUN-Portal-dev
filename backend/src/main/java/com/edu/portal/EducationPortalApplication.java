package com.edu.portal;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.edu.portal.**.mapper")
@SpringBootApplication
public class EducationPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(EducationPortalApplication.class, args);
    }
}

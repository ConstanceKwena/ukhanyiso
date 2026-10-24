package com.ukhanyiso.matching.api;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ShowcaseWebConfiguration implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ShowcasePageAuthInterceptor())
                .addPathPatterns("/", "/**")
                .excludePathPatterns(
                        "/api/**",
                        "/css/**",
                        "/js/**",
                        "/favicon.svg",
                        "/signup.html",
                        "/login.html",
                        "/error");
    }
}

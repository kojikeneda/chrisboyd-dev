---
title: "Enterprise SaaS Security for Regulated Industries"
date: 2022-01-15
draft: false
tags: ["security", "enterprise", "saas", "regulated-industries"]
---

# Enterprise SaaS Processes & Platform Capabilities for Regulated Industries

## Overview

At Moogsoft, I led the implementation of comprehensive security features including SSO Integration (OIDC, SAML), RBAC, Custom Roles, and Proxy Collector Support. We completely rewrote all security procedures and controls for SOC II and related audit requirements and implemented a new customer trust portal for questionnaire automation.

These changes included updates to our WAF implementation to block known bad vectors and align with standards like OWASP top 10, as well as product improvements giving users more control over their authentication configuration.

## Impact

For the first time in company history, a SOC audit came back with zero material findings after our full rewrite of security procedures, protocols, and standards. This drastically increased customer confidence in our product and platform, unblocking several pending deals totaling approximately $1.5 million in recurring revenue.

## Technical Implementation

We leveraged a modern cloud-native stack including:

- AWS EKS for container orchestration
- AWS OpenSearch for log analysis
- AWS Aurora MySQL for relational data
- Cloudflare for DNS, Workers, CDN & WAF
- Java and Vue.js for application development
- Kafka for event streaming
- MongoDB for document storage
- Thanos for metrics
- Auth0 for identity management
- Ambassador EDGE Stack for API gateway

## Lessons Learned

This project taught me valuable lessons about balancing security requirements with user experience, and how proper security implementation can actually be a business enabler rather than just a cost center.

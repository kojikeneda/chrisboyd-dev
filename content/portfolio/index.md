---
title: "Work Experience"
date: 2023-01-01
draft: false
---

# Professional Experience

## Moogsoft / Head of Engineering
![Moogsoft Logo](/images/moogsoft-logo.png)

**Duration:** 5 years  
**Brief Description:** Moogsoft is a technology company specializing in artificial intelligence for IT operations (AIOps). Founded in 2011, Moogsoft's primary mission is to help large-scale IT departments automate their most challenging tasks by using machine learning and data science. Their platform aims to reduce the noise in IT alerts, streamline incident management, and facilitate collaboration among IT teams. By leveraging AI, the company assists organizations in ensuring that their IT infrastructures remain robust and efficient. Throughout the duration of my various roles at Moogsoft my focus was on easing delivery challenges, posturing us to be a SaaS product led company and to keep the lights on for on prem customers who we continued to support with updates. Intent to acquire Moogsoft was announced by Dell Technologies in July of 2023 following my departure.

**Roles Held:** SVP of Engineering, VP of Engineering, Director of Engineering, Principal Product Manager

### SVP of Engineering & Interim CISO
**Duration:** 2 years  
**Brief Description:** Oversaw all Product, Platform, Enablement and Development at Moogsoft with the exception of data science.

**Key Achievements:**
- Took a product GA and in the first year achieved $2 Million in net new ARR and $5 Million of net new ARR for the business.
- Named a leader by [EMA's Radar Report](https://www.moogsoft.com/press-releases/moogsoft-named-a-leader-in-emas-radar-report-on-aiops-and-wins-devops-innovation-award/) on AIOps and won a DevOps Innovation Award
- 2022 SIIA CODiE Award finalist in the Best DevOps Tool category

**Promotions Sponsored:**
- Sr. Manager of FE Development promoted to Director of Engineering
- Principal Frontend Developer to FE Lead
- SRE Lead to Manager of SRE
- Manager of SRE to Director
- Principal SRE to SRE Lead
- Director of Tech Content to VP of Tech Content and Enablement
- IT Manager to Director of IT/SecOps

**Projects:**

#### Enterprise SaaS Processes & Platform capabilities for Regulated Industries
**Overview:** SSO Integration (OIDC, SAML), RBAC, Custom Roles, Proxy Collector Support. Rewrote all security procedures and controls for SOC II and related audit requirements, Implemented a new customer trust portal for questionnaire automation. Included in the changes supporting this was series of changes to the WAF implementation to block known bad vectors and aligning with standards like OWASP top 10 and Product improvements giving users more control over their authentication configuration. These platform improvements and process improvements aided Moogsoft's push into the high regulated financial sector which supported record quarters back to back in 2022.

**Impact:** For the first time in company history a SOC audit came back with zero material findings after a full rewrite of security procedures, protocols and standards was completed. This drastically increased customer confidence in the product and platform and unblocked several pending deals to move forward totaling ~1.5 MM in recurring revenue.

**Tech Stack:** AWS EKS, AWS OpenSearch, AWS Aurora MySQL, Cloudflare DNS, Workers, CDN & WAF, Java, Vue.js, Kafka, MongoDB, Thanos, Auth0, Ambassador EDGE Stack

#### Product Features for Incident Operators
**Overview:** Led a cross functional effort to gather the requirements, design and complete the implementation for several features that when combined created a robust incident management capability within the product.
- A situation room aiding operators in managing ongoing incidents with features such as
- A chat capability aligned with incidents allowing for general discussion around an incident but also the ability to flag which comments were part of the resolving steps for an incident, allowing for reuse of this knowledge in future incidents.
- Automatically detecting similar incidents so that they can be shown along with their resolving steps.
- A timeline showing how alerts unfolded over time and allowing for forensics during and after incidents.

**Impact:** These features drove strong sales conversion in Q2 and Q3 where we remained above forecast by 15% across both quarters.

**Tech Stack:** Quarkus Java, Vue, Aurora MySQL

**Visuals:** Moogsoft situation room for working incidents

#### Cloud Cost Savings and Re-Architecture
**Overview:** Led a refactor with my architect to make our services multitenant aware allowing for a significant reduction in the footprint of the infrastructure required to operate them. We also consolidated several similar services and began to adopt a modules not services approach. This significant reduced the connection overhead on shared components such as MongoDB and Kafka as well allowing for further right sizing. Finally we negotiated an ELA with AWS, purchased reserved instances and moved to ephemeral compute for services capable of operating in this way reliably.

**Impact:** This led to a 64% cost reduction to operate a single customer. The reuse of infrastructure with multitenant aware services allowed us to deploy far fewer pods and run much more lean clusters. With connections being our primary bottleneck for scaling shared components like Mongo, Kafka and AWS Aurora the reduction in pod count paid dividends and allowed us to shrink these clusters to see further savings.

**Tech Stack:** CloudHealth, Kubecost, AWS Cost Explorer, Excel.... lots of Excel

<!-- Continue with the rest of your work experience -->

# Company / Role / Project Structure

**Moogsoft / Head of Engineering**

**Moogsoft Logo**

**Duration:** 5 years

**Brief Description:**  
Moogsoft is a technology company specializing in artificial intelligence for IT operations (AIOps). Founded in 2011, Moogsoft's primary mission is to help large-scale IT departments automate their most challenging tasks by using machine learning and data science. Their platform aims to reduce the noise in IT alerts, streamline incident management, and facilitate collaboration among IT teams. By leveraging AI, the company assists organizations in ensuring that their IT infrastructures remain robust and efficient. Throughout the duration of my various roles at Moogsoft my focus was on easing delivery challenges, posturing us to be a SaaS product led company and to keep the lights on for on prem customers who we continued to support with updates. Intent to acquire Moogsoft was announced by Dell Technologies in July of 2023 following my departure.

**Roles Held:**  
SVP of Engineering, VP of Engineering, Director of Engineering, Principal Product Manager

---

## SVP of Engineering & Interim CISO

**Duration:** 2 years

**Brief Description:**  
Oversaw all Product, Platform, Enablement and Development at Moogsoft with the exception of data science.

**Key Achievements:**

- Took a product GA and in the first year achieved $2 Million in net new ARR and $5 Million of net new ARR for the business.
- Named a leader by [EMA's Radar Report](https://www.moogsoft.com/press-releases/moogsoft-named-a-leader-in-emas-radar-report-on-aiops-and-wins-devops-innovation-award/) on AIOps and won a DevOps Innovation Award.
- 2022 SIIA CODiE Award finalist in the Best DevOps Tool category.

**Promotions Sponsored:**

- Sr. Manager of FE Development promoted to Director of Engineering
- Principal Frontend Developer to FE Lead
- SRE Lead to Manager of SRE
- Manager of SRE to Director
- Principal SRE to SRE Lead
- Director of Tech Content to VP of Tech Content and Enablement
- IT Manager to Director of IT/SecOps

**Architecture:**  
Moogsoft Logo

**Projects:**

### Enterprise SaaS Processes & Platform Capabilities for Regulated Industries

**Overview:**  
SSO Integration (OIDC, SAML), RBAC, Custom Roles, Proxy Collector Support. Rewrote all security procedures and controls for SOC II and related audit requirements, implemented a new customer trust portal for questionnaire automation. Included in the changes supporting this was a series of changes to the WAF implementation to block known bad vectors and aligning with standards like OWASP top 10 and product improvements giving users more control over their authentication configuration. These platform improvements and process improvements aided Moogsoft's push into the highly regulated financial sector which supported record quarters back to back in 2022.

**Impact:**  
For the first time in company history a SOC audit came back with zero material findings after a full rewrite of security procedures, protocols and standards was completed. This drastically increased customer confidence in the product and platform and unblocked several pending deals to move forward totaling ~1.5 MM in recurring revenue.

**Tech Stack:**  
AWS EKS, AWS OpenSearch, AWS Aurora MySQL, Cloudflare DNS, Workers, CDN & WAF, Java, Vue.js, Kafka, Mongodb, Thanos, Auth0, Ambassador EDGE Stack

---

### Product Features for Incident Operators

**Overview:**  
Led a cross-functional effort to gather the requirements, design and complete the implementation for several features that when combined created a robust incident management capability within the product.  
- A situation room aiding operators in managing ongoing incidents with features such as:  
  - A chat capability aligned with incidents allowing for general discussion around an incident but also the ability to flag which comments were part of the resolving steps for an incident, allowing for reuse of this knowledge in future incidents.
  - Automatically detecting similar incidents so that they can be shown along with their resolving steps.
  - A timeline showing how alerts unfolded over time and allowing for forensics during and after incidents.

**Impact:**  
These features drove strong sales conversion in Q2 and Q3 where we remained above forecast by 15% across both quarters.

**Tech Stack:**  
Quarkus Java, Vue, Aurora MySQL

**Visuals:**  
Moogsoft situation room for working incidents, Moogsoft Logo, Moogsoft Logo

---

### Cloud Cost Savings and Re-Architecture

**Overview:**  
Led a refactor with my architect to make our services multitenant aware allowing for a significant reduction in the footprint of the infrastructure required to operate them. We also consolidated several similar services and began to adopt a modules not services approach. This significantly reduced the connection overhead on shared components such as Mongodb and Kafka as well, allowing for further right sizing. Finally, we negotiated an ELA with AWS, purchased reserved instances and moved to ephemeral compute for services capable of operating in this way reliably.

**Impact:**  
This led to a 64% cost reduction to operate a single customer. The reuse of infrastructure with multitenant aware services allowed us to deploy far fewer pods and run much leaner clusters. With connections being our primary bottleneck for scaling shared components like Mongo, Kafka and AWS Aurora the reduction in pod count paid dividends and allowed us to shrink these clusters to see further savings.

**Tech Stack:**  
CloudHealth, Kubecost, AWS Cost Explorer, Excel.... lots of Excel

---

### Time Series v2

**Overview:**  
Migrated the product's timeseries data store from Mongodb to [Thanos](https://thanos.io/) (Highly available Prometheus setup with long term storage capabilities). Reimagined anomaly detection configuration to enable simple but deep alerting that relied on PromQL. Redesigned query UI to allow for faceted search that generated PromQL using open source [PromLens](https://promlens.com/) (the query builder for PromQL).

**Impact:**  
The new capability allowed customers to fine tune anomaly detection with a dynamic metric policy that leveraged PromQL syntax. This lessened the configuration burden for customers to maintain their alerts. This also unblocked the Grafana integration that was on hold.

**Tech Stack:**  
Thanos, MongoDB, PromLens, Prometheus-Proxy

**Visuals:**  
Moogsoft Logo

---

### Grafana Infinity Datasource for Moogsoft

**Overview:**  
Assisted Grafana and a mutual client with developing an [Infinity datasource](https://sriramajeyam.com/grafana-infinity-datasource/) integration for Moogsoft's existing REST APIs. This allowed for real time updates in Grafana without any changes in the Moogsoft API or code base.

**Impact:**  
Several clients were able to reuse the new integration and solve a long standing feature request for the new SaaS product.

**Tech Stack:**  
Grafana, Infinity data source plugin, REST APIs

---

**VP of Engineering**

**Duration:** 1 year

**Brief Description:**  
Oversaw all aspects of engineering with the exception of the data science teams. This included both product lines; on premise and SaaS.

**Key Achievements:**  
During this time, we reorganized engineering and other parts of the business to focus on the SaaS product. Both the product and team were adding more SaaS features and skillsets respectively. This transition alone was an achievement as we successfully reorganized the business around the SaaS product and engineering started to gain momentum in the new model.

**Promotions Sponsored:**  
*(Not detailed in the provided text)*

**Projects:**

### Provisioning Middleware

**Overview:**  
An integration between a custom built provisioning pipeline, Sales Ops tooling and integration with Marketing forms to provide an end-to-end automated provisioning pipeline and automatically reaped expired trials to keep cloud costs efficient.

**Impact:**  
Saw a significant improvement in the trial lifecycle being automated to keep costs down. Estimates were ~10% savings on our cloud spend for the product line.

**Tech Stack:**  
Stripe, Salesforce, AWS Lambda, DynamoDB, Python, JavaScript, Stripe, Sendgrid, Vue.js

---

### Rust Language Selection for Collector

**Overview:**  
The initial prototype observability agent for the SaaS product was written in Java and carried a heavy footprint when compared competitively against similar agents in the market. Product wanted to see a lighter weight agent created to make us more competitive. We explored, built prototypes and implemented an initial version in Rust. Later, this was migrated to leverage [Vector.dev](https://vector.dev/), a Rust-based telemetry pipeline.

**Impact:**  
Aligning with Rust and selecting Vector as the framework allowed us to deliver numerous capabilities for customers and provided them with a reliable platform we were building on. This allowed customers to take on more complex integrations and deployment models to meet their needs for a local installation of our agent.

**Visuals:**  
UI controls for agents deployed globally

---

### Embedded Analytics with Looker and Snowflake

**Overview:**  
Provided customers with a reporting and dashboard interface.

**Impact:**  
Landed several pending deals and provided an alternative for existing customers on a legacy platform to migrate.

**Tech Stack:**  
Looker, Snowflake, Kafka Streams

**Visuals:**  
UI controls for agents deployed globally

---

**Senior Director of Engineering**

**Duration:** 1 year

**Brief Description:**  
Oversaw all Product, Platform, Enablement and Development at Moogsoft with the exception of data science.

**Key Achievements:**  
Scaled the platform for growth while reducing cost objectives.

**Promotions Sponsored:**  
*(Not detailed in the provided text)*

**Projects:**

### Continuous Delivery for Cloud

**Overview:**  
CI/CD automation end-to-end.

**Impact:**  
The company was able to go from a typical release occurring once every 6 months to having the ability to release daily in our new SaaS product.

**Tech Stack:**  
Jenkins, Gradle, AWS CLI, Artifactory, Groovy

---

### Quarkus Framework Selection and Implementation

**Overview:**  
Standardized Java coding standards.

**Impact:**  
Prior to Quarkus being introduced, engineers often wrote generic Java which led to a lack of reuse and high level feature adoption. It also created a training burden upon hiring new engineers who had to learn a company-specific standard versus a known entity in the industry.

**Tech Stack:**  
Quarkus

---

**Principal Product Manager**

**Duration:** 1 year

**Brief Description:**  
I was an internally focused technical product manager who worked with the analytics, ML and platform engineering as an embedded product manager.

**Key Achievements:**  
Modernized customization on the platform, improved TCO for customers, decreased time to upgrade and delivered insightful statistics and metrics.

**Projects:**

### Custom JavaScript to Low Code Workflow Engine

**Overview:**  
Provided a more structured way for customers to customize their implementation through a workflow-based interface.

**Impact:**  
Allowed for reporting, analysis and better understanding by the field and support around what customizations a customer was working with. Enabled greater code reuse and fewer bespoke deployments.

**Tech Stack:**  
Rhino Javascript engine, Java, RabbitMQ, MySQL, Nginx, Tomcat

**Visuals:**  
UI controls for agents deployed globally

---

### Insights Analytics for On-Premise Product

**Overview:**  
Provided timeseries data for Moogsoft users, teams, and managers.

**Impact:**  
Established an architecture to create stats from data in the Moogsoft database and surface those through a Grafana plugin.

**Tech Stack:**  
Tomcat, Nginx, MySQL, Java, RabbitMQ

**Visuals:**  
[Grafana Plugin](https://grafana.com/grafana/plugins/moogsoft-aiops-app/)

---

### SSO Integration (LDAP, OIDC) On-Premise Product

**Overview:**  
Enabled SSO to support multiple automated use cases for customers.

**Impact:**  
Allowed for LDAP and OIDC authentication to a Moogsoft instance which unlocked several new deals and met expectations for modern platforms.

**Tech Stack:**  
Apache Shibboleth

**Visuals:**  
[Any relevant graphs, diagrams, or representations]

---

**GoDaddy / Director of SRE (Observability)**

**Duration:** 12 years

**Brief Description:**  
GoDaddy is one of the world's leading domain registrars and web hosting companies, established in 1997 by Bob Parsons. With headquarters in Scottsdale, Arizona, GoDaddy's primary purpose is to empower entrepreneurs and businesses by providing them with the tools they need to create and manage their online presence. Their vast array of services includes domain registration, web hosting, website builders, email hosting, SSL certificates, and online marketing tools. As of 2021, GoDaddy manages over 80 million domain names for more than 20 million customers globally.

**Roles Held:**  
Senior Director of SRE (Observability & ITSM), Director of SRE (Observability), Director of Global NOC, Advanced Technical Support, Online Support

---

**Senior Director of SRE (Observability & ITSM)**

**Duration:** 4 years

**Brief Description:**  
Oversaw a shared service function responsible for all observability, on-call, and ITSM tooling services within the larger engineering organization.

**Key Achievements:**

- Modernized timeseries, logging and event management for the company, shifting from a manual command and control posture to an automated "no man in the middle" approach, reducing MTTD by 1 hour and MTTR by 30%.

**Promotions Sponsored:**

- 3 SRE promotions (one at level 5, the highest in our paradigm)
- 2 SDE promotions (at level 4, the second highest in our paradigm)

**Architecture:**  
*(Not specified)*

**Projects:**

### Network Telemetry Improvements & Tooling Consolidation

**Overview:**  
In collaboration with the network engineering, storage engineering, and architecture teams, GoDaddy underwent a strategic overhaul of network tools and telemetry to prepare for SDN and modernize the network stack. My team and I were responsible for the observability/telemetry portion of this initiative.  
- **Sevone:** Collected SNMP data with SevOne and created a topology based on this data, which was then fed to Moogsoft to aid correlation of network outages. SevOne replaced Zabbix, Nagios, and CA Spectrum tools.
- **Kentik:** Collected sFlow and NetFlow data from network and security devices distributed across the company.
- **Elastalert:** Designed, built, and deployed an Elasticsearch cluster to analyze syslog data for network devices, enabling more intelligent alerts.
- **Moogsoft:** Correlated events using a vertex entropy method that relied on underlying topology data to understand node fragility and potential impact.
- **ServiceNow:** Integrated device records, metadata, and provisioning of devices into other monitoring applications using a custom development integration.

**Impact:**  
- Reduced network team overhead and decreased MTTR by 40%.
- Provided near real-time topology for operators, aiding in accurate diagnosis of incidents.
- Improved automated mitigation times from ~15 minutes to sub-minute once a bad actor was detected.

**Tech Stack:**  
Sevone, Kentik, Kafka, Fluentbit, Elastic, Moogsoft, ServiceNow

---

### OpenStack Stability SWAT

**Overview:**  
Tasked with stabilizing our internal cloud offering and improving visibility into its operation.

**Impact:**  
Created a cross-functional working group to ideate, audit, and improve telemetry for various OpenStack components, resulting in a more stable cloud environment.

**Tech Stack:**  
OpenStack, RabbitMQ, Syslog, Graphite, Elastic, Moogsoft

---

### MySQL Telemetry Deep Dive and Performance Optimizations

**Overview:**  
Tasked with stabilizing our MySQL fleet according to best practices.

**Impact:**  
Audited, normalized, and brought the fleet of MySQL hosts under standardized automated deployment and fleet management tooling; identified hosts for retirement (~2M in combined hardware and operational waste) and deployed standard telemetry packages to greatly increase visibility.

**Tech Stack:**  
Rundeck, ServiceNow CMDB

---

### Metrics as a Service

**Overview:**  
Provided a centralized timeseries platform that initially delivered over 1,000 metrics per server, enabling BI, Finance, Program Management, and others to plan a rational migration strategy from private data centers to the public cloud. Followed up with application metrics empowering developers to better understand their applications and deployments.

**Tech Stack:**  
Carbon C-relay, Go-carbon, Graphite

---

### Sensu as a Service

**Overview:**  
Overhauled synthetic monitoring by replacing our home-grown Nagios fork with Sensu.

**Impact:**  
Allowed internal teams to self-service their monitoring, significantly reducing the time required for modifications and distributing monitoring responsibilities across engineering teams.

**Tech Stack:**  
Sensu, RabbitMQ, Redis, Kafka (Big Data integration)

**Visuals:**  
[Any relevant graphs, diagrams, or representations]

---

### Director of Global Network Operations Center

**Duration:** 4 years

**Brief Description:**  
Oversaw all ITSM functions, tooling, and processes for the company, including incident management, problem management, change management, and more.

**Key Achievements:**  
Transformed the NOC from a manual command-and-control team to a tool-driven operation capable of handling major incident management.

**Projects:**

#### One-Click Provisioning Automation Improvements

**Overview:**  
Improvements to provisioning automation.

**Impact:**  
Improved reliability and reduced high toil tasks for the already overburdened NOC team by streamlining various phases of our build process.

**Tech Stack:**  
Java, Python

---

#### Tardis Oncall Automation

**Overview:**  
Developed an automation framework integrating several internal tools to ease on-call automation.

**Impact:**  
Greatly reduced the time per task for NOC staff by providing a single-pane-of-glass interface and the ability to escalate calls—initially manually and later automatically.

**Tech Stack:**  
Node.js, MIR3, MySQL, Redis, Bootstrap
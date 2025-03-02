### Company / Role / Project Structure:

1. **Moogsoft / Head of Engineering
	- **Duration:** 5 years
	- **Brief Description:** Moogsoft is a technology company specializing in artificial intelligence for IT operations (AIOps). Founded in 2011, Moogsoft's primary mission is to help large-scale IT departments automate their most challenging tasks by using machine learning and data science. Their platform aims to reduce the noise in IT alerts, streamline incident management, and facilitate collaboration among IT teams. By leveraging AI, the company assists organizations in ensuring that their IT infrastructures remain robust and efficient. Throughout the duration of my various roles at Moogsoft my focus was on easing delivery challenges, posturing us to be a SaaS product led company and to keep the lights on for on prem customers who we continued to support with updates.  Intent to acquire Moogsoft was announced by Dell Technologies in July of 2023 following my departure.        
	- **Roles Held:** SVP of Engineering, VP of Engineering, Director of Engineering, Principal Product Manager
	
	 1. SVP of Engineering & Interim CISO 
		 - **Duration:** 2 years
		 - Brief Description:** Oversaw all Product, Platform, Enablement and Development at Moogsoft with the exception of data science. 
		 - **Key Achievements:** 
			 - Took a product GA and in the first year achieved $2 Million in net new ARR and $5 Million of net new ARR for the business. 
			 - Named a leader by [EMA's Radar Report] (https://www.moogsoft.com/press-releases/moogsoft-named-a-leader-in-emas-radar-report-on-aiops-and-wins-devops-innovation-award/) on AIOps and won a DevOps Innovation Award
			 - 2022 SIIA CODiE Award finalist in the Best DevOps Tool category
		- **Promotions Sponsored:**  
			- Sr. Manager of FE Development promoted to Director of Engineering
			- Principal Frontend Developer to FE Lead
			- SRE Lead to Manager of SRE
			- Manager of SRE to Director
			- Principal SRE to SRE Lead
			- Director of Tech Content to VP of Tech Content and Enablement
			- IT Manager to Director of IT/SecOps
		 - **Architecture:** 
			 -[[Moogsoft Architecture.drawio (1).svg]]
			
		- **Projects:**
			- Enterprise SaaS Processes & Platform capabilities for Regulated Industries
				- **Overview:** SSO Integration (OIDC, SAML), RBAC, Custom Roles, Proxy Collector Support. Rewrote all security procedures and controls for SOC II and related audit requirements, Implemented a new customer trust portal for questionnaire automation. Included in the changes supporting this was series of changes to the WAF implementation to block known bad vectors and aligning with standards like OWASP top 10 and Product improvements giving users more control over their authentication configuration. These platform improvements and process improvements aided Moogsoft's push into the high regulated financial sector which supported record quarters back to back in 2022. 
				- **Impact:** For the first time in company history a SOC audit came back with zero material findings after a full rewrite of security procedures, protocols and standards was completed. This drastically increased customer confidence in the product and platform and unblocked several pending deals to move forward totaling ~1.5 MM in recurring revenue. 
				- **Tech Stack:**  AWS EKS, AWS OpenSearch, AWS Aurora MySQL, Cloudflare DNS, Workers, CDN & WAF, Java, , Vue.js, Kafka, Mongodb, Thanos, Auth0, Ambassador EDGE Stack 
				- **Assets:** 
					
			- **Product Features for Incident Operators**
				- **Overview:** Led a cross functional effort to gather the requirements, design and complete the implementation for several features that when combined created a robust incident management capability within the product. 
					- A situation room aiding operators in managing ongoing incidents with features such as 
					- A chat capability aligned with incidents allowing for general discussion around an incident but also the ability to flag which comments were part of the resolving steps for an incident, allowing for reuse of this knowledge  in future incidents.
					- Automatically detecting similar incidents so that they can be shown along with their resolving steps. 
					- A timeline showing how alerts unfolded over time and allowing for forensics during and after incidents. 
				- **Impact:** These features drove strong sales conversion in Q2 and Q3 where we remained above forecast by 15% across both quarters. 
				- **Tech Stack:** Quarkus Java, Vue, Aurora MySQL 
				- **Visuals:** 
				![[Pasted image 20230828134022.png]]
				![[Pasted image 20230828134046.png]]
				![[Pasted image 20230828134309.png]]
				
			- **Cloud Cost Savings and Re-Architecture**
				- **Overview:** Led a refactor with my architect to make our services  multitenant aware allowing for a significant reduction in the footprint of the infrastructure required to operate them. We also consolidated several similar services and began to adopt a modules not services approach. This significant reduced the connection overhead on shared components such as Mongodb and Kafka as well allowing for further right sizing.  Finally we negotiated an ELA with AWS, purchased reserved instances and moved to ephemeral compute for services capable of operating in this way reliably. 
				- **Impact:** This led to a 94% cost reduction to operate a single customer. The reuse of infrastructure with multitenant aware services allowed us to deploy far fewer pods and run much more lean clusters. With connections being our primary bottleneck for scaling shared components like Mongo, Kafka and AWS Aurora the reduction in pod count paid dividends and allowed us to shrink these clusters to see further savings. 
				- **Tech Stack:** CloudHealth, Kubecost, AWS Cost Explorer, Excel.... lots of Excel 
				
				
			- Time Series v2
				- **Overview:** Migrated the products timeseries data store from Mongodb to [Thanos] ([Thanos - Highly available Prometheus setup with long term storage capabilities](https://thanos.io/)). Reimagined anomaly detection configuration to enable simple but deep alerting that relied on PromQL. Redesigned query UI to allow for faceted search that genereated PromQL using open source [PromLens] ([PromLens, the query builder for PromQL - PromLens](https://promlens.com/))
				- **Impact:** The new capability allowed customers to fine tune anomaly detection with a dynamic metric policy that leveraged Promql syntax. This lessened the configuration burden for customers to maintain their alerts. This also unblocked the Grafana integration that was on hold. 
				- **Tech Stack:** Thanos, MongoDB, PromLens, Prometheus-Proxy
				- **Visuals:** ![[Z_FEATURE_1.jpg]]
			- **Grafana Infinity Datasource for Moogsoft**
				- **Overview:** Assisted Grafana and a mutual client with developing an [Infinity datasource] (https://sriramajeyam.com/grafana-infinity-datasource/) integration for Moogsoft's existing Rest APIs. This allowed for real time updates in Grafana without any changes in the Moogsoft API or code base. 
				- **Impact:** Several clients were able to reuse the new integration and solve a long standing feature request for the new SaaS product. 
				- **Tech Stack:** Grafana, Infinity data source plugin, Rest APIs
	
	 2. VP of Engineering 
		 - **Duration:**  1 year
		 - **Brief Description:** Oversaw all aspects of engineering with the exception of the data science teams. This included both product lines; On premise and SaaS 
		 - **Key Achievements:** During this time we were reorganizing engineering and other parts of the business to focus on the SaaS product. So both the product and team were adding more SaaS features and skillsets respectively. This transition alone was an achievement as we successful reorganized the business around the SaaS product and engineering started to gain momentum in the new model. 
		 - **Promotions Sponsored:** 
		 - **Projects:**
			- Provisioning Middleware
				- **Overview:** An integration between a custom built provisioning pipeline, Sales Ops tooling and integration with Marketing forms to provide an end to end automated provisioning pipeline and automatically reaped expired trials to keep cloud costs efficient.   
				- **Impact:** Saw a significant improvement in the trial lifecycle being automated to keep costs down. Estimates were ~10% savings on our cloud spend for the product line. 
				- **Tech Stack:** Stripe, Salesforce, AWS Lambda, DynamoDB, Python, JavaScript, Stripe, Sendgrid, vue.js 
			
				
			- Rust Language selection for Collector
				- **Overview:** The initial prototype observability agent for the SaaS product was written in Java and carried a heavy footprint when compared competitively against similar agents in the market. Product wanted to see a lighter weight agent created to make us more competitive. We were also looking for a framework that would expedite integration delivery if possible. This led us to explore, build prototypes and implement an initial version in Rust. Later this was migrated to leverage Vector.dev which is a rust based telemetry pipeline 
				- **Impact:** Aligning with Rust and selecting Vector as the framework allowed us to deliver numerous capabilities for customers and provided them with a reliable platform we were building on. This allowed customers to take on more complex integrations and deployment models to meet their needs for a local installation of our agent. 
				- Visuals:  ![[cebd004f-3f2c-42a8-a1ef-ba3039e19de2.png]]
	
			- Embedded Analytics with Looker and Snowflake
				- **Overview:** Provide customers with a reporting and dashboard interface
				- **Impact:** Landed several pending deals and provided an alternative for existing customers on a legacy platform to migrate
				- **Tech Stack:** Looker, Snowflake, Kafka Streams
				- **Visuals:** ![[Blog_-October-Monthly-Moo-dashboard.jpg]]
				
	1. Senior Director of Engineering
		- **Duration:** 1 years
		- **Brief Description:** Oversaw all Product, Platform, Enablement and Development at Moogsoft with the exception of data science. 
		- **Key Achievements:** Scaled the platform for growth while reducing cost objectives
		- **Promotions Sponsored:** 
		- **Projects:**
			1. Continuous Delivery for Cloud 
				- **Overview:** CI/CD automation end to end 
				- **Impact:** The company was able to go from a typical release occurring once every 6 months to having the ability to release daily in our new SaaS product. 
				- **Tech Stack:** Jenkins, Gradle, AWS CLI, Artifactory, Groovy
		
			2. Quarkus Framework Selection and Implementation  
				- **Overview:** Standardized Java coding standards
				- **Impact:** Prior to Quarkus being introduced engineers often wrote generic Java and this led to a lack of reuse and high level feature adoption. It also created a training burden upon hiring new engineers that they would have to learn a company specific standard vs a known entity in the industry. 
				- **Tech Stack:** Quarkus 

	4. Principal Product Manager
		- **Duration:** 1 year
		- **Brief Description:** I was an internally focused technical product manager who worked with the analytics, ML and platform engineering as an embedded product manager
		- **Key Achievements:** Modernized customization on the platform, improved TCO for customers, decreased time to upgrade and delivered insightful statistics and metric. 
		- **Projects:**
			1. Custom JavaScript to Low Code Workflow Engine
				- **Overview:** Provided a more structured way for customers to customize their implementation through a Workflow based interface. 
				- **Impact:** Allowed for reporting, analysis and better understanding by the field and support around what customizations a customer was working with. Allowed for greater code reuse and less bespoke deployments. 
				- **Tech Stack:** Rhino Javascript engine, Java, RabbitMQ, MySQL, Nginx, Tomcat
				- **Visuals:** ![[73Screen-1-1900.jpg]]
			2. Insights analytics for On-Premise Product
				- **Overview:** Timeseries data for Moogsoft Users, Teams, and Managers
				- **Impact:** Provided an architecture to create stats from data in the moogsoft database and surface those through a grafana plugin
				- **Tech Stack:** Tomcat, Nginx, MySQL, Java, RabbitMQ  
				- **Visuals:** https://grafana.com/grafana/plugins/moogsoft-aiops-app/

			3. SSO integration (LDAP, OIDC) On-Premise Product
				- **Overview:** SSO to enable multiple automated use cases for customers
				- **Impact:** Allowed for LDAP and OIDC authentication to a Moogsoft instance which unlocked several new deals as well as meeting expectations for modern platforms. 
				- **Tech Stack:** Apache Shibbeloth 
				- **Visuals:** [Any relevant graphs, diagrams, or representations]

2. **GoDaddy / Director of SRE (Observability)
	- **Duration:** 12 years
	- **Brief Description:** GoDaddy is one of the world's leading domain registrar and web hosting companies, established in 1997 by Bob Parsons. With its headquarters in Scottsdale, Arizona, GoDaddy's primary purpose is to empower entrepreneurs and businesses by providing them with the tools they need to create and manage their online presence. Their vast array of services includes domain registration, web hosting, website builders, email hosting, SSL certificates, and online marketing tools. As of 2021, GoDaddy boasts management of over 80 million domain names for more than 20 million customers globally, making it one of the largest players in the domain and web services industry. Their expansive reach is also reflected in their operations across numerous countries and a sizable workforce.        
	- **Roles Held:** Senior Director of SRE (Observability & ITSM), Director of SRE (Observability), Director of Global NOC, Advanced Technical Support, Online Support
	
	 1. Senior Director of SRE (Observability & ITSM)
		 - **Duration:** 4 years 
		 - Brief Description:** Oversaw a shared service function responsible for all observability, oncall, and ITSM Tooling services within the larger engineering organization. 
		 - **Key Achievements:** 
			 - Modernized Timeseries, Logging and Event Management for the company allowing them to move from a manual command and control posture to an automated no man in middle approach reducing MTTD on average by 1 hour and our MTTR by 30%.
		- **Promotions Sponsored:**  
			-  3 SRE promotions with one being a level 5 (highest in our paradigm)
			- 2 SDE promotions witho n being a level 4 (second highest in our paradigm)
		 - **Architecture:** 
			 -
		- **Projects:** 
			- **Network Telemetry Improvements & Tooling Consolidation**
				- **Overview:** In collaboration with the network engineering, Storage Engineering,  and architecture teams GoDaddy underwent a strategic overall of network tool and telemetry to prepare for SDN and modernization of our network stack that was underway. My team and I were responsible for the observability/telemetry portions of this modernization. 
					- Sevone - SNMP was collected with SevOne and Topology was created based on this data collected. This topology was then fed to Moogsoft to aid correlation of network outages. SevOne  replaced Zabbix, Nagios and CA Spectrum tools that were managed to all accomplish this same workload. 
					- Kentik - Collected Sflow and Netflow from network and security devices distributed across the companies network. 
					- Elastalert - Design, Built and deployed an Elastic Search cluster to help analyze the data coming from Syslog for network devices. Via Elastalert we were able to start creating more intelligent alerts for our network components. 
					- Moogsoft - Moogsoft correlated events using a vertex entropy method that relied on underlying topology data to understand the node fragility and likelihood that it is potentially the source of impact. 
					- ServiceNow - All device records, metadata and provisioning of devices into the other monitoring applications was driven from ServiceNow using a custom development integration. 
				- **Impact:** 
					- All Networking alerts were correlated to reduce overhead the network team and MTTR was reduced by 40%. 
					- Near Realtime topology was available for correlation and to operators within Moogsoft.  This aided in proper diagnosis of an incident being a hazardous condition (loss of redundancy) vs actual impact making the network operations team more efficient. 
					- Through the analytics and alerting automated mitigation was improved from ~15 Minutes to mitigate once a bad actor was detected to sub minute once detected. 
				- **Tech Stack:** Sevone, Kentik, Kafka, Fluentbit, Elastic, Moogsoft, ServiceNow 
			- **OpenStack Stability SWAT**
				- **Overview:**  Asked to help stabilize our internal cloud offering and improve visibility into it's operation
				- **Impact:** Created a cross-functional working group to ideate, audit and improve the telemetry for the various Openstack components.  Implemented numerous standard and customized metrics, developed a custom view and made several tuning changes to stabilize the cloud environment that was running scaling and stability issues with RabbitMQ. 
				- **Tech Stack:**  Openstack, RabbitMQ, Syslog, Graphite, Elastic, Moogsoft
			- **MySQL Telemetry deep dive and Performance Optimizations**
				- **Overview:** Asked to help stabilize our MySQL fleet for best practices
				- **Impact:** Audited, normalized, and brought the fleet of MySQL hosts under standard automated deployment and fleet management tooling, Identified hosts for retirement (~2M in combined hardware and operational waste) and deployed the companies standard telemetry packages to greatly increase visibility. 
				- **Tech Stack:** Rundeck, ServiceNow CMDB, 
			- Metrics as a Service
				- **Overview:** Provide a centralized timeseries platform
				- **Impact:** Initially we provided over 1k metrics per server which allowed for BI, Finance, Program Management and others to work towards a rational migration strategy from private DCs to Public Cloud. Followed it up with Application metrics empowering developers to better understand their applications and deployments. 
				- **Tech Stack:** Carbon C-relay, Go-carbon, Graphite and 
			- Sensu as a Service 
				- **Overview:** Overhaul Synthetic Monitoring by replacing our home grown Nagios fork with Sensu
				- **Impact:** Moving our of our custom solution allowed for internal teams to self service their monitoring. This greatly improved the time to change for monitoring modifications but more importantly distributed the responsibility out to engineering teams. 
				- **Tech Stack:** Sensu, RabbitMQ, Redis, Kafka (Big Data integration)
				- **Visuals:** [Any relevant graphs, diagrams, or representations]
	 1. Director of Global Network Operations Center  
		 - **Duration:**  4 years
		 - **Brief Description:** Oversaw all ITSM functions, tooling and processes for the company including Incident Management, Problem Management, Change Management and more. 
		 - **Key Achievements:** Moved the NOC from a manual command and control team to a team developing tools, solutions and providing a major incident management function. 
		 - **Projects:**
			- One click Provisioning Automation Improvements
				- **Overview:** Improvements to Provisioning automation 
				- **Impact:** Improved the reliability and reduced a high toil task for the already underwater NOC team by working with a cross-functional team on issues related to different phases of our build process. 
				- **Tech Stack:** Java, Python 

			- Tardis Oncall Automation 
				- **Overview:** An automation framework integrating several internal tools to ease oncall automation 
				- **Impact:**  Greatly reduced the time per task for NOC staff as they had a single pane of glass, ability to escalate a call out manually at first (automated later)
				- **Tech Stack:**  Node.js, MIR3, MySQL, Redis, Bootstrap 
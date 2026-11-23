# Interview Question Bank — Tech Support, Customer Service & Hospitality Tech Implementation

Gathered 2026-11-24 from candidate-reported interviews (Glassdoor) and hiring/prep guides
(Indeed, Coursera, The Muse, Adaface, Jitbit, CourseCareers, startup.jobs, MockQuestions, etc.).
Reddit is blocked for the web-search tool, so Reddit threads were read separately in a browser —
see **Section 4** for questions Redditors said they were asked.

Tags: **[R]** = reported by candidates as actually asked (Glassdoor/Prepfully) · **[G]** = from hiring/prep guides · **[Reddit]** = reported on Reddit (Section 4) · **[JD]** = written from the job description + vendor docs (Section 5)

---

## 1. Shared — asked in BOTH roles

### Non-technical / behavioral
1. Tell me about yourself. [G]
2. Why do you want to work in support / customer service? Why this company? [G]
3. What does excellent customer service mean to you? [G]
4. Tell me about a time you dealt with a difficult or angry customer. What did you do and what was the result? [R]
5. How would you handle an angry customer who demands an immediate resolution? [R]
6. Tell me about a time you went above and beyond for a customer. [G]
7. Tell me about a time something did not go as planned. [R]
8. Tell me about a mistake you made and how you corrected it. [G]
9. A customer has already spoken to several agents and still has no solution. How do you handle it? [G]
10. How do you handle a request that goes against company policy (e.g., a refund outside the policy)? [R]
11. How do you stay calm and avoid burnout when handling many difficult interactions in a row? [G]
12. How do you prioritize when several customers/tickets need you at the same time? [G]
13. What would you do if you didn't know the answer to a customer's question? [G]
14. When would you escalate an issue to a supervisor or higher tier? [R]
15. Tell me about a time you received negative feedback. How did you respond? [G]
16. How do you keep customer data confidential? [R]
17. Describe a time you worked in a team to solve a problem. [G]
18. Are you comfortable with shift work, weekends, or holidays? [G]
19. Where do you see yourself in 2–3 years? [G]
20. Do you have any questions for us? [G]

### Light technical (both roles)
21. What ticketing / CRM tools have you used (Zendesk, Freshdesk, ServiceNow, Jira, Salesforce)? [G]
22. How do you document a ticket or interaction so the next person can pick it up? [G]
23. What metrics do you think measure good support (CSAT, NPS, first-contact resolution, response time)? [R]
24. How would you respond to a customer who gave you a low NPS/CSAT score? [R]

---

## 2. Tech Support / Help Desk

### Technical — concepts
1. What is DNS? What is DHCP? How do they differ? [R]
2. What is an IP address? Difference between public and private IP? [G]
3. What is a default gateway? What is a subnet mask? [G]
4. What is Active Directory? What is a domain, a tree, and a forest? [R]
5. How do you reset a user's password / unlock an account in Active Directory? [R]
6. What is Group Policy? [G]
7. Difference between a switch, a router, and a hub? [G]
8. What is a VPN and why do companies use it? [G]
9. What are the OSI model layers? (Often only basics expected.) [G]
10. What is a VLAN? [R]
11. Difference between RAM and storage? What does more RAM help with? [G]
12. What is the difference between a workgroup and a domain? [G]
13. Common ports: what are 80, 443, 22, 3389, 53? [G]
14. What commands do you use for troubleshooting? (ping, ipconfig /all, ipconfig /release /renew, ipconfig /flushdns, nslookup, tracert, netstat) [G]
15. Name some Windows tools you use (Task Manager, Event Viewer, Device Manager, msconfig, services.msc). [G]
16. What is Microsoft 365 / Exchange / Outlook — how would you fix an Outlook profile that won't open? [G]
17. What is the difference between malware, a virus, ransomware, and phishing? [G]
18. What would you do if a user reports a suspected phishing email they already clicked? [G]

### Technical — troubleshooting scenarios
19. A user says their computer is very slow. What are your first five questions? [R]
20. A user cannot connect to the internet, but everyone else can. Walk me through it. [R]
21. You can ping an IP address but not a website name. What's the likely problem? (DNS) [G]
22. A laptop can't print over Wi-Fi (interviewer shows a home network diagram). Why? [R]
23. A printer isn't working. How do you troubleshoot it? (One user or everyone?) [R]
24. A user gets a Blue Screen of Death. What do you do? [R]
25. A user keeps getting locked out of their account after a password reset. Why? (Old password cached on phone/another PC/mapped drive) [G]
26. Someone calls asking for a password reset. What do you do before resetting it? (Verify identity — social engineering risk) [R]
27. A user can't access a shared folder / network drive. Steps? [G]
28. A user's email isn't sending or receiving. Steps? [G]
29. A monitor shows no display. Steps? [G]
30. A new employee starts tomorrow. What do you set up for them? [G]
31. An application keeps crashing after an update. What do you do? [G]
32. How would you remotely support a user who isn't tech-savvy? [R]

### Technical — SaaS / software support (Tier 2, "Support Engineer" roles)
33. What do HTTP status codes 400, 401, 403, 404, 500, 502, 503, 504 mean? [R]
34. A customer using our API is getting HTTP 504 errors. How do you investigate? (Intercom-reported) [R]
35. A customer gets a 403. How do you troubleshoot it? [R]
36. How do you use browser DevTools (Network tab, Console) to diagnose a problem? [G]
37. What is a HAR file and how do you use it? [R]
38. How would you reproduce an API issue? (Postman / curl) [G]
39. Write a simple SQL query / explain SQL joins. (Atlassian-reported) [R]
40. What is the difference between error logs, access logs, and transaction logs? [G]
41. What is the difference between a bug and a feature request, and how do you report a bug to engineering? [G]
42. What is caching / clearing cache and cookies, and when does it fix issues? [G]

### Non-technical (tech support–specific)
43. How do you explain a technical issue to someone with no technical background? [R]
44. Walk me through your troubleshooting process / methodology. [R]
45. A customer is unhappy that their computer is slow and blames you. How do you respond? [R]
46. How long do you work on an issue before escalating it? [R]
47. What's your escalation rate in your previous role? [R]
48. How do you keep your technical skills current (certifications like A+, Network+, home lab)? [G]
49. Tell me about the hardest technical problem you've solved. [G]
50. How do you handle a VIP/executive who wants their issue fixed first? [G]
51. How do you handle a user who insists on a fix you know won't work? [G]

---

## 3. Customer Service / Call Center

### Technical (tools, systems, metrics)
1. What CRM or helpdesk systems have you used? [G]
2. How fast do you type? (Many call centers give a typing test, often ~35–40+ WPM.) [G]
3. Have you handled multiple channels at once (phone, chat, email)? How many chats concurrently? [G]
4. What is AHT (Average Handle Time)? How do you balance AHT against quality? [G]
5. What is First Contact Resolution (FCR) and how do you improve it? [G]
6. How would you measure the quality of service you provide? [R]
7. How do you use a knowledge base / scripts when you don't know an answer? [G]
8. How comfortable are you navigating several systems/screens while talking to a customer? [G]

### Non-technical / scenarios
9. How would you handle a refund request that conflicts with policy? [R]
10. How would you handle a defective product complaint? [R]
11. A customer is yelling and swearing at you. What do you do? [R]
12. A customer asks for something you can't give. How do you say no while keeping them happy? [G]
13. A customer asks to speak to your manager immediately. What do you do? [G]
14. How do you handle a customer who keeps calling about the same issue? [G]
15. How would you turn an angry customer into a satisfied one? Give an example. [R]
16. Tell me about a time you had to deliver bad news to a customer. [G]
17. What would you do if you promised a callback and couldn't make it? [G]
18. How do you handle high call volume / long queues? [G]
19. How do you handle repetitive work without losing quality? [G]
20. How do you handle a customer who speaks a different language or has a strong accent? [G]
21. What would you do if a coworker was being rude to customers? [G]
22. How do you handle a situation where you made a mistake that affected a customer? [G]
23. Why should we hire you over other candidates? [G]

### Role-play tasks (common in call-center interviews)
24. Mock call: a customer was double-charged and is upset — handle the call. [G]
25. Mock call: a delivery is late and the customer needs it today. [G]
26. "Sell me this pen" / "Sell me your phone" (common for sales-oriented customer service). [G]
27. Email/chat writing test: reply to a complaint in writing. [G]

---

## 4. From Reddit — what people said they were actually asked

### Tech Support / Help Desk (r/ITCareerQuestions, r/helpdesk)
Questions Redditors listed from their own Tier 1 / Tier 2 interviews:
1. How would you troubleshoot someone complaining about slow or no internet? [Reddit]
2. A user says they don't have internet. How do you troubleshoot it? [Reddit]
3. How do you troubleshoot a computer that is not connecting to the network/internet? [Reddit]
4. Can you explain what DNS is / how does it work, and why is it important? [Reddit]
5. What is Active Directory? [Reddit]
6. What is an IP address? How do you see a computer's IP? [Reddit]
7. Describe the steps you'd take to troubleshoot a printer that isn't printing. / A user can't print but could last week — what do you do? [Reddit]
8. A user reports their email isn't working / Outlook can't send or receive. What do you do? [Reddit]
9. Describe what happens when a PC boots — in as much detail as you know. (POST, BIOS/UEFI, bootloader, OS) [Reddit]
10. How do you install an operating system (e.g., Windows)? [Reddit]
11. Can you replace a hard drive? [Reddit]
12. What's the difference between a modem and a router? What is PPPoE? (telecom help desk) [Reddit]
13. What is the OSI / TCP-IP model? Difference between Layer 2 and Layer 3? Common port numbers? [Reddit]
14. What tools are at your disposal to resolve a ticket? (knowledge base, documentation, remote tools) [Reddit]
15. Do you have experience with ticketing systems? [Reddit]
16. Tell me about a technical problem/project you encountered and the steps you took to resolve it. (asked even by HR as a written pre-screen) [Reddit]
17. How do you deal with an angry / difficult customer? [Reddit]
18. Tell me about a time multiple users reached out to you at once. How did you handle it? / How do you handle multiple tasks? [Reddit]
19. Tell us about your background. [Reddit]

Redditor advice: Tier 1 is "about 50% customer service"; interviewers care more about *how* you troubleshoot
(ask clarifying questions → check the simple/physical stuff → ipconfig, gateway, flush/renew → document → escalate)
than knowing every answer. Be honest when you don't know; don't bluff.

### Customer Service / Call Center (r/callcentres, r/CustomerService)
1. **Chat written exercise:** A customer wants a resolution immediately, but you need time to research it, and they're getting angrier. What do you say to de-escalate and ask for more time? [Reddit]
2. **Chat written exercise:** A customer asks where their order is. The courier returned it because nobody was home; the provider blames the customer; it can be re-sent if someone pays, and the company can reimburse. What do you tell the customer? [Reddit]
3. Describe a time you had to complete a task where no procedure was in place. (asked for an internal call-center promotion) [Reddit]
4. How do you handle stress? [Reddit]

Redditor advice (call center managers/agents): use **AER (Acknowledge, Empathize, Resolve)** in written answers;
give a clear time estimate and offer check-ins/callback; don't make promises off-script; show you can handle
abuse without taking it personally; managers look for a "kind controller" who drives the call to resolution,
is flexible, and spots opportunities on the call.

---

## 5. Hospitality Technology — Implementation & Support Engineer (OPERA / hotel PMS)

Target job description: install/configure/test/troubleshoot enterprise hospitality tech; implementations,
integrations, go-lives; app/server/connectivity/integration issues; third-party interfaces & vendors;
end-user training; technical documentation. Wants Windows Server, networking, databases/SQL, OPERA or other PMS.

No public bank of OPERA-specific interview questions turned up (searched Glassdoor, prep sites, job posts).
Questions below combine: candidate-reported questions from **adjacent roles** (Oracle support, application support,
implementation) **[R]**, prep guides **[G]**, and questions built from this job description + Oracle OPERA docs **[JD]**.

### 5.1 Windows Server
1. Which Windows Server versions have you worked with? What roles/features have you installed (IIS, AD DS, DNS, DHCP, File Services)? [R]
2. An application service on a server won't start. How do you troubleshoot it? (services.msc, service account/password, dependencies, Event Viewer → Application/System logs) [G]
3. How do you use Event Viewer? Which logs would you check first? [G]
4. Users get "500 Internal Server Error" from a web app hosted on IIS. Where do you look? (IIS logs, app pool stopped/identity, Event Viewer, recent changes) [R]
5. What is an IIS application pool and why would you recycle one? [R]
6. A server is running slowly / CPU at 100%. Steps? (Task Manager / Resource Monitor / PerfMon, which process, disk space, memory) [G]
7. How do you check disk space and what do you do if the server's C: drive is full? [G]
8. How do you connect to and manage servers remotely? (RDP, PowerShell, remote tools) [G]
9. What is a service account and why shouldn't apps run as a personal admin account? [JD]
10. How do you apply Windows updates/patches to a production server without disrupting a 24/7 hotel? [JD]
11. What is the difference between a physical server, a VM, and cloud hosting? [G]
12. Basic Active Directory: create a user, reset a password, add to a group, what is Group Policy? [R]
13. How would you schedule a recurring task/script on a server? (Task Scheduler) [G]
14. What would you check after a server reboot to confirm the application is healthy? [JD]

### 5.2 Networking & connectivity
15. Explain DNS, DHCP, static vs dynamic IP, subnet mask, default gateway. [R]
16. Difference between TCP and UDP? [R]
17. A workstation can't reach the application server. Walk me through it. (ping, nslookup, tracert, telnet / Test-NetConnection to the port, firewall) [G]
18. How do you test whether a specific port is open between two systems? (Test-NetConnection -Port, telnet) [JD]
19. What is a firewall rule, and how would you know one is blocking an interface? [JD]
20. What are VLANs and why do hotels separate guest Wi-Fi, POS, and back-office networks? [JD]
21. What is a VPN / site-to-site VPN? How do vendors usually connect to support a property? [JD]
22. What is a digital/SSL certificate? What happens when one expires? [R]
23. Common ports: 80, 443, 1433 (SQL Server), 1521 (Oracle DB), 3389 (RDP), 22, 21/SFTP. [G]
24. Difference between a switch, a router, and a firewall? [G]

### 5.3 Databases & SQL
25. What is a database, table, primary key, foreign key, index? [R]
26. Write a query to find all reservations/guests arriving today. (SELECT … WHERE …) [JD]
27. Explain INNER JOIN vs LEFT JOIN. When would you use a LEFT JOIN? [R]
28. How do you find duplicate records? (GROUP BY … HAVING COUNT(*) > 1) [R]
29. What does GROUP BY do? Difference between WHERE and HAVING? [R]
30. What's the difference between DELETE, TRUNCATE, and DROP? [G]
31. A query is running very slowly. How would you approach it? (execution plan, indexes, locking) [R]
32. What are transactions and ACID properties? Why use BEGIN/COMMIT/ROLLBACK before changing production data? [R]
33. How do you back up and restore a database? What's the difference between full, differential, and log backups? [G]
34. A customer's production database is down. What do you do first? [R]
35. Would you ever run an UPDATE directly on a production database? What precautions would you take? [JD]
36. Oracle vs SQL Server — have you used either? (OPERA on-premise runs on Oracle Database) [JD]

### 5.4 Application, server & integration troubleshooting
37. Walk me through your troubleshooting methodology for an application issue. (reproduce → scope: one user/all users → logs → recent changes → isolate app vs server vs network vs data → fix → document) [R]
38. In a production outage, what's your first priority — finding the root cause or restoring service? [R]
39. An issue happens intermittently with no clear error. How do you triage it? [G]
40. What logs would you check for an application issue, and how do you read them? [G]
41. What is an interface/integration? Explain how two systems exchange data. (APIs, XML messages, files, middleware) [G]
42. Difference between REST and SOAP? What are XML and JSON? [R]
43. What do HTTP status codes 400, 401, 403, 404, 500, 503 mean? [R]
44. Messages between the PMS and an external system are failing/stuck in a queue. How do you investigate and resubmit them? [G]
45. How do you test an API? (Postman, curl) [G]
46. How do you tell whether a problem is on our side or the third-party vendor's side? What evidence do you send them? [JD]
47. A fix requires a restart of a service during hotel operations. How do you plan and communicate that? [JD]
48. How do you prioritize incidents? (impact × urgency, P1–P4; e.g., front desk can't check in guests = P1) [G]
49. What is ITIL? Difference between an incident, a problem, and a change request? [R]
50. Tell me about the hardest technical issue you've resolved. [R]

### 5.5 OPERA / hotel PMS & hospitality interfaces
51. What is a PMS? What are its core modules? (reservations, front desk, rooms/housekeeping, cashiering, accounts receivable, reports, end of day) [JD]
52. Have you used OPERA (V5 or OPERA Cloud) or another PMS? Which modules? [R]
53. Walk me through a guest's lifecycle in a PMS: reservation → check-in → posting charges → check-out. [JD]
54. What is the Night Audit / End of Day? What does it do and what can make it fail? (open sessions, unbalanced folios, interface postings, setup validation) [JD]
55. What systems typically integrate with a hotel PMS? (POS, door locks/key cards, PBX/telephony, Wi-Fi, IPTV, minibar, payment gateway, channel manager/CRS, revenue management, Sales & Catering) [JD]
56. What is OXI? What is IFC / FIAS? What is OHIP / OWS? (OPERA's integration layers) [JD]
57. The key card encoder stopped working at the front desk. How do you troubleshoot? (interface status, IFC service, network to lock server, encoder hardware, vendor) [JD]
58. Restaurant (POS) charges are not posting to guest rooms. What do you check? (interface running, room/guest lookup, posting logs, mapping of revenue codes) [JD]
59. Phone calls from rooms aren't being charged / room status not updating from the PBX. Steps? [JD]
60. Reservations from a booking channel/CRS aren't appearing in the PMS. How do you investigate? (OXI message log, mapping/conversion codes, rate/room type mapping) [JD]
61. What is PCI DSS and why does it matter for hotel payment integrations? [JD]
62. Have you worked with Oracle Simphony, Micros, or other hospitality POS? [JD]
63. What hotel front-office/back-office experience do you have? (Oracle job posts note they value people who understand hotel operations, not just software) [G]

### 5.6 Implementation & go-live
64. Walk me through the phases of an implementation you've done. (discovery → configuration → data migration → testing/UAT → training → go-live → hypercare) [G]
65. How do you gather requirements / configuration details from a hotel? [G]
66. How do you handle data migration from an old system? (mapping, cleaning, test loads, reconciliation, rollback plan) [G]
67. What is UAT and who should sign off? [G]
68. What is a cutover plan? What goes into a go-live checklist? [G]
69. Something critical breaks two hours before go-live. What do you do? [G]
70. How do you handle a client who wants to change scope late in the project? [G]
71. What is hypercare / post-go-live support, and how long should it last? [G]
72. How would you install and configure an application on a new server from scratch? (prerequisites, service accounts, DB connection, licensing, testing) [JD]
73. How do you manage multiple implementations or tasks at once? [R]

### 5.7 Training, documentation & communication
74. How would you train front-desk staff who are not technical on a new system? [G]
75. How do you train "super users" so the property can support itself after go-live? [G]
76. Explain a technical issue (e.g., an interface outage) to a hotel General Manager in plain language. [JD]
77. What technical documentation have you written? (install guides, runbooks, configuration docs, handover/KT docs, ticket notes) [JD]
78. What makes good knowledge-transfer documentation? [JD]
79. How do you communicate status and risks to a project manager or client during an implementation? [G]

### 5.8 Vendors, third parties & non-technical
80. Tell me about a time you worked with a third-party vendor to solve an issue. How did you keep it moving? [JD]
81. A vendor says the problem is on your side; you think it's on theirs. How do you handle it? [JD]
82. A hotel manager is angry because guests can't check in. How do you handle the call? [R]
83. Are you comfortable with travel to properties, on-call, night/weekend go-lives? (hotels run 24/7) [G]
84. Why hospitality technology? Why this company? [G]
85. Tell me about a time you had to learn a new system quickly. [G]
86. Tell me about a time you made a mistake in a production environment and what you did. [G]
87. Where do you see yourself in 2–3 years? (support → implementation → solutions/architect) [G]

---

## 6. Fresh Graduate Set — Hospitality Tech Implementation & Support (no industry experience)

A beginner-level version of Section 5. Interviewers for entry-level hires mostly check **basics, how you think,
attitude, and willingness to learn** — not years of OPERA or server experience. Each question has a short
hint (→) of what a good beginner answer covers. It's OK to say "I haven't done that yet, but here's how I'd approach it."

### 6.1 About you & motivation
1. Tell me about yourself. → school/course, a project or two, why IT support, one personal strength.
2. Why do you want to work in hospitality technology? → hotels run 24/7, tech directly affects guests, you like helping people + solving problems.
3. What do you know about our company / the products we support? → do 10 minutes of homework on the company and on what a hotel PMS is.
4. You don't have work experience in this field. Why should we hire you? → projects, labs, school work, quick learner, customer-facing part-time jobs.
5. What was your favorite subject or project in school, and why? [G]
6. Where do you see yourself in 2–3 years? → grow from support into implementation; earn a cert.
7. Are you okay with shifting schedules, travel to hotels, or occasional night/weekend work? [G]

### 6.2 Basic computer & Windows
8. What is the difference between hardware and software? Between RAM and storage?
9. What is an operating system? What is the difference between Windows 10/11 and Windows Server? → Server runs services for many users.
10. What is a Windows "service"? How would you restart one? → services.msc, or Task Manager → Services.
11. A computer is very slow. What would you check first? → Task Manager (CPU, memory, disk), recent changes, restart. [Reddit]
12. What is Event Viewer used for? → reading error logs to find what went wrong. [G]
13. How do you connect to another computer remotely? → Remote Desktop (RDP), remote support tools.
14. What is a virtual machine? Have you used one? → mention VirtualBox/Hyper-V labs if you did any.
15. What is Active Directory? How do you reset a user's password? → central list of users/computers; verify identity first. [R]

### 6.3 Basic networking
16. What is an IP address? How do you find your computer's IP? → `ipconfig`. [Reddit]
17. What is DNS? What is DHCP? → DNS turns names into IPs; DHCP hands out IPs automatically. [R]
18. What is the difference between a router and a switch? [G]
19. A computer can't connect to the internet but others can. What do you do? → cable/Wi-Fi, `ipconfig`, `ping` gateway, `ping 8.8.8.8`, `ping google.com`, flush DNS. [Reddit]
20. What does the `ping` command do? [G]
21. What is a firewall? → controls which traffic is allowed in/out.
22. What is Wi-Fi vs LAN? Why might a hotel have separate networks for guests and staff? → security.

### 6.4 Basic database & SQL
23. What is a database? What is a table, a row, and a column?
24. What is a primary key? → a unique ID for each row.
25. Write a simple query to show all guests from a table called `guests`. → `SELECT * FROM guests;`
26. How would you find guests whose last name is "Santos"? → `SELECT * FROM guests WHERE last_name = 'Santos';`
27. What is the difference between `DELETE` and `SELECT`? Why be careful with `UPDATE`/`DELETE`? → always use `WHERE`; back up first.
28. What is a JOIN, in simple words? → combining rows from two tables using a shared column. [R]
29. Why are database backups important? [G]

### 6.5 Basic troubleshooting & thinking process
30. Walk me through how you troubleshoot a problem you've never seen before. → ask questions → reproduce → check the simple things → check logs → search knowledge base → fix or escalate → document. [R]
31. What questions would you ask a user who says "the system is not working"? → what exactly, since when, only you or everyone, any error message, anything changed?
32. What do you do if you don't know the answer? → say so honestly, research (docs, knowledge base), ask a senior, follow up with the customer. [G]
33. When should you escalate an issue? → when it's beyond your access/skill, it affects many users, or time limit is reached. [R]
34. Tell me about a technical problem you solved (school, home, project). [Reddit]
35. What is an error log, and why is it useful?
36. What is the difference between an error that affects one user and one that affects everyone? Which do you fix first? → prioritize by impact.

### 6.6 Hotel & hospitality basics (learnable before the interview)
37. What is a Property Management System (PMS)? → the hotel's main system for reservations, check-in/out, rooms, billing. [JD]
38. Have you heard of OPERA? What do you know about it? → Oracle's hotel PMS used by many big hotel chains. [JD]
39. What happens from the time a guest books a room until they check out? → reservation → check-in → stay/charges → check-out/payment. [JD]
40. What other systems might a hotel use besides the PMS? → restaurant POS, door key cards, phones, Wi-Fi, booking websites. [JD]
41. The front desk can't make key cards for guests. Why is this urgent, and what would you check first? → guests can't enter rooms; check the encoder is on/connected, then escalate. [JD]
42. What is a "go-live"? → the day a new system starts being used for real. [G]

### 6.7 Customer service, teamwork & soft skills
43. How would you explain a technical problem to a hotel staff member who isn't technical? → simple words, no jargon, focus on what it means for them. [R]
44. A hotel manager is upset because the system is down. How would you handle the call? → stay calm, listen, apologize, explain next steps, give updates. [R]
45. Tell me about a time you worked in a team (school group project is fine). [G]
46. How would you teach someone to use a new system? → show, let them try, give a simple guide, check back. [G]
47. Why is documentation important? What would you write down after fixing an issue? → problem, cause, steps taken, result. [JD]
48. How do you handle pressure or many tasks at once? [Reddit]
49. Tell me about a mistake you made and what you learned. [G]
50. How do you keep learning new technology? → online courses, YouTube, home lab, certifications (CompTIA A+/Network+, Microsoft basics). [G]

### 6.8 Good questions for YOU to ask them
- What does training look like for new hires? Will I shadow a senior engineer?
- What does a typical day look like — more support tickets or more implementation projects?
- How much travel is involved, and are there night/weekend go-lives?
- What would make someone successful in their first 90 days?

---

## Tips commonly repeated across sources
- Use the **STAR** method (Situation, Task, Action, Result) for behavioral questions.
- For troubleshooting questions, interviewers care more about your **process** (gather info → isolate → test → fix → document) than memorized definitions.
- For angry customers: **listen, empathize, apologize, solve, follow up** — stay calm.
- For password resets, always mention **identity verification**.
- It's fine to say "I'd check the knowledge base or escalate" — but explain *when* and *why*.

---

## Sources

### Reddit threads (read via browser)
- [r/ITCareerQuestions — What to expect in a Tier 1 help desk interview with 0 YOE](https://www.reddit.com/r/ITCareerQuestions/comments/1sv2308/what_to_expect_in_an_tier_1_help_desk_interview/)
- [r/ITCareerQuestions — Help Desk Analyst 2 interview questions](https://www.reddit.com/r/ITCareerQuestions/comments/1jtmyf8/help_desk_analyst_2_interview_questions/)
- [r/helpdesk — Got my first help desk interview Thursday. What should I expect?](https://www.reddit.com/r/helpdesk/comments/1tbudai/got_my_first_help_desk_interview_thursday_what/)
- [r/helpdesk — "How do you install an OS?" interview question](https://www.reddit.com/r/helpdesk/comments/1whbfwd/if_you_were_asked_in_an_interview_how_do_you/) (title only)
- [r/callcentres — I have an interview for a call center job tomorrow](https://www.reddit.com/r/callcentres/comments/fy3r9v/i_have_an_interview_for_a_call_center_job_tomorrow/)
- [r/callcentres — I hate this interview question…](https://www.reddit.com/r/callcentres/comments/1fvr77x/i_hate_this_interview_question/)
- [r/CustomerService — Missed job opportunity: chat exercise prompts](https://www.reddit.com/r/CustomerService/comments/1al712c/hi_everyone_im_a_little_sad_for_a_missed_job/)

### Hospitality technology / implementation role (Section 5)
- [Oracle job post — OPERA PMS Implementation Consultant](https://en.wizbii.com/company/oracle/job/oracle-hospitality-opera-pms-implementation-consultant)
- [Omm IT — Oracle Implementation Consultant (OPERA PMS Deployment Specialist)](https://www.tealhq.com/job/oracle-implementation-consultant_7ea1a205914346f41c3c92780adc4ec0ebe0a)
- [Oracle OPERA (PMS) Support job post](https://www.jobleads.com/us/job/oracle-opera-pms-support--indiana--e51625c96e2537ee2d550fbce3c070786)
- [AltexSoft — How to integrate with OPERA PMS (OXI, OWS, OHIP)](https://www.altexsoft.com/blog/opera-pms-integration/)
- [Oracle docs — OPERA End of Day troubleshooting](https://docs.oracle.com/cd/E98457_01/opera_5_6_core_help/end_of_day_troubleshooting.htm)
- [Oracle docs — OPERA Cloud End of Day (Night Audit) procedures](https://docs.oracle.com/en/industries/hospitality/opera-cloud/24.3/ocsuh/c_endofday_incomeaudit_setting_up_end_of_day_procedures_and_reports_ch.htm)
- [Sea Digitalis — Hotel Systems Administrator interview Q&A](https://www.seadigitalis.com/en/hotel-systems-administrator-job-interview-questions-and-answers/)
- [Glassdoor — Oracle Technical Support Analyst (candidate-reported)](https://www.glassdoor.com/Interview/Oracle-Technical-Support-Analyst-Interview-Questions-EI_IE1737.0,6_KO7,32.htm)
- [Glassdoor — Oracle Customer Support Analyst (candidate-reported)](https://www.glassdoor.com/Interview/Oracle-Customer-Support-Analyst-Interview-Questions-EI_IE1737.0,6_KO7,31.htm)
- [GeeksforGeeks — Oracle Technical Analyst (Support) interview experience](https://www.geeksforgeeks.org/interview-experiences/oracle-interview-experience-for-technical-analyst-on-campus/)
- [Glassdoor — Technical support analyst: Windows Server, IIS, SQL (candidate-reported)](https://static.glassdoor.at/Interview/technical-support-analyst-interview-questions-SRCH_KO0,25_IP80.htm)
- [Glassdoor — Production support engineer: IIS, SQL Server (candidate-reported)](https://static.glassdoor.es/Interview/production-support-engineer-interview-questions-SRCH_KO0,27_IP12.htm)
- [Glassdoor — SQL support: duplicates, joins, group by (candidate-reported)](https://clear.glassdoor.nl/Interview/sql-support-interview-questions-SRCH_KO0,11_IP49.htm)
- [InterviewBit — Application support interview questions](https://interviewbit.com/application-support-interview-questions)
- [Sparktech — From logs to live incidents (application support)](https://buttondown.com/sparktechblog/archive/from-logs-to-live-incidents-application-support/)
- [Teal — Implementation consultant interview questions](https://tealhq.com/career-paths/implementation-consultant-interview-questions)
- [startup.jobs — Implementation Consultant questions](https://startup.jobs/interview-questions/implementation-consultant)
- [startup.jobs — Integrations Engineer questions](https://startup.jobs/interview-questions/integrations-engineer)
- [DataCamp — SQL interview questions](https://www.datacamp.com/blog/top-sql-interview-questions-and-answers-for-beginners-and-intermediate-practitioners)

### Web
- [Indeed — Technical support interview questions](https://www.indeed.com/hire/interview-questions/technical-support)
- [Indeed — IT support interview questions](https://www.indeed.com/hire/interview-questions/it-support)
- [Coursera — 8 IT Support Interview Questions](https://www.coursera.org/articles/it-support-interview-questions)
- [Scribd — Tech support interview questions](https://www.scribd.com/doc/124619889/Techsupport-Interview-Questionsw)
- [Glassdoor — Help desk support interview questions (candidate-reported)](https://static.glassdoor.de/Interview/help-desk-support-interview-questions-SRCH_KO0,17_IP376.htm)
- [Glassdoor — Help desk: DNS, DHCP (candidate-reported)](https://static.glassdoor.es/Interview/help-desk-interview-questions-SRCH_KO0,9_IP376.htm)
- [Glassdoor — Desktop support: DHCP, DNS, VLAN, AD (candidate-reported)](https://static.glassdoor.at/Interview/it-desktop-support-engineer-interview-questions-SRCH_KO0,27_IP19.htm)
- [Glassdoor — IT helpdesk "something not as planned" (candidate-reported)](https://static-pc.glassdoor.fr/Interview/helpdesk-it-interview-questions-SRCH_KO0,11_IP54.htm)
- [Glassdoor — Laptop can't print over Wi-Fi (candidate-reported)](https://static.glassdoor.de/Interview/help-interview-questions-SRCH_KO0,4_IP10.htm)
- [Glassdoor — Intercom Customer Support Engineer (candidate-reported)](https://static.glassdoor.ie/Interview/Intercom-Customer-Support-Engineer-Interview-Questions-EI_IE1035935.0,8_KO9,34.htm)
- [Glassdoor — Atlassian Technical Support Engineer (candidate-reported)](https://www2.glassdoor.com.au/Interview/Atlassian-Technical-Support-Engineer-Interview-Questions-EI_IE115699.0,9_KO10,36.htm)
- [Glassdoor — ServiceNow interview (candidate-reported)](https://www.glassdoor.ca/Interview/ServiceNow-Interview-E403326-RVW90265199.htm)
- [Glassdoor — Customer service: angry customer (candidate-reported)](https://clear.glassdoor.nl/Interview/customer-service-interview-questions-SRCH_KO0,16_IP13.htm)
- [Prepfully — Reddit Customer Service Representative questions](https://prepfully.com/interview-questions/reddit/customer-service-representative)
- [Jitbit — Helpdesk interview questions](https://www.jitbit.com/news/helpdesk-interview-questions/)
- [Adaface — Technical support interview questions](https://www.adaface.com/blog/technical-support-interview-questions/)
- [CourseCareers — Help desk interview questions](https://coursecareers.com/blog-posts/help-desk-interview-questions)
- [startup.jobs — Technical Support Engineer questions](https://startup.jobs/interview-questions/technical-support-engineer)
- [Guru99 — Application support interview questions](https://www.guru99.com/application-support-interview-questions.html)
- [The Muse — Customer service interview questions](https://themuse.com/advice/customer-service-interview-questions-answers-examples)
- [Naukri — Customer service interview questions](https://naukri.com/campus/career-guidance/customer-service-interview-questions)
- [4 Corner Resources — Dealing with an angry customer](https://www.4cornerresources.com/interview-questions/how-would-you-deal-with-an-angry-customer/)
- [Snagajob — Difficult customer question](https://www.snagajob.com/blog/post/tell-me-about-a-time-you-dealt-with-a-difficult-customer)
- [MockQuestions — Call center: angry customer](https://www.mockquestions.com/position/Call+Center/How-do-you-handle-an-angry-customer-3315282.html)
- [The Muse — How to answer "sell me this pen"](https://www.themuse.com/advice/how-to-answer-sell-me-this-pen)

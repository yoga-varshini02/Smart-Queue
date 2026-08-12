Problem Statement
1. Title
Smart Queue Management System
2. Domain
Queue Management / Web Application
3. Who is the user?
User: Book token, view queue position and waiting time.
Admin: Manage users, tokens and queues.
Staff: Call and process tokens.
4. What problem are we solving?
Traditional queues cause long waiting times, overcrowding and confusion. Users cannot easily know their position or expected waiting time.
5. Proposed Solution
A web-based system that allows users to book tokens online, track queue position and estimated waiting time, while admins and staff manage the queue digitally.
6. Core Entities / Database Tables
USER, ADMIN, STAFF, TOKEN, QUEUE, NOTIFICATION
7. User Roles & Permissions
Admin: Full system management
Staff: Manage and process queue
User: Book and track tokens
8. Success Criteria
User should be able to book a token in under 1 minute and track their queue status easily.
9. Out of Scope
Hardware token machines, biometric systems and online payments.
10. Chosen Track
Java – Spring Boot + MySQL
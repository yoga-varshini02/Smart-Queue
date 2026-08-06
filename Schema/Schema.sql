-- Create Database
CREATE DATABASE SmartQueueDB;

-- Use Database
USE SmartQueueDB;

-- Admin Table
CREATE TABLE Admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    phone VARCHAR(15)
);

-- Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    ration_card_no VARCHAR(30) UNIQUE NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    family_members INT,
    address VARCHAR(255)
);

-- Queue Table
CREATE TABLE Queue (
    queue_id INT PRIMARY KEY AUTO_INCREMENT,
    queue_date DATE NOT NULL,
    time_slot VARCHAR(30),
    total_tokens INT,
    available_tokens INT
);

-- Tokens Table
CREATE TABLE Tokens (
    token_id INT PRIMARY KEY AUTO_INCREMENT,
    token_number INT NOT NULL,
    issue_date DATE,
    status VARCHAR(20),
    user_id INT,
    queue_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (queue_id) REFERENCES Queue(queue_id)
);

INSERT INTO Admin (admin_name, username, password, phone)
VALUES
('Ramesh Kumar', 'admin1', 'admin123', '9876543210'),
('Priya Devi', 'admin2', 'admin456', '9123456789');

INSERT INTO Users (ration_card_no, user_name, phone, family_members, address)
VALUES
('TN100001', 'Arun Kumar', '9876500001', 4, 'Anna Nagar, Chennai'),
('TN100002', 'Meena', '9876500002', 5, 'KK Nagar, Chennai'),
('TN100003', 'Suresh', '9876500003', 3, 'Thillai Nagar, Trichy'),
('TN100004', 'Kavya', '9876500004', 6, 'T Nagar, Chennai'),
('TN100005', 'Rahul', '9876500005', 2, 'Srirangam, Trichy');

INSERT INTO Queue (queue_date, time_slot, total_tokens, available_tokens)
VALUES
('2026-08-06', '09:00 AM - 10:00 AM', 50, 45),
('2026-08-06', '10:00 AM - 11:00 AM', 50, 47),
('2026-08-07', '09:00 AM - 10:00 AM', 50, 50);

INSERT INTO Tokens (token_number, issue_date, status, user_id, queue_id)
VALUES
(1, '2026-08-06', 'Completed', 1, 1),
(2, '2026-08-06', 'Waiting', 2, 1),
(3, '2026-08-06', 'Serving', 3, 2),
(4, '2026-08-06', 'Waiting', 4, 2),
(5, '2026-08-07', 'Waiting', 5, 3);

SELECT * FROM Admin;
SELECT * FROM Users;
SELECT * FROM Queue;
SELECT * FROM Tokens;
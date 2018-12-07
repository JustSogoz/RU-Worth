CREATE SCHEMA ru-worth DEFAULT CHARACTER SET utf8;

CREATE TABLE user (
username VARCHAR(45) NOT NULL,
name VARCHAR(45) NOT NULL,
email VARCHAR(45) NOT NULL,
PRIMARY KEY(username)
);

CREATE TABLE textbook (
ISBN INT(10) NOT NULL,
FOREIGN KEY courseid REFERENCES course.courseid ,
bookname VARCHAR(150),
PRIMARY KEY(ISBN)
);

CREATE TABLE course (
courseid VARCHAR(10) NOT NULL,
professor VARCHAR(50),
PRIMARY KEY(courseid)
);

CREATE TABLE reviews (
reviewid INT AUTO_INCREMENT,
FOREIGN KEY ISBN REFERENCES textbook.ISBN,
FOREIGN KEY username REFERENCES user.username,
effectrating VARCHAR(150),
recommend TINYINT(1),
description VARCHAR(250),
PRIMARY KEY(reviewid)
);
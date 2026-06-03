-- add image column in users table
alter table users add column `image` varchar(255) default null after last_name;
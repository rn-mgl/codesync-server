create table cody_chat (
	id int unsigned primary key not null auto_increment,
    user_id int unsigned not null,
    interaction varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    
    foreign key (user_id) references users(id) on delete cascade,
    index idx_user_id (user_id),
    index idx_interaction (interaction)
);
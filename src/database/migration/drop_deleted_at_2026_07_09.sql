alter table achievements drop column deleted_at;

alter table attempts drop column deleted_at;

alter table chat_messages drop column deleted_at;

alter table code_snapshots drop column deleted_at;

alter table friendships drop column deleted_at;

alter table hints drop column deleted_at;

alter table problems drop column deleted_at;

alter table session_participants drop column deleted_at;

alter table `sessions` drop column deleted_at;

alter table study_groups drop column deleted_at;

alter table test_cases drop column deleted_at;

alter table topics drop column deleted_at;

alter table user_progress drop column deleted_at;

alter table users drop column deleted_at;

alter table problem_topics drop column deleted_at;

alter table user_achievements drop column deleted_at;

alter table study_group_members drop column deleted_at;
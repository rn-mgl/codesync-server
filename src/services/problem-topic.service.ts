import type {
  BaseProblemTopicData,
  SoftDeleteProblemTopicPayload,
  UpdateProblemTopicPayload,
} from "@src/interface/problem-topic.interface";
import type { BaseTopicData } from "@src/interface/topic.interface";
import ProblemTopic from "@src/models/problem-topic.model";
import Topic from "@src/models/topic.model";
import { DateTime } from "luxon";

export async function syncProblemTopic(problemId: number, topics: string[]) {
  const problemTopics = (await ProblemTopic.findByProblem(
    problemId,
  )) as BaseProblemTopicData[];

  // pivot problem-topic, keyed by {topic_id : primary_key}
  const pivotTopics = Object.fromEntries(
    problemTopics.map((pt) => [
      pt.topic_id,
      { id: pt.id, deleted_at: pt.deleted_at },
    ]),
  );

  const topicsBySlug = topics?.length
    ? ((await Topic.findBySlugs(topics)) as BaseTopicData[])
    : [];

  // selected topics, ids only
  const selectedTopics = topicsBySlug.map((topic) => topic.id);

  // check if each pivot topics is not in selected
  const topicsToDelete = Object.entries(pivotTopics)
    .filter(
      ([topic, data]) =>
        !selectedTopics.includes(Number(topic)) && data.deleted_at === null,
    )
    .map((data) => data[1].id);

  const deletePayload: SoftDeleteProblemTopicPayload = {
    deleted_at: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
  };

  let deleted = 0;
  let updated = 0;
  let created = 0;

  if (topicsToDelete.length) {
    deleted = (await ProblemTopic.destroy(topicsToDelete, deletePayload))
      .affectedRows;
  }

  // check if each pivot topics is in selected but is deleted in db
  const topicsToRecover = Object.entries(pivotTopics)
    .filter(
      ([topic, data]) =>
        selectedTopics.includes(Number(topic)) && data.deleted_at !== null,
    )
    .map((data) => data[1].id);

  const recoverPayload: UpdateProblemTopicPayload = {
    deleted_at: null,
  };

  if (topicsToRecover.length) {
    updated = (await ProblemTopic.update(topicsToRecover, recoverPayload))
      .affectedRows; //logic to undelete pivot rows using topicsToRecover;
  }

  // check if each selected topic is not yet in pivot
  const topicsToAdd = selectedTopics
    .filter((topic) => !pivotTopics[String(topic)])
    .map((topic) => ({ problem_id: problemId, topic_id: topic }));

  if (topicsToAdd.length) {
    created = (await ProblemTopic.create(topicsToAdd)).affectedRows;
  }

  return { deleted, updated, created };
}

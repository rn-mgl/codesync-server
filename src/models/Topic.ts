import type { FullTopicData } from "@src/interface/topic-interface";

class Topic implements FullTopicData {
  name: string;
  description: string;
  slug: string;
  icon: string;

  constructor(data: FullTopicData) {
    this.name = data.name;
    this.description = data.description;
    this.slug = data.slug;
    this.icon = data.icon;
  }

  static async create() {
    try {
    } catch (error) {}
  }

  static async findById() {
    try {
    } catch (error) {}
  }

  static async findBySlug() {
    try {
    } catch (error) {}
  }

  static async all() {
    try {
    } catch (error) {}
  }

  static async update() {
    try {
    } catch (error) {}
  }
}

export default Topic;

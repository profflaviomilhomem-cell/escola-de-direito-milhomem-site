/**
 * @deprecated Importe tipos de `@/lib/course/types` e helpers de `@/lib/course/format`.
 * Mantido só para compatibilidade de imports antigos.
 */
export type {
  Announcement,
  Course,
  CourseLesson,
  CourseModule,
  ForumComment,
  ForumThread,
  LessonStatus,
  MockAnnouncement,
  MockComment,
  MockCourse,
  MockForumThread,
  MockLesson,
  MockLessonStatus,
  MockModule,
} from "@/lib/course/types";

export { formatDuration, initialsFromName } from "@/lib/course/format";

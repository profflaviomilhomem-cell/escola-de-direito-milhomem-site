/** Status de consumo de uma aula na área do aluno. */
export type LessonStatus = "concluida" | "em-andamento" | "nao-iniciada";

export type CourseLesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationSec: number;
  position: number;
  moduleSlug: string;
  moduleTitle: string;
  status: LessonStatus;
  watchedSec: number;
  cover: { from: string; to: string; angle?: number };
  summary: string;
  keyPoints: string[];
  materials: { title: string; pages: number; sizeKb: number }[];
  videoSrc?: string;
  /** Cloudflare Stream UID (preferido sobre videoSrc quando presente). */
  videoId?: string;
  posterSrc?: string;
  slidesSrc?: string;
};

export type CourseModule = {
  slug: string;
  title: string;
  subtitle: string;
  lessons: CourseLesson[];
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  cover: { from: string; via?: string; to: string; angle?: number };
  coverImageSrc?: string;
  modules: CourseModule[];
  lessonCount: number;
  completedLessonCount: number;
  catalogLabel?: string;
};

export type ForumComment = {
  id: string;
  author: { name: string; role: "aluno" | "professor" | "monitor" };
  createdAt: string;
  content: string;
  replies?: ForumComment[];
};

export type ForumThread = {
  id: string;
  slug: string;
  title: string;
  body: string;
  lessonSlug?: string;
  createdAt: string;
  author: { name: string; role: ForumComment["author"]["role"] };
  replyCount: number;
  professorReplied: boolean;
  comments: ForumComment[];
};

export type Announcement = {
  id: string;
  publishedAt: string;
  eyebrow: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
};

/** Aliases legados — migração gradual dos imports `Mock*`. */
export type MockLessonStatus = LessonStatus;
export type MockLesson = CourseLesson;
export type MockCourse = Course;
export type MockComment = ForumComment;

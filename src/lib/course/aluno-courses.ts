import type { Course, CourseLesson } from "@/lib/course/types";
import { provasDigitaisCourse } from "@/data/provas-digitais-course";

/** Cursos matriculados (conteúdo real importado / futuro Prisma). */
export const enrolledCourses: Course[] = [provasDigitaisCourse];

export const primaryCourse = enrolledCourses[0]!;

/** @deprecated Use `primaryCourse`. */
export const mockCourse = primaryCourse;

export function findLessonBySlug(slug: string): CourseLesson | null {
  return findLessonWithCourse(slug)?.lesson ?? null;
}

export function nextLesson(): CourseLesson | null {
  return nextLessonAcrossCourses();
}

export function findCourseBySlug(slug: string): Course | null {
  return enrolledCourses.find((c) => c.slug === slug) ?? null;
}

export function findLessonWithCourse(
  lessonSlug: string,
): { lesson: CourseLesson; course: Course } | null {
  for (const course of enrolledCourses) {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
      if (lesson) return { lesson, course };
    }
  }
  return null;
}

export function nextLessonInCourse(course: Course): CourseLesson | null {
  for (const mod of course.modules) {
    const inProgress = mod.lessons.find((l) => l.status === "em-andamento");
    if (inProgress) return inProgress;
  }
  for (const mod of course.modules) {
    const notStarted = mod.lessons.find((l) => l.status === "nao-iniciada");
    if (notStarted) return notStarted;
  }
  return null;
}

export function nextLessonAcrossCourses(
  courses: Course[] = enrolledCourses,
): CourseLesson | null {
  for (const course of courses) {
    const lesson = nextLessonInCourse(course);
    if (lesson) return lesson;
  }
  return null;
}

export function flattenCourseLessons(courses: Course[]): CourseLesson[] {
  return courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
}

export function courseCatalogLabel(course: Course): string {
  return course.catalogLabel ?? "Curso gravado";
}

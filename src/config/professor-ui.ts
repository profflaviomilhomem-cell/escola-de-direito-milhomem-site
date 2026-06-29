import { copy } from "@/config/copy";

/** Dados estáticos de UI do professor (avatar, título) — sem métricas ou listas mockadas. */
export const professorUi = {
  avatarSrc: "/images/professor/flavio-avatar-64.jpg",
  portraitSrc: "/images/professor/flavio-portrait.png",
  title: copy.professor.bioRoleLine,
  defaultName: copy.professor.fullName,
} as const;

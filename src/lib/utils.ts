import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Candidate, OpenRole } from "./eventiq/mockData";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface RoleMatch {
  roleId: string;
  roleTitle: string;
  score: number;
}

export function matchScore(candidate: Candidate, roles: OpenRole[]): RoleMatch[] {
  return roles
    .map((role) => {
      const matches = candidate.skills.filter((s) => role.skills.includes(s)).length;
      const score = Math.round((matches / role.skills.length) * 100);
      return { roleId: role.id, roleTitle: role.title, score };
    })
    .sort((a, b) => b.score - a.score);
}

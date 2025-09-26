import { writable } from "svelte/store";

export type IconSet = "affinity" | "crayon";
export const iconSet = writable<IconSet>("affinity");
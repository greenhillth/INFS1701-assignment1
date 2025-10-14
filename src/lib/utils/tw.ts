type ClassDictionary = Record<string, boolean | null | undefined>;

export type ClassValue =
  | string
  | false
  | null
  | undefined
  | ClassDictionary
  | ClassValue[];

/**
 * Lightweight class name combiner that mirrors the common clsx signature
 * without adding a dependency.
 */
export function tw(...values: ClassValue[]): string {
  const classes: string[] = [];

  const visit = (value: ClassValue): void => {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item);
      }
      return;
    }

    if (typeof value === 'object') {
      for (const [key, enabled] of Object.entries(value)) {
        if (enabled) {
          classes.push(key);
        }
      }
      return;
    }

    classes.push(value);
  };

  for (const value of values) {
    visit(value);
  }

  return classes.join(' ');
}

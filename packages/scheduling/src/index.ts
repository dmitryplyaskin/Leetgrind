export interface ReviewState {
  repetitions: number;
  intervalDays: number;
  easinessFactor: number;
  dueAt: Date;
}

export function scheduleSm2Review(previous: ReviewState | undefined, quality: number): ReviewState {
  const boundedQuality = Math.max(0, Math.min(5, quality));
  const last = previous ?? {
    repetitions: 0,
    intervalDays: 0,
    easinessFactor: 2.5,
    dueAt: new Date()
  };

  if (boundedQuality < 3) {
    return {
      repetitions: 0,
      intervalDays: 1,
      easinessFactor: last.easinessFactor,
      dueAt: addDays(new Date(), 1)
    };
  }

  const repetitions = last.repetitions + 1;
  const intervalDays =
    repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.round(last.intervalDays * last.easinessFactor);
  const easinessFactor = Math.max(
    1.3,
    last.easinessFactor + (0.1 - (5 - boundedQuality) * (0.08 + (5 - boundedQuality) * 0.02))
  );

  return {
    repetitions,
    intervalDays,
    easinessFactor,
    dueAt: addDays(new Date(), intervalDays)
  };
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}


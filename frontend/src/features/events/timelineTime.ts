export function activityDuration(start: string, end?: string | null) {
  const valid = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!valid.test(start) || !end || !valid.test(end)) return null;
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  return minutes(end) - minutes(start);
}

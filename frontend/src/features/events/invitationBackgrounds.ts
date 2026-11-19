export type InvitationBackgroundTemplate = `f${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

export const backgroundTemplates = Array.from({ length: 12 }, (_, index) => ({
  id: `f${index + 1}` as InvitationBackgroundTemplate,
  image: `/images/f${index + 1}.jpeg`,
}));

export const backgroundTemplateImage = (template?: InvitationBackgroundTemplate | null) =>
  backgroundTemplates.find(({ id }) => id === template)?.image || null;

export default async (column, query, controller) => {
  if (query) return controller.model().select('*', `WHERE ${column}='${query}'`);
  return false;
};

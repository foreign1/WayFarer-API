export default async (query, controller) => {
  if (query) return controller.model().select('*', `WHERE destination='${query}'`);
  return false;
};

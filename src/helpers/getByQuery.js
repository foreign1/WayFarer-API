export default async (column, query, controller, queryData = '*') => {
  try {
    if (query) return controller.model().select(queryData, `WHERE ${column}='${query}'`);
    return false;
  } catch (ex) {
    return ex;
  }
};

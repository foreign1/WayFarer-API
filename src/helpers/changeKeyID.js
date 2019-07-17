export default (key, data) => data.map((d) => {
  const { id, ...rest } = d;
  return {
    [key]: id,
    ...rest,
  };
});

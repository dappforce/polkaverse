export const createFieldNameFn =
  <T>() =>
  (name: keyof T) =>
    name

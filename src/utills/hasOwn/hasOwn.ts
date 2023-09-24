export const hasOwn = (object: object, property: string) =>
  Object.prototype.hasOwnProperty.call(object, property);

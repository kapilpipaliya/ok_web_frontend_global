function isObject(value: any): boolean {
  // Check if the value is not null and its type is 'object'
  return value !== null && typeof value === 'object';
}


export const getTextColumnValue = (value: any) => {
  if (value === true) {
    return "True";
  } else if (value === false) {
    return "False";
  }
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    const values = [];
    for (const v of value) {
      values.push(getTextColumnValue(v));
    }
    value = values.join(", ");
  }

  return isObject(value) ? JSON.stringify(value) : value;
};

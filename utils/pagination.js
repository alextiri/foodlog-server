const parseNumberQueryParam = (param, defaultValue, errorMessage) => {
  if (param === undefined) {
    return defaultValue;
  }

  const parsedParam = parseInt(param);
  if (Number.isNaN(parsedParam)) {
    return errorMessage;
  }

  return parsedParam;
};

const parsePagination = (pageSize, pageOffset) => {
  const limit = parseNumberQueryParam(pageSize, 5, "Invalid page size");
  const offset = parseNumberQueryParam(pageOffset, 0, "Invalid page offset");
  if (typeof limit === "string") {
    return limit;
  }
  if (typeof offset === "string") {
    return offset;
  }
  if (limit < 0) {
    return "Minimum page size 1";
  }

  if (limit > 50) {
    return "Page size too big";
  }

  if (offset < 0) {
    return "Minimum offset 0";
  }

  return { limit: limit, offset: offset };
};

module.exports = { parsePagination };

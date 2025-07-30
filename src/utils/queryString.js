const queryString = {
  stringify: (params) => {
    return Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  },
  parse: (query) => {
    return query
      .substring(1)
      .split('&')
      .reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        acc[decodeURIComponent(key)] = decodeURIComponent(value);
        return acc;
      }, {});
  },
};

export default queryString;

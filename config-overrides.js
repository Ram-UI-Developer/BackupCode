module.exports = function override(config) {
  config.ignoreWarnings = [
    {
      module: /antd\.css/,
      message: /Failed to parse source map/,
    },
  ];
  return config;
};

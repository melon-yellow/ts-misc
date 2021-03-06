module.exports = {
  presets: ["next/babel"],
  plugins: [
    "@babel/plugin-syntax-dynamic-import",
    ["styled-components", { "ssr": true }],
    "inline-react-svg"
  ]
};

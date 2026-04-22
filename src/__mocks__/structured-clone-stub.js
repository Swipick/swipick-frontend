// Stub for @ungap/structured-clone — use the built-in Node.js structuredClone
module.exports = {
  default: typeof structuredClone !== 'undefined' ? structuredClone : (v) => JSON.parse(JSON.stringify(v)),
};

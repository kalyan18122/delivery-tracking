const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'data', 'deliveries.js');

// Read data from the JS file (clear require cache so we always get fresh data)
function readAll() {
  delete require.cache[require.resolve(FILE)];
  return require(FILE);
}

// Write data back into the JS file
function writeAll(data) {
  fs.writeFileSync(FILE, 'module.exports = ' + JSON.stringify(data, null, 2) + ';\n');
}

module.exports = { readAll, writeAll };

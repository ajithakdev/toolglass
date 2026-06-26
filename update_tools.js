/* eslint-disable */
const fs = require('fs');
const glob = require('glob'); // Note: we can use standard fs.readdir since it's nested
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    }
    next();
  });
}

walk('./src/tools', (err, results) => {
  if (err) throw err;
  results.filter(f => f.endsWith('Tool.tsx')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<ToolLayout[^>]*>/, '<ToolLayout>');
    fs.writeFileSync(file, content);
  });
});

// Use require.context to require reducers automatically 自动地
// Ref: https://webpack.github.io/docs/context.html
const context = require.context('./', false, /\.js$/);
const keys = context.keys().filter(item => item !== './index.js');

console.log("---models/index.js中 keys---",keys );
const models = [];
for (let i = 0; i < keys.length; i += 1) {
  models.push(context(keys[i]));
}

export default models;


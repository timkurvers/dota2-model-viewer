// Poor man's KeyValues parser by abusing similarities to JSON
// See: https://developer.valvesoftware.com/wiki/KeyValues
export default (kv, reviver = undefined) => {
  // Wrap entire contents in curly braces emulating a top-level JSON object
  let json = `{\n${kv}}`;

  // Escape backslashes
  json = json.replace(/\\/g, '\\\\');
  json = json.replace(/"([^"]+)\t([^"]+)"/gm, '"$1 $2"');

  // Insert colons for nested objects and properties
  json = json.replace(/\s+{/gm, ': {');
  json = json.replace(/"\t+"/g, '": "');

  // Insert trailing commas after property values
  json = json.replace(/"(\s+)"/gm, '",$1"');
  json = json.replace(/}(\s+)"/gm, '},$1"');

  return JSON.parse(json, reviver);
};

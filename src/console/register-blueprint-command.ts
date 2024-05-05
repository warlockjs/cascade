import { isPlainObject } from "@mongez/supportive-is";
import { Blueprint } from "../blueprint/blueprint";

export function parseBlueprint(data: any) {
  const schema: any = {};
  for (const column in data) {
    let columnType = data[column];

    // check first if the column type is typeof Blueprint as columnType will be the class itself
    // not the object of Blueprint

    if (columnType.prototype instanceof Blueprint) {
      columnType = parseBlueprint(columnType.schema);
    } else if (isPlainObject(columnType)) {
      columnType = parseBlueprint(columnType);
    } else if (typeof columnType !== "string" && !isPlainObject(columnType)) {
      columnType = columnType.name;
    }

    schema[column] = columnType;
  }

  return schema;
}

import type { GenericObject } from "@mongez/reinforcements";
import { parsePipelines } from "./parsePipelines";
import { Pipeline } from "./pipeline";

export type LookupPipelineOptions = {
  from: string;
  localField?: string;
  foreignField?: string;
  as?: string;
  single?: boolean;
  pipeline?: (Pipeline | GenericObject)[];
  let?: GenericObject;
};

export class LookupPipeline extends Pipeline {
  /**
   * Constructor
   */
  public constructor(options: LookupPipelineOptions) {
    super("lookup");

    const { from, localField, foreignField, as, pipeline = [] } = options;

    this.data({
      from,
      localField,
      foreignField,
      as,
      pipeline: parsePipelines(pipeline),
    });
  }
}

export function lookupPipeline(options: LookupPipelineOptions) {
  return new LookupPipeline(options);
}

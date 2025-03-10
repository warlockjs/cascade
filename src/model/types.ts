import type { Faker } from "@faker-js/faker";
import type { ObjectId, WithId } from "mongodb";
import type { Model } from "./model";

/**
 * Primary id type
 */
export type PrimaryIdType = string | number | ObjectId;

/**
 * Base model to be extended with Child Models
 */
export type ChildModel<T> = typeof Model & (new () => T);

/**
 * Factory creator callback
 */
export type FactoryCreatorCallback = (faker: Faker, index: number) => Document;

/**
 * Find or create options
 */
export type FindOrCreateOptions = {
  /**
   * Merge the filter data with the created data
   * @default true
   */
  merge?: boolean;
};

/**
 * Model delete strategy
 *
 * @default moveToTrash
 */
export enum ModelDeleteStrategy {
  "softDelete",
  "moveToTrash",
  "hardDelete",
}

export type PaginationInfo = {
  /**
   * Limit of the query
   */
  limit: number;
  /**
   * Results of the query
   */
  result: number;
  /**
   * Current page of the query
   */
  page: number;
  /**
   * total results of the query
   */
  total: number;
  /**
   * total pages of the query
   */
  pages: number;
};

/**
 * The result of the paginate query
 */
export type PaginationListing<T> = {
  /**
   * Results of the query
   */
  documents: T[];
  /**
   * The pagination results
   */
  paginationInfo: PaginationInfo;
};

/**
 * Cursor Pagination
 */
export type CursorPagination = {
  /**
   * Cursor column
   *
   * @default id
   */
  column?: string;
  /**
   * The cursor id
   */
  cursorId?: string | number;
  /**
   * The cursor direction
   */
  direction: "next" | "prev";
  /**
   * The cursor limit
   */
  limit: number;
};

/**
 * Cursor pagination result
 */
export type CursorPaginationResults<T> = {
  /**
   * The documents
   */
  documents: T[];
  /**
   * Whether there is more documents
   */
  hasMore: boolean;
  /**
   * The next cursor id
   */
  nextCursorId?: string | number;
};

/**
 * Filter object
 */
export type Filter = Record<string, any>;

/**
 * Document data will be used in insertion, updates or replace
 */
export type Document = Record<string, any>;

/**
 * Model Document that contains the model with both mongodb _id and our custom id
 */
export type ModelDocument = WithId<{
  /**
   * Auto Increment id
   */
  id?: number;
  /**
   * Dynamic columns
   */
  [key: string]: any;
}>;

export type WithTimestampsDocument<T> = ModelDocument &
  T & {
    createdAt?: Date;
    updatedAt?: Date;
  };

export type CustomCastType = (value: any, column: string, model: Model) => any;

/**
 * Custom casts
 */
export type CustomCasts<T extends string = string> = Record<
  T,
  (model: Model, column: string) => any | Promise<any>
>;

type EnumType<T extends Record<string, string | number>> = T[keyof T];

type EnumColumn = EnumType<any>;

export type EmbeddedModel = {
  model: typeof Model;
  embedKey?: string;
};

export type CascadeOnDelete = "unset" | "remove" | "ignore";

export type CastType =
  | "string"
  | "localized"
  | "number"
  | "int"
  | "float"
  | "integer"
  | "bool"
  | "object"
  | "array"
  | "date"
  | "location"
  | "boolean"
  | "any"
  | "mixed"
  | CustomCastType
  | [CustomCastType]
  | EnumColumn
  // also it supports enum
  | typeof Model
  | EmbeddedModel;

export type Casts = {
  [column: string]: CastType;
};

export type ChunkCallback<T> = (
  documents: T[],
  paginationInfo: PaginationListing<T>["paginationInfo"],
) => false | any | Promise<false | any>;

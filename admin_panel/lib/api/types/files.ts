import type { IsoTimestamp, PaginationParams, Uuid } from "./common";

export type FileMetadata = {
  id: Uuid;
  owner_id: Uuid;
  filename: string;
  content_type: string;
  size_bytes: number;
  created_at: IsoTimestamp;
};

export type FileListParams = PaginationParams;

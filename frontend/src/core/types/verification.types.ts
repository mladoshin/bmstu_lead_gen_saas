export interface BulkVerifyRequest {
  selectionId: string;
}

export interface BulkVerifyResponse {
  processed: number;
  verified: number;
}

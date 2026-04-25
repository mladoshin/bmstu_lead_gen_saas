export interface GenerateEmailsRequest {
  selectionId: string;
}

export interface EmailGenerationResponse {
  processed: number;
  updated: number;
  selectionId: string;
}

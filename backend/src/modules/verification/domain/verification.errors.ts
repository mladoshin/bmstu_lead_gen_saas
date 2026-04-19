export class ContactNotFoundError extends Error {
  constructor(contactId: string) {
    super(`Contact not found: ${contactId}`);
    this.name = 'ContactNotFoundError';
  }
}

export class ContactAccessDeniedError extends Error {
  constructor() {
    super('Access denied');
    this.name = 'ContactAccessDeniedError';
  }
}

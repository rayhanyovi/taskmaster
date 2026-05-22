export interface MockApiError {
  message: string
  status: number
}

export class MockHttpError extends Error {
  status: number

  constructor({ message, status }: MockApiError) {
    super(message)
    this.name = 'MockHttpError'
    this.status = status
  }
}

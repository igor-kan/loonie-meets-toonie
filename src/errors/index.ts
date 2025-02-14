export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public status: number = 500
    ) {
        super(message);
    }
}

export class ErrorHandler {
    static handle(error: Error): void {
        if (error instanceof AppError) {
            // Handle known application errors
        } else {
            // Handle unexpected errors
        }
    }
} 
export const api = {
    async fetch(url: string, options?: RequestInit) {
        // Shared API handling
    }
};

export const ui = {
    showLoading(element: HTMLElement, show: boolean) {
        // Shared loading state handling
    },
    showError(container: HTMLElement, message: string, retryFn?: () => void) {
        // Shared error handling
    }
}; 
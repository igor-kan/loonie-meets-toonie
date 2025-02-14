export class ServiceContainer {
    private static instance: ServiceContainer;
    private services: Map<string, any> = new Map();

    static getInstance(): ServiceContainer {
        if (!ServiceContainer.instance) {
            ServiceContainer.instance = new ServiceContainer();
        }
        return ServiceContainer.instance;
    }

    register<T>(key: string, service: T): void {
        this.services.set(key, service);
    }

    get<T>(key: string): T {
        return this.services.get(key);
    }
} 
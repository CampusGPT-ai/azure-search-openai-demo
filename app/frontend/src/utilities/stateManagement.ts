// Define a generic function to store data in local storage
export function setLocalStorage<T>(key: string, data: T): void {
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
    } catch (error) {
        console.error("Error storing data in local storage:", error);
    }
}

// Define a generic function to retrieve data from local storage
export function getLocalStorage<T>(key: string): T | null {
    try {
        const serializedData = localStorage.getItem(key);
        if (serializedData === null) {
            return null;
        }
        return JSON.parse(serializedData);
    } catch (error) {
        console.error("Error retrieving data from local storage:", error);
        return null;
    }
}

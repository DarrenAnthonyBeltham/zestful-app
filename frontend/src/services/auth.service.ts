export const authService = {
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role'); 
        window.location.href = '/login';
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    },
    
    getRole: (): string | null => {
        return localStorage.getItem('role');
    },

    isLoggedIn: (): boolean => {
        const token = localStorage.getItem('token');
        return !!token;
    },
    
    isAdmin: (): boolean => {
        return localStorage.getItem('role') === 'ADMIN';
    },

    getAuthHeader: (): { Authorization?: string } => {
        const token = localStorage.getItem('token');
        if (token) {
            return { 'Authorization': 'Bearer ' + token };
        } else {
            return {};
        }
    },

    fetchWithAuth: async (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('token');
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
            throw new Error("Session expired");
        }

        return response;
    }
};
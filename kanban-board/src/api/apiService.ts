//Class with all the API available

class ApiService{
    private baseURL = 'http://localhost:5000/api';

    private getAuthHeaders(token: string | null){
        return{
            'Content-Type': 'application/json',
            ...(token && {Authorization: `Bearer ${token}`}) 
        }
    }

    async request(endpoint: string, options: RequestInit = {}, token: string | null = null) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
        ...this.getAuthHeaders(token),
        ...options.headers}})

        if(!response.ok){
            const error = await response.json()
            throw new Error(error.message || 'Request Failed')
        }
        return response.json()
    }

    //endpoints for the api
    
    // User authentication endpoints
    async login(email: string, password: string){
        return this.request('/auth/login',{
            method: 'POST',
            body: JSON.stringify({email,password})
        });
    }

    async register(name:string, email: string, password:string){
        return this.request('/auth/register',{
            method: "POST",
            body: JSON.stringify({name,email,password})
        })
    }

    async getProfile(token: string | null){
        return this.request('/auth/profile',{
            method: "GET"
        }, token)
    }


    // Board endpoints
    async getBoard(token: string | null){
        return this.request('/boards/',{
            method: "GET"
        },token)
    }

    async updateBoard(name:string | undefined, token: string | null){
        return this.request('/boards/',{
            method: "POST",
            body: JSON.stringify({name})
        },token)
    }

    //Column endpoints
    async createColumn(title: string, token: string | null){
        return this.request('/columns/',{
            method: "POST",
            body: JSON.stringify({title})
        },token)
    }

    async updateColumn(id: string ,title: string, token: string | null){
        return this.request(`/columns/${id}`,{
            method: "PUT",
            body: JSON.stringify({title})
        },token)
    }

    async deleteColumn(id: string, token: string | null){
        return this.request(`/columns/${id}`,{
            method: 'DELETE',
        }, token)
    }

    //card endpoints
    async createCard(title: string, columnId: string,token: string | null, description?: string, color?: string) {
        return this.request('/cards/', {
        method: 'POST',
        body: JSON.stringify({ title, columnId, description, color })
        }, token);
    }

    async updateCard(id: string, title: string,token: string | null, description?: string, color?: string) {
        return this.request(`/cards/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, description, color })
        }, token);
    }

    async deleteCard(id: string, token: string | null) {
        return this.request(`/cards/${id}`, {
        method: 'DELETE'
        }, token);
    }

    async moveCard(id: string, targetColumnId: string, targetPosition: number, token: string | null) {
        return this.request(`/cards/${id}/move`, {
        method: 'PUT',
        body: JSON.stringify({ targetColumnId, targetPosition })
        }, token);
    }
}

const api = new ApiService();

export default api
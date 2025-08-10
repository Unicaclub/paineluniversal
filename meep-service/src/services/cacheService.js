const Redis = require('redis');

class CacheService {
    constructor() {
        this.client = null;
        this.connected = false;
    }

    async connect() {
        try {
            this.client = Redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD
            });

            await this.client.connect();
            this.connected = true;
            console.log('✅ Redis conectado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao conectar Redis:', error);
            this.connected = false;
        }
    }

    async get(key) {
        if (!this.connected) return null;
        
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Erro ao buscar cache:', error);
            return null;
        }
    }

    async set(key, value, ttl = 3600) {
        if (!this.connected) return false;
        
        try {
            await this.client.setEx(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Erro ao salvar cache:', error);
            return false;
        }
    }

    async del(key) {
        if (!this.connected) return false;
        
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Erro ao deletar cache:', error);
            return false;
        }
    }

    async flush() {
        if (!this.connected) return false;
        
        try {
            await this.client.flushAll();
            return true;
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
            return false;
        }
    }
}

module.exports = new CacheService();

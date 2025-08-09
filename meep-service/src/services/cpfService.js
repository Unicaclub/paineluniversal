const axios = require('axios');
const Redis = require('redis');
const crypto = require('crypto');

class CPFValidationService {
    constructor() {
        this.redis = Redis.createClient(process.env.REDIS_URL);
        this.apiReceitaURL = process.env.API_RECEITA_FEDERAL_URL;
        this.apiToken = process.env.API_RECEITA_TOKEN;
        this.cacheExpiry = 24 * 60 * 60;
    }

    validateCPFDigits(cpf) {
        const cleanCPF = cpf.replace(/\D/g, '');
        
        if (cleanCPF.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF[i]) * (10 - i);
        }
        let remainder = sum % 11;
        let digit1 = remainder < 2 ? 0 : 11 - remainder;
        
        if (parseInt(cleanCPF[9]) !== digit1) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF[i]) * (11 - i);
        }
        remainder = sum % 11;
        let digit2 = remainder < 2 ? 0 : 11 - remainder;
        
        return parseInt(cleanCPF[10]) === digit2;
    }

    generateCPFHash(cpf) {
        return crypto.createHash('sha256')
            .update(cpf + process.env.CPF_SALT)
            .digest('hex');
    }

    async queryReceitaFederal(cpf) {
        try {
            const cleanCPF = cpf.replace(/\D/g, '');
            
            const apis = [
                {
                    url: `${this.apiReceitaURL}/cpf/${cleanCPF}`,
                    headers: {
                        'Authorization': `Bearer ${this.apiToken}`,
                        'Content-Type': 'application/json'
                    }
                },
                {
                    url: `https://api.brasileiraapi.com.br/api/cpf/v1/${cleanCPF}`,
                    headers: {}
                }
            ];

            for (const api of apis) {
                try {
                    const response = await axios.get(api.url, {
                        headers: api.headers,
                        timeout: 10000,
                        validateStatus: (status) => status === 200
                    });

                    if (response.data && response.data.nome) {
                        return this.normalizeAPIData(response.data, api.url);
                    }
                } catch (error) {
                    console.warn(`API ${api.url} failed:`, error.message);
                    continue;
                }
            }

            throw new Error('All CPF query APIs failed');

        } catch (error) {
            console.error('Error querying Receita Federal:', error);
            throw error;
        }
    }

    normalizeAPIData(data, apiUrl) {
        let normalized = {};

        if (apiUrl.includes('brasileiraapi')) {
            normalized = {
                nome: data.name,
                situacao: data.status === 'REGULAR' ? 'ATIVO' : data.status,
                dataNascimento: data.birth_date,
                nomeMae: data.mother_name
            };
        } else {
            normalized = data;
        }

        return {
            nome: normalized.nome?.toUpperCase(),
            situacao: normalized.situacao || 'INDISPONIVEL',
            dataNascimento: normalized.dataNascimento,
            nomeMae: normalized.nomeMae?.toUpperCase(),
            dataConsulta: new Date().toISOString(),
            origem: apiUrl
        };
    }

    async validateCPF(cpf, forceQuery = false) {
        try {
            const cleanCPF = cpf.replace(/\D/g, '');
            
            if (!this.validateCPFDigits(cleanCPF)) {
                return {
                    valid: false,
                    error: 'Invalid CPF - incorrect verification digits',
                    code: 'INVALID_CPF_DIGITS'
                };
            }

            const hashCPF = this.generateCPFHash(cleanCPF);
            const cacheKey = `cpf_${hashCPF}`;

            if (!forceQuery) {
                const cached = await this.redis.get(cacheKey);
                if (cached) {
                    const data = JSON.parse(cached);
                    return {
                        valid: true,
                        data: data,
                        source: 'cache',
                        timestamp: new Date().toISOString()
                    };
                }
            }

            const receitaData = await this.queryReceitaFederal(cleanCPF);
            
            const result = {
                cpf: cleanCPF,
                nome: receitaData.nome,
                situacao: receitaData.situacao,
                dataNascimento: receitaData.dataNascimento,
                nomeMae: receitaData.nomeMae,
                dataConsulta: receitaData.dataConsulta,
                origem: receitaData.origem,
                idade: receitaData.dataNascimento ? this.calculateAge(receitaData.dataNascimento) : null,
                maiorIdade: receitaData.dataNascimento ? this.calculateAge(receitaData.dataNascimento) >= 18 : null
            };

            const cacheData = {
                ...result,
                cpf: undefined
            };
            
            await this.redis.setex(cacheKey, this.cacheExpiry, JSON.stringify(cacheData));

            return {
                valid: true,
                data: result,
                source: 'receita_federal',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error in CPF validation:', error);
            
            return {
                valid: false,
                error: 'Error querying Receita Federal',
                code: 'RECEITA_FEDERAL_ERROR',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            };
        }
    }

    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const month = today.getMonth() - birth.getMonth();
        
        if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }
}

module.exports = new CPFValidationService();

/**
 * Serviço de API para Formas de Pagamento
 * 
 * Este serviço gerencia todas as operações relacionadas às formas de pagamento do sistema,
 * incluindo validações, taxas e controle de parcelamento.
 */

import { api } from './api';

class FormasPagamentoService {
  constructor() {
    this.baseURL = '/api/formas-pagamento';
  }

  /**
   * Busca todas as formas de pagamento
   */
  async getAll(params = {}) {
    try {
      const response = await api.get(this.baseURL, { params });
      
      // Transformar dados para o formato esperado pelo frontend
      const data = response.data.map(forma => ({
        id: forma.id,
        codigo: forma.codigo,
        descricao: forma.descricao,
        tipo_pagamento: forma.tipo_pagamento,
        taxa_percentual: forma.taxa_percentual || 0,
        taxa_fixa: forma.taxa_fixa || 0,
        aceita_parcelamento: forma.aceita_parcelamento || false,
        max_parcelas: forma.max_parcelas || 1,
        ativo: forma.ativo !== undefined ? forma.ativo : true,
        status: forma.ativo ? 'Ativo' : 'Inativo',
        observacoes: forma.observacoes || '',
        created_at: forma.created_at,
        updated_at: forma.updated_at
      }));

      return {
        data,
        total: data.length,
        page: params.page || 1,
        per_page: params.per_page || 25
      };
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      throw new Error('Falha ao carregar formas de pagamento');
    }
  }

  /**
   * Busca forma de pagamento por ID
   */
  async getById(id) {
    try {
      const response = await api.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar forma de pagamento:', error);
      throw new Error('Forma de pagamento não encontrada');
    }
  }

  /**
   * Cria nova forma de pagamento
   */
  async create(formaPagamentoData) {
    try {
      const data = {
        ...formaPagamentoData,
        codigo: parseInt(formaPagamentoData.codigo),
        taxa_percentual: parseFloat(formaPagamentoData.taxa_percentual || 0),
        taxa_fixa: parseFloat(formaPagamentoData.taxa_fixa || 0),
        aceita_parcelamento: formaPagamentoData.aceita_parcelamento !== undefined ? formaPagamentoData.aceita_parcelamento : false,
        max_parcelas: parseInt(formaPagamentoData.max_parcelas || 1),
        ativo: formaPagamentoData.ativo !== undefined ? formaPagamentoData.ativo : true
      };

      const response = await api.post(this.baseURL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar forma de pagamento:', error);
      
      if (error.response?.status === 400) {
        const message = error.response.data?.detail || 'Dados inválidos';
        throw new Error(message);
      }
      
      throw new Error('Falha ao criar forma de pagamento');
    }
  }

  /**
   * Atualiza forma de pagamento existente
   */
  async update(id, formaPagamentoData) {
    try {
      const data = {
        ...formaPagamentoData,
        codigo: parseInt(formaPagamentoData.codigo),
        taxa_percentual: parseFloat(formaPagamentoData.taxa_percentual || 0),
        taxa_fixa: parseFloat(formaPagamentoData.taxa_fixa || 0),
        aceita_parcelamento: formaPagamentoData.aceita_parcelamento !== undefined ? formaPagamentoData.aceita_parcelamento : false,
        max_parcelas: parseInt(formaPagamentoData.max_parcelas || 1)
      };

      const response = await api.put(`${this.baseURL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar forma de pagamento:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Forma de pagamento não encontrada');
      }
      
      if (error.response?.status === 400) {
        const message = error.response.data?.detail || 'Dados inválidos';
        throw new Error(message);
      }
      
      throw new Error('Falha ao atualizar forma de pagamento');
    }
  }

  /**
   * Remove forma de pagamento
   */
  async delete(id) {
    try {
      await api.delete(`${this.baseURL}/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar forma de pagamento:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Forma de pagamento não encontrada');
      }
      
      throw new Error('Falha ao deletar forma de pagamento');
    }
  }

  /**
   * Busca forma de pagamento por código
   */
  async getByCodigo(codigo) {
    try {
      const response = await api.get(`${this.baseURL}`, {
        params: { codigo }
      });
      
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Erro ao buscar forma de pagamento por código:', error);
      return null;
    }
  }

  /**
   * Busca forma de pagamento por descrição
   */
  async getByDescricao(descricao) {
    try {
      const response = await api.get(`${this.baseURL}`, {
        params: { descricao }
      });
      
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Erro ao buscar forma de pagamento por descrição:', error);
      return null;
    }
  }

  /**
   * Valida se um campo é único
   */
  async validateUnique(field, value, excludeId = null) {
    try {
      let formaPagamento = null;
      
      if (field === 'codigo') {
        formaPagamento = await this.getByCodigo(value);
      } else if (field === 'descricao') {
        formaPagamento = await this.getByDescricao(value);
      }
      
      // Se encontrou uma forma de pagamento e não é a mesma que está sendo editada
      if (formaPagamento && formaPagamento.id != excludeId) {
        return { valid: false, message: `${field.toUpperCase()} já cadastrado` };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('Erro ao validar unicidade:', error);
      return { valid: true }; // Em caso de erro, permite a validação
    }
  }

  /**
   * Busca formas de pagamento ativas
   */
  async getAtivas() {
    try {
      const response = await this.getAll({ ativo: true });
      return response.data.filter(forma => forma.ativo);
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento ativas:', error);
      throw new Error('Falha ao carregar formas de pagamento ativas');
    }
  }

  /**
   * Busca formas de pagamento que aceitam parcelamento
   */
  async getComParcelamento() {
    try {
      const response = await this.getAll({ aceita_parcelamento: true });
      return response.data.filter(forma => forma.aceita_parcelamento);
    } catch (error) {
      console.error('Erro ao buscar formas com parcelamento:', error);
      throw new Error('Falha ao carregar formas com parcelamento');
    }
  }

  /**
   * Exporta formas de pagamento para CSV
   */
  async exportToCSV() {
    try {
      const response = await this.getAll();
      const formasPagamento = response.data;
      
      const headers = ['ID', 'Código', 'Descrição', 'Tipo', 'Taxa %', 'Taxa Fixa', 'Parcelamento', 'Max Parcelas', 'Status', 'Observações'];
      const csvContent = [
        headers.join(','),
        ...formasPagamento.map(forma => [
          forma.id,
          forma.codigo,
          `"${forma.descricao}"`,
          forma.tipo_pagamento,
          forma.taxa_percentual,
          forma.taxa_fixa,
          forma.aceita_parcelamento ? 'Sim' : 'Não',
          forma.max_parcelas,
          forma.ativo ? 'Ativo' : 'Inativo',
          `"${forma.observacoes || ''}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `formas_pagamento_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao exportar formas de pagamento:', error);
      throw new Error('Falha ao exportar dados');
    }
  }

  /**
   * Busca formas de pagamento com filtros
   */
  async search(query, filters = {}) {
    try {
      const params = {
        ...filters
      };
      
      if (query) {
        params.search = query;
      }
      
      return await this.getAll(params);
    } catch (error) {
      console.error('Erro ao buscar formas de pagamento:', error);
      throw new Error('Falha na busca');
    }
  }

  /**
   * Calcula taxa total (percentual + fixa) para um valor
   */
  calcularTaxa(valor, taxa_percentual, taxa_fixa) {
    const taxaPerc = (valor * taxa_percentual) / 100;
    return taxaPerc + taxa_fixa;
  }

  /**
   * Verifica se forma de pagamento aceita determinado número de parcelas
   */
  validarParcelas(formaPagamento, numeroParcelas) {
    if (!formaPagamento.aceita_parcelamento && numeroParcelas > 1) {
      return { valid: false, message: 'Esta forma de pagamento não aceita parcelamento' };
    }
    
    if (numeroParcelas > formaPagamento.max_parcelas) {
      return { valid: false, message: `Máximo de ${formaPagamento.max_parcelas} parcelas para esta forma` };
    }
    
    return { valid: true };
  }
}

export const formasPagamentoService = new FormasPagamentoService();
export default formasPagamentoService;

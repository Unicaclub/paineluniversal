import re
import requests
from typing import Dict, Optional
import asyncio
import aiohttp
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class CPFService:
    """Serviço para validação e consulta de CPF na Receita Federal"""
    
    def __init__(self):
        self.base_url = "https://www.receitafederal.gov.br/pessoajuridica/cnpj/cnpjreva/valida.asp"
        self.cache = {}
        self.cache_duration = timedelta(hours=24)
    
    def validar_formato_cpf(self, cpf: str) -> bool:
        """Valida o formato do CPF (apenas dígitos e estrutura)"""
        if not cpf:
            return False
        
        cpf_limpo = re.sub(r'[^0-9]', '', cpf)
        
        if len(cpf_limpo) != 11:
            return False
        
        if cpf_limpo == cpf_limpo[0] * 11:
            return False
        
        return self._validar_digitos_verificadores(cpf_limpo)
    
    def _validar_digitos_verificadores(self, cpf: str) -> bool:
        """Valida os dígitos verificadores do CPF"""
        try:
            soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
            resto = soma % 11
            digito1 = 0 if resto < 2 else 11 - resto
            
            if int(cpf[9]) != digito1:
                return False
            
            soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
            resto = soma % 11
            digito2 = 0 if resto < 2 else 11 - resto
            
            return int(cpf[10]) == digito2
        except (ValueError, IndexError):
            return False
    
    def formatar_cpf(self, cpf: str) -> str:
        """Formata o CPF no padrão XXX.XXX.XXX-XX"""
        cpf_limpo = re.sub(r'[^0-9]', '', cpf)
        if len(cpf_limpo) == 11:
            return f"{cpf_limpo[:3]}.{cpf_limpo[3:6]}.{cpf_limpo[6:9]}-{cpf_limpo[9:]}"
        return cpf
    
    def limpar_cpf(self, cpf: str) -> str:
        """Remove formatação do CPF, deixando apenas números"""
        return re.sub(r'[^0-9]', '', cpf)
    
    async def consultar_receita_federal(self, cpf: str) -> Dict[str, any]:
        """
        Consulta dados do CPF na Receita Federal (simulado)
        Em produção, seria integrado com API oficial da Receita Federal
        """
        cpf_limpo = self.limpar_cpf(cpf)
        
        cache_key = f"cpf_{cpf_limpo}"
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_duration:
                return cached_data
        
        resultado = await self._simular_consulta_receita(cpf_limpo)
        
        self.cache[cache_key] = (resultado, datetime.now())
        
        return resultado
    
    async def _simular_consulta_receita(self, cpf: str) -> Dict[str, any]:
        """
        Simula consulta à Receita Federal
        Em produção, seria substituído por integração real
        """
        await asyncio.sleep(0.5)  # Simula latência da API
        
        cpfs_teste = {
            "00000000000": {
                "cpf": "000.000.000-00",
                "nome": "ADMINISTRADOR SISTEMA",
                "situacao": "REGULAR",
                "data_nascimento": "1990-01-01",
                "data_inscricao": "2020-01-01",
                "digito_verificador": "CORRETO",
                "comprovante_emitido": True
            },
            "11111111111": {
                "cpf": "111.111.111-11",
                "nome": "PROMOTER TESTE",
                "situacao": "REGULAR",
                "data_nascimento": "1985-05-15",
                "data_inscricao": "2019-03-10",
                "digito_verificador": "CORRETO",
                "comprovante_emitido": True
            }
        }
        
        if cpf in cpfs_teste:
            return {
                "status": "success",
                "dados": cpfs_teste[cpf],
                "fonte": "RECEITA_FEDERAL_SIMULADA",
                "timestamp": datetime.now().isoformat()
            }
        
        if self.validar_formato_cpf(cpf):
            return {
                "status": "success",
                "dados": {
                    "cpf": self.formatar_cpf(cpf),
                    "nome": "NOME NÃO DISPONÍVEL",
                    "situacao": "REGULAR",
                    "data_nascimento": None,
                    "data_inscricao": None,
                    "digito_verificador": "CORRETO",
                    "comprovante_emitido": False
                },
                "fonte": "RECEITA_FEDERAL_SIMULADA",
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "status": "error",
            "erro": "CPF_INVALIDO",
            "mensagem": "CPF não encontrado ou inválido",
            "timestamp": datetime.now().isoformat()
        }
    
    async def validar_cpf_completo(self, cpf: str) -> Dict[str, any]:
        """
        Validação completa do CPF: formato + consulta Receita Federal
        """
        cpf_limpo = self.limpar_cpf(cpf)
        
        if not self.validar_formato_cpf(cpf_limpo):
            return {
                "valido": False,
                "erro": "FORMATO_INVALIDO",
                "mensagem": "CPF possui formato inválido",
                "cpf_formatado": cpf
            }
        
        try:
            resultado_receita = await self.consultar_receita_federal(cpf_limpo)
            
            if resultado_receita["status"] == "success":
                return {
                    "valido": True,
                    "cpf_formatado": self.formatar_cpf(cpf_limpo),
                    "dados_receita": resultado_receita["dados"],
                    "fonte": resultado_receita["fonte"],
                    "timestamp": resultado_receita["timestamp"]
                }
            else:
                return {
                    "valido": False,
                    "erro": resultado_receita["erro"],
                    "mensagem": resultado_receita["mensagem"],
                    "cpf_formatado": self.formatar_cpf(cpf_limpo)
                }
        
        except Exception as e:
            logger.error(f"Erro ao consultar CPF {cpf_limpo}: {str(e)}")
            return {
                "valido": False,
                "erro": "ERRO_CONSULTA",
                "mensagem": "Erro interno ao consultar CPF",
                "cpf_formatado": self.formatar_cpf(cpf_limpo)
            }
    
    def obter_estatisticas_cache(self) -> Dict[str, any]:
        """Retorna estatísticas do cache de consultas"""
        agora = datetime.now()
        cache_valido = sum(1 for _, timestamp in self.cache.values() 
                          if agora - timestamp < self.cache_duration)
        
        return {
            "total_consultas_cache": len(self.cache),
            "consultas_validas": cache_valido,
            "consultas_expiradas": len(self.cache) - cache_valido,
            "duracao_cache_horas": self.cache_duration.total_seconds() / 3600
        }

cpf_service = CPFService()

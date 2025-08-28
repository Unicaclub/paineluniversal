/**
 * Módulo de Operadores
 * 
 * Componente que implementa o sistema de cadastro de operadores
 * utilizando o CadastroModule genérico com configuração específica.
 */

import React from 'react';
import CadastroModule from '../common/CadastroModule';

// Importações dinâmicas para evitar problemas de tipos
const operadoresConfig = require('../../config/modules/operadoresConfig').default;
const operadoresService = require('../../services/operadoresService').default;

interface OperadoresModuleProps {}

const OperadoresModule: React.FC<OperadoresModuleProps> = () => {
  return (
    <CadastroModule
      config={operadoresConfig}
      title="Operadores"
      description="Gestão completa de operadores do sistema"
      apiService={operadoresService}
    />
  );
};

export default OperadoresModule;

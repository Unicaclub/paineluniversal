#!/bin/bash

echo "🧪 TESTES COMPLETOS DO ERP SUPREMO"
echo "=================================="

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_passed=0
test_failed=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((test_passed++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((test_failed++))
    fi
}

echo "🔍 Testando APIs do ERP SUPREMO..."

run_test "ERP Backend Health" "curl -f http://localhost:8001/health"
run_test "Plano de Contas IA" "curl -f http://localhost:8001/api/erp-supremo/plano-contas-ia"
run_test "Fluxo Caixa Preditivo" "curl -f http://localhost:8001/api/erp-supremo/fluxo-caixa-preditivo"
run_test "Conciliação Bancária IA" "curl -f http://localhost:8001/api/erp-supremo/conciliacao-bancaria-ia"
run_test "DRE Automático" "curl -f http://localhost:8001/api/erp-supremo/dre-automatico"
run_test "Classificação ABC-XYZ" "curl -f http://localhost:8001/api/erp-supremo/classificacao-abc-xyz"
run_test "Análise Cliente 360" "curl -f http://localhost:8001/api/erp-supremo/cliente-analise-360"

run_test "ERP Service Health" "curl -f http://localhost:3002/health"
run_test "Dashboard Executivo" "curl -f http://localhost:3002/api/erp/dashboard/1"
run_test "IA Previsão Vendas" "curl -f -X POST http://localhost:3002/api/erp/ia/previsao-vendas -H 'Content-Type: application/json' -d '{}'"
run_test "IA Score Crédito" "curl -f -X POST http://localhost:3002/api/erp/ia/score-credito -H 'Content-Type: application/json' -d '{}'"
run_test "IA Detecção Fraude" "curl -f -X POST http://localhost:3002/api/erp/ia/deteccao-fraude -H 'Content-Type: application/json' -d '{}'"
run_test "IA Otimização Preços" "curl -f -X POST http://localhost:3002/api/erp/ia/otimizacao-precos -H 'Content-Type: application/json' -d '{}'"

run_test "Integração OMIE" "curl -f -X POST http://localhost:3002/api/erp/integracoes/configurar -H 'Content-Type: application/json' -d '{\"empresaId\":1,\"tipoIntegracao\":\"omie\",\"configuracao\":{}}'"
run_test "Webhook Processing" "curl -f -X POST http://localhost:3002/api/erp/webhooks/1 -H 'Content-Type: application/json' -d '{}'"

run_test "PostgreSQL Connection" "docker exec postgres psql -U postgres -d erp_supremo -c 'SELECT 1'"
run_test "ERP Tables Created" "docker exec postgres psql -U postgres -d erp_supremo -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \"public\"'"

run_test "Redis Connection" "docker exec redis redis-cli ping"
run_test "Redis Cache Test" "docker exec redis redis-cli set test_key test_value && docker exec redis redis-cli get test_key"

run_test "Prometheus Metrics" "curl -f http://localhost:9090/api/v1/query?query=up"
run_test "Grafana Dashboard" "curl -f http://localhost:3000/api/health"

run_test "ERP Frontend" "curl -f http://localhost:3001"

run_test "TensorFlow Serving" "curl -f http://localhost:8501/v1/models/erp_models"

echo ""
echo "=================================="
echo "📊 RESULTADOS DOS TESTES"
echo "=================================="
echo -e "✅ Testes Passaram: ${GREEN}$test_passed${NC}"
echo -e "❌ Testes Falharam: ${RED}$test_failed${NC}"
echo -e "📈 Taxa de Sucesso: $(( test_passed * 100 / (test_passed + test_failed) ))%"

if [ $test_failed -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo -e "${GREEN}🚀 ERP SUPREMO ESTÁ FUNCIONANDO PERFEITAMENTE!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️ ALGUNS TESTES FALHARAM${NC}"
    echo -e "${YELLOW}🔧 Verifique os logs dos serviços${NC}"
    exit 1
fi

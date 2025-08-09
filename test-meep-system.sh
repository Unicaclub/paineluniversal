#!/bin/bash

echo "🎯 MEEP System Integration Test"
echo "================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

test_api() {
    echo -e "${BLUE}Testing API endpoint: $1${NC}"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$1")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ $1 - OK${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 - Failed (HTTP $response)${NC}"
        return 1
    fi
}

test_health() {
    echo -e "${YELLOW}🔍 Testing Health Endpoints${NC}"
    test_api "http://localhost:8000/healthz"
    test_api "http://localhost:3001/health"
}

test_cpf_validation() {
    echo -e "${YELLOW}🔍 Testing CPF Validation${NC}"
    
    response=$(curl -s -X POST http://localhost:3001/api/meep/cpf/validar \
        -H "Content-Type: application/json" \
        -d '{"cpf": "12345678901"}')
    
    if echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✅ CPF Validation - OK${NC}"
    else
        echo -e "${RED}❌ CPF Validation - Failed${NC}"
        echo "Response: $response"
    fi
}

test_checkin_system() {
    echo -e "${YELLOW}🔍 Testing Check-in System${NC}"
    
    response=$(curl -s -X POST http://localhost:3001/api/meep/checkin/generate-qr \
        -H "Content-Type: application/json" \
        -d '{"cpf": "12345678901", "evento_id": 1}')
    
    if echo "$response" | grep -q "qr_code"; then
        echo -e "${GREEN}✅ QR Generation - OK${NC}"
    else
        echo -e "${RED}❌ QR Generation - Failed${NC}"
    fi
}

test_analytics() {
    echo -e "${YELLOW}🔍 Testing Analytics Dashboard${NC}"
    test_api "http://localhost:3001/api/meep/analytics/dashboard/1"
}

test_database_migration() {
    echo -e "${YELLOW}🔍 Testing Database Migration${NC}"
    
    cd backend
    python create_meep_migration.py
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database Migration - OK${NC}"
    else
        echo -e "${RED}❌ Database Migration - Failed${NC}"
    fi
    cd ..
}

test_docker_services() {
    echo -e "${YELLOW}🔍 Testing Docker Services${NC}"
    
    if [ -f "docker-compose.yml" ]; then
        echo -e "${GREEN}✅ Docker Compose Config - Found${NC}"
        
        docker-compose config > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Docker Compose Validation - OK${NC}"
        else
            echo -e "${RED}❌ Docker Compose Validation - Failed${NC}"
        fi
    else
        echo -e "${RED}❌ Docker Compose Config - Not Found${NC}"
    fi
}

test_pwa_features() {
    echo -e "${YELLOW}🔍 Testing PWA Features${NC}"
    
    if [ -f "frontend/public/manifest.json" ]; then
        echo -e "${GREEN}✅ PWA Manifest - Found${NC}"
    else
        echo -e "${RED}❌ PWA Manifest - Not Found${NC}"
    fi
    
    if [ -f "frontend/public/sw.js" ]; then
        echo -e "${GREEN}✅ Service Worker - Found${NC}"
    else
        echo -e "${RED}❌ Service Worker - Not Found${NC}"
    fi
}

test_file_structure() {
    echo -e "${YELLOW}🔍 Testing File Structure${NC}"
    
    if [ -d "meep-service" ]; then
        echo -e "${GREEN}✅ MEEP Service Directory - Found${NC}"
        
        if [ -f "meep-service/package.json" ]; then
            echo -e "${GREEN}✅ MEEP Package.json - Found${NC}"
        else
            echo -e "${RED}❌ MEEP Package.json - Not Found${NC}"
        fi
    else
        echo -e "${RED}❌ MEEP Service Directory - Not Found${NC}"
    fi
    
    if [ -d "frontend/src/components/meep" ]; then
        echo -e "${GREEN}✅ MEEP Frontend Components - Found${NC}"
        
        components=("DashboardMEEP.tsx" "ValidacaoCPF.tsx" "CheckinMEEP.tsx" "AnalyticsMEEP.tsx" "EquipamentosMEEP.tsx")
        for component in "${components[@]}"; do
            if [ -f "frontend/src/components/meep/$component" ]; then
                echo -e "${GREEN}  ✅ $component - Found${NC}"
            else
                echo -e "${RED}  ❌ $component - Not Found${NC}"
            fi
        done
    else
        echo -e "${RED}❌ MEEP Frontend Components - Not Found${NC}"
    fi
}

main() {
    echo -e "${BLUE}Starting MEEP System Integration Tests...${NC}"
    echo ""
    
    test_file_structure
    echo ""
    
    test_docker_services
    echo ""
    
    test_pwa_features
    echo ""
    
    test_database_migration
    echo ""
    
    if curl -s http://localhost:8000/healthz > /dev/null 2>&1; then
        test_health
        echo ""
        
        test_cpf_validation
        echo ""
        
        test_checkin_system
        echo ""
        
        test_analytics
        echo ""
    else
        echo -e "${YELLOW}⚠️  Services not running - skipping API tests${NC}"
        echo -e "${BLUE}To start services: docker-compose up -d${NC}"
        echo ""
    fi
    
    echo -e "${BLUE}================================${NC}"
    echo -e "${GREEN}🎯 MEEP System Test Complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Start services: docker-compose up -d"
    echo "2. Run database migration: python backend/create_meep_migration.py"
    echo "3. Access frontend: http://localhost:3000"
    echo "4. Test MEEP modules: http://localhost:3000/meep"
}

main

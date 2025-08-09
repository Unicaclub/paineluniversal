
function abrirModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function fecharModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function abrirTab(tabName) {
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

function salvarColaborador() {
    alert('Colaborador salvo com sucesso!');
    fecharModal('modalNovoColaborador');
}

function salvarCargo() {
    alert('Cargo criado com sucesso!');
    fecharModal('modalNovoCargo');
}

function formatCPF(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
}

function formatPhone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchColaborador');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const termo = this.value.toLowerCase();
            document.querySelectorAll('.colaborador-card').forEach(card => {
                const nome = card.querySelector('h3').textContent.toLowerCase();
                const email = card.querySelector('p').textContent.toLowerCase();
                if (nome.includes(termo) || email.includes(termo)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    const filtroCargo = document.getElementById('filtroCargo');
    if (filtroCargo) {
        filtroCargo.addEventListener('change', function() {
            const cargo = this.value.toLowerCase();
            document.querySelectorAll('.colaborador-card').forEach(card => {
                const cargoColaborador = card.querySelector('.detail-value').textContent.toLowerCase();
                if (cargo === '' || cargoColaborador.includes(cargo)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    const cpfInputs = document.querySelectorAll('input[placeholder*="CPF"], input[placeholder*="000.000.000-00"]');
    cpfInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            e.target.value = formatCPF(e.target.value);
        });
    });

    const phoneInputs = document.querySelectorAll('input[placeholder*="telefone"], input[placeholder*="99999-9999"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            e.target.value = formatPhone(e.target.value);
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.equipe-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            document.querySelectorAll('.equipe-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            
            const tabName = this.dataset.tab;
            const tabContent = document.getElementById(`tab-${tabName}`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
});

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('show');
    }
});

function editarColaborador(id) {
    console.log('Editando colaborador:', id);
}

function suspenderColaborador(id) {
    if (confirm('Tem certeza que deseja suspender este colaborador?')) {
        console.log('Suspendendo colaborador:', id);
    }
}

function excluirColaborador(id) {
    if (confirm('Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita.')) {
        console.log('Excluindo colaborador:', id);
    }
}

function reativarColaborador(id) {
    if (confirm('Tem certeza que deseja reativar este colaborador?')) {
        console.log('Reativando colaborador:', id);
    }
}

function editarCargo(id) {
    console.log('Editando cargo:', id);
}

function excluirCargo(id) {
    if (confirm('Tem certeza que deseja excluir este cargo? Todos os colaboradores com este cargo serão afetados.')) {
        console.log('Excluindo cargo:', id);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de Equipe carregado!');
    
    const colaboradores = [
        { 
            id: 1, 
            nome: 'João Silva', 
            email: 'joao.silva@empresa.com',
            cpf: '123.456.789-00',
            telefone: '(11) 99999-9999',
            cargo: 'Gerente',
            status: 'ativo',
            dataAdmissao: '2024-01-15'
        },
        { 
            id: 2, 
            nome: 'Maria Santos', 
            email: 'maria.santos@empresa.com',
            cpf: '987.654.321-00',
            telefone: '(11) 88888-8888',
            cargo: 'Supervisora',
            status: 'ativo',
            dataAdmissao: '2024-02-20'
        },
        { 
            id: 3, 
            nome: 'Pedro Oliveira', 
            email: 'pedro.oliveira@empresa.com',
            cpf: '456.789.123-00',
            telefone: '(11) 77777-7777',
            cargo: 'Operador',
            status: 'suspenso',
            dataAdmissao: '2024-03-10'
        }
    ];
    
    const cargos = [
        { 
            id: 1, 
            nome: 'Administrador', 
            nivel: 1, 
            colaboradores: 2, 
            permissoes: 15,
            status: 'ativo'
        },
        { 
            id: 2, 
            nome: 'Gerente', 
            nivel: 2, 
            colaboradores: 3, 
            permissoes: 12,
            status: 'ativo'
        },
        { 
            id: 3, 
            nome: 'Supervisor', 
            nivel: 3, 
            colaboradores: 5, 
            permissoes: 8,
            status: 'ativo'
        },
        { 
            id: 4, 
            nome: 'Operador', 
            nivel: 4, 
            colaboradores: 14, 
            permissoes: 5,
            status: 'ativo'
        }
    ];
    
    console.log('Colaboradores:', colaboradores.length);
    console.log('Cargos:', cargos.length);
});

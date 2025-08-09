
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

function toggleCategoria(categoriaId) {
    const categoria = document.getElementById(`categoria-${categoriaId}`);
    categoria.classList.toggle('collapsed');
    
    const toggle = categoria.querySelector('.categoria-toggle');
    if (categoria.classList.contains('collapsed')) {
        toggle.textContent = '▶';
        categoria.querySelector('.produtos-grid').style.display = 'none';
    } else {
        toggle.textContent = '▼';
        categoria.querySelector('.produtos-grid').style.display = 'grid';
    }
}

function minimizarTudo() {
    document.querySelectorAll('.categoria-section').forEach(categoria => {
        categoria.classList.add('collapsed');
        categoria.querySelector('.categoria-toggle').textContent = '▶';
        categoria.querySelector('.produtos-grid').style.display = 'none';
    });
}

function toggleCategoriasVazias() {
    console.log('Toggle categorias vazias');
}

function exportarCardapio() {
    alert('Exportando cardápio...');
}

function criarCardapio() {
    alert('Cardápio criado com sucesso!');
    fecharModal('modalNovoCardapio');
}

function salvarProduto() {
    alert('Produto salvo com sucesso!');
    fecharModal('modalNovoProduto');
}

function salvarCategoria() {
    alert('Categoria criada com sucesso!');
    fecharModal('modalNovaCategoria');
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchProduto');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const termo = this.value.toLowerCase();
            document.querySelectorAll('.produto-card').forEach(card => {
                const nome = card.querySelector('.produto-nome').textContent.toLowerCase();
                if (nome.includes(termo)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    const filtroCategoria = document.getElementById('filtroCategoria');
    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', function() {
            const categoria = this.value;
            if (categoria === '') {
                document.querySelectorAll('.categoria-section').forEach(section => {
                    section.style.display = 'block';
                });
            } else {
                document.querySelectorAll('.categoria-section').forEach(section => {
                    if (section.id === `categoria-${categoria}`) {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                });
            }
        });
    }
});

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('show');
    }
});

function selecionarImagem() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('Arquivo selecionado:', file.name);
            const uploadArea = document.querySelector('.upload-area');
            uploadArea.innerHTML = `
                <div class="upload-icon">✅</div>
                <div class="upload-text">Imagem carregada: ${file.name}</div>
            `;
        }
    };
    input.click();
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.produto-drag').forEach(handle => {
        handle.addEventListener('mousedown', function() {
            console.log('Iniciando drag do produto');
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.cardapio-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.cardapio-tab').forEach(t => t.classList.remove('active'));
            
            this.classList.add('active');
            
            const cardapioId = this.dataset.cardapio;
            console.log('Cardápio selecionado:', cardapioId);
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de Cardápio carregado!');
    
    const produtos = [
        { id: 1, nome: 'Cerveja Heineken', categoria: 'bebidas', preco: 12.50 },
        { id: 2, nome: 'Caipirinha', categoria: 'bebidas', preco: 15.00 },
        { id: 3, nome: 'Hambúrguer Artesanal', categoria: 'comidas', preco: 28.90 }
    ];
    
    const categorias = [
        { id: 'bebidas', nome: 'Bebidas', icon: '🍺' },
        { id: 'comidas', nome: 'Comidas', icon: '🍔' },
        { id: 'sobremesas', nome: 'Sobremesas', icon: '🍰' }
    ];
    
    const cardapios = [
        { id: 'principal', nome: 'Cardápio Principal', ativo: true },
        { id: 'bebidas', nome: 'Bebidas', ativo: true },
        { id: 'promocoes', nome: 'Promoções', ativo: false }
    ];
    
    console.log('Produtos:', produtos.length);
    console.log('Categorias:', categorias.length);
    console.log('Cardápios:', cardapios.length);
});

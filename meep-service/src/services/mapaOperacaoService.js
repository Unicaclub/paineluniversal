const { EventEmitter } = require('events');
const { Op, literal } = require('sequelize');
const Redis = require('redis');

class MapaOperacaoService extends EventEmitter {
    constructor() {
        super();
        this.conexoesWebSocket = new Map();
        this.statusCache = new Map();
        this.redis = Redis.createClient(process.env.REDIS_URL);
        this.cacheExpiry = 5 * 60;
    }

    adicionarConexaoWebSocket(socketId, socket) {
        this.conexoesWebSocket.set(socketId, socket);
        console.log(`WebSocket connection added: ${socketId}`);
    }

    removerConexaoWebSocket(socketId) {
        this.conexoesWebSocket.delete(socketId);
        console.log(`WebSocket connection removed: ${socketId}`);
    }

    async obterLayoutEvento(eventoId, filtros = {}) {
        try {
            const cacheKey = `layout_evento_${eventoId}_${JSON.stringify(filtros)}`;
            
            const cached = await this.redis.get(cacheKey);
            if (cached && !filtros.forceRefresh) {
                return JSON.parse(cached);
            }

            const {
                mostrarApenasAtivas = true,
                tipoArea,
                statusMesa,
                grupoCartao
            } = filtros;

            const layoutQuery = `
                SELECT 
                    le.*,
                    json_agg(
                        json_build_object(
                            'id', ae.id,
                            'nome', ae.nome,
                            'tipo', ae.tipo,
                            'posicao_x', ae.posicao_x,
                            'posicao_y', ae.posicao_y,
                            'largura', ae.largura,
                            'altura', ae.altura,
                            'capacidade_maxima', ae.capacidade_maxima,
                            'cor', ae.cor,
                            'ativa', ae.ativa,
                            'configuracoes', ae.configuracoes,
                            'restricoes', ae.restricoes,
                            'mesas', ae.mesas_data
                        )
                    ) as areas
                FROM layout_evento le
                LEFT JOIN (
                    SELECT 
                        ae.*,
                        json_agg(
                            json_build_object(
                                'id', m.id,
                                'numero', m.numero,
                                'nome', m.nome,
                                'tipo', m.tipo,
                                'capacidade_pessoas', m.capacidade_pessoas,
                                'posicao_x', m.posicao_x,
                                'posicao_y', m.posicao_y,
                                'largura', m.largura,
                                'altura', m.altura,
                                'formato', m.formato,
                                'status', m.status,
                                'valor_minimo', m.valor_minimo,
                                'taxa_servico', m.taxa_servico,
                                'observacoes', m.observacoes,
                                'configuracoes', m.configuracoes,
                                'comanda_ativa', m.comanda_ativa
                            )
                        ) as mesas_data
                    FROM areas_evento ae
                    LEFT JOIN (
                        SELECT 
                            m.*,
                            json_build_object(
                                'id', co.id,
                                'numero_comanda', co.numero_comanda,
                                'valor_total', co.valor_total,
                                'participantes_count', COALESCE(cp.participantes_count, 0)
                            ) as comanda_ativa
                        FROM mesas m
                        LEFT JOIN comandas_operacao co ON m.id = co.mesa_id 
                            AND co.status IN ('aberta', 'bloqueada')
                        LEFT JOIN (
                            SELECT 
                                comanda_id,
                                COUNT(*) as participantes_count
                            FROM comanda_participantes 
                            WHERE ativo = true
                            GROUP BY comanda_id
                        ) cp ON co.id = cp.comanda_id
                        ${statusMesa ? `WHERE m.status = '${statusMesa}'` : ''}
                    ) m ON ae.id = m.area_id
                    WHERE ae.layout_id IN (SELECT id FROM layout_evento WHERE evento_id = $1)
                    ${mostrarApenasAtivas ? 'AND ae.ativa = true' : ''}
                    ${tipoArea ? `AND ae.tipo = '${tipoArea}'` : ''}
                    GROUP BY ae.id
                ) ae ON le.id = ae.layout_id
                WHERE le.evento_id = $1
                GROUP BY le.id
            `;

            const result = await this.executeQuery(layoutQuery, [eventoId]);
            
            if (result.length === 0) {
                const defaultLayout = await this.criarLayoutPadrao(eventoId);
                await this.redis.setex(cacheKey, this.cacheExpiry, JSON.stringify(defaultLayout));
                return defaultLayout;
            }

            const layout = result[0];
            await this.redis.setex(cacheKey, this.cacheExpiry, JSON.stringify(layout));
            
            return layout;

        } catch (error) {
            console.error('Error getting event layout:', error);
            throw error;
        }
    }

    async criarLayoutPadrao(eventoId) {
        const layoutQuery = `
            INSERT INTO layout_evento (evento_id, nome, largura, altura, escala, configuracao)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const layoutData = [
            eventoId,
            'Layout Principal',
            1200,
            800,
            1.0,
            JSON.stringify({})
        ];

        const result = await this.executeQuery(layoutQuery, layoutData);
        return {
            ...result[0],
            areas: []
        };
    }

    async calcularEstatisticasEvento(eventoId) {
        try {
            const cacheKey = `estatisticas_evento_${eventoId}`;
            
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }

            const estatisticasQuery = `
                WITH layout_info AS (
                    SELECT id FROM layout_evento WHERE evento_id = $1
                ),
                mesa_stats AS (
                    SELECT 
                        COUNT(*) as total_mesas,
                        COUNT(CASE WHEN status = 'ocupada' THEN 1 END) as mesas_ocupadas,
                        COUNT(CASE WHEN status = 'disponivel' THEN 1 END) as mesas_disponveis,
                        COUNT(CASE WHEN status = 'reservada' THEN 1 END) as mesas_reservadas,
                        COUNT(CASE WHEN status = 'bloqueada' THEN 1 END) as mesas_bloqueadas
                    FROM mesas m
                    JOIN areas_evento ae ON m.area_id = ae.id
                    JOIN layout_info li ON ae.layout_id = li.id
                ),
                comanda_stats AS (
                    SELECT 
                        COUNT(CASE WHEN status = 'aberta' THEN 1 END) as comandas_abertas,
                        COUNT(CASE WHEN status = 'bloqueada' THEN 1 END) as comandas_bloqueadas,
                        COALESCE(SUM(valor_total), 0) as faturamento_total
                    FROM comandas_operacao
                    WHERE evento_id = $1
                ),
                participante_stats AS (
                    SELECT COUNT(*) as total_participantes
                    FROM comanda_participantes cp
                    JOIN comandas_operacao co ON cp.comanda_id = co.id
                    WHERE co.evento_id = $1 AND cp.ativo = true
                )
                SELECT 
                    ms.*,
                    cs.*,
                    ps.total_participantes,
                    CASE 
                        WHEN cs.comandas_abertas > 0 
                        THEN cs.faturamento_total / cs.comandas_abertas 
                        ELSE 0 
                    END as ticket_medio
                FROM mesa_stats ms
                CROSS JOIN comanda_stats cs
                CROSS JOIN participante_stats ps
            `;

            const result = await this.executeQuery(estatisticasQuery, [eventoId]);
            const estatisticas = result[0] || {
                total_mesas: 0,
                mesas_ocupadas: 0,
                mesas_disponveis: 0,
                mesas_reservadas: 0,
                mesas_bloqueadas: 0,
                comandas_abertas: 0,
                comandas_bloqueadas: 0,
                total_participantes: 0,
                faturamento_total: 0,
                ticket_medio: 0
            };

            await this.redis.setex(cacheKey, 30, JSON.stringify(estatisticas));
            return estatisticas;

        } catch (error) {
            console.error('Error calculating event statistics:', error);
            throw error;
        }
    }

    async buscarOperacao(eventoId, filtros) {
        try {
            const { busca_texto, busca_tipo } = filtros;
            
            if (!busca_texto) {
                return [];
            }

            const resultados = [];
            const buscaTexto = busca_texto.toLowerCase().trim();

            if (!busca_tipo || busca_tipo === 'cpf') {
                const clientesQuery = `
                    SELECT 
                        ce.*,
                        COUNT(co.id) as comandas_ativas
                    FROM clientes_eventos ce
                    LEFT JOIN comandas_operacao co ON ce.cpf = co.cliente_principal_cpf 
                        AND co.status IN ('aberta', 'bloqueada')
                    WHERE ce.evento_id = $1 
                        AND ce.cpf ILIKE $2
                    GROUP BY ce.id
                    LIMIT 10
                `;

                const clientes = await this.executeQuery(clientesQuery, [eventoId, `%${buscaTexto}%`]);
                
                clientes.forEach(cliente => {
                    resultados.push({
                        tipo: 'cliente',
                        id: cliente.id,
                        titulo: cliente.nome,
                        subtitulo: `CPF: ${cliente.cpf}`,
                        status: cliente.comandas_ativas > 0 ? 'ativo' : 'inativo',
                        dados_extras: {
                            cpf: cliente.cpf,
                            telefone: cliente.telefone,
                            comandas_ativas: parseInt(cliente.comandas_ativas)
                        }
                    });
                });
            }

            if (!busca_tipo || busca_tipo === 'mesa') {
                const mesasQuery = `
                    SELECT 
                        m.*,
                        ae.nome as area_nome,
                        co.numero_comanda as comanda_ativa
                    FROM mesas m
                    JOIN areas_evento ae ON m.area_id = ae.id
                    JOIN layout_evento le ON ae.layout_id = le.id
                    LEFT JOIN comandas_operacao co ON m.id = co.mesa_id 
                        AND co.status IN ('aberta', 'bloqueada')
                    WHERE le.evento_id = $1 
                        AND (m.numero ILIKE $2 OR m.nome ILIKE $2)
                    LIMIT 10
                `;

                const mesas = await this.executeQuery(mesasQuery, [eventoId, `%${buscaTexto}%`]);
                
                mesas.forEach(mesa => {
                    resultados.push({
                        tipo: 'mesa',
                        id: mesa.id,
                        titulo: `Mesa ${mesa.numero}`,
                        subtitulo: mesa.nome || `Área: ${mesa.area_nome}`,
                        status: mesa.status,
                        dados_extras: {
                            numero: mesa.numero,
                            capacidade: mesa.capacidade_pessoas,
                            comanda_ativa: mesa.comanda_ativa
                        }
                    });
                });
            }

            if (!busca_tipo || busca_tipo === 'comanda') {
                const comandasQuery = `
                    SELECT 
                        co.*,
                        m.numero as mesa_numero
                    FROM comandas_operacao co
                    LEFT JOIN mesas m ON co.mesa_id = m.id
                    WHERE co.evento_id = $1 
                        AND co.numero_comanda ILIKE $2
                    LIMIT 10
                `;

                const comandas = await this.executeQuery(comandasQuery, [eventoId, `%${buscaTexto}%`]);
                
                comandas.forEach(comanda => {
                    resultados.push({
                        tipo: 'comanda',
                        id: comanda.id,
                        titulo: `Comanda ${comanda.numero_comanda}`,
                        subtitulo: comanda.mesa_numero ? `Mesa ${comanda.mesa_numero}` : '',
                        status: comanda.status,
                        dados_extras: {
                            numero_comanda: comanda.numero_comanda,
                            valor_total: parseFloat(comanda.valor_total),
                            mesa_numero: comanda.mesa_numero
                        }
                    });
                });
            }

            if (!busca_tipo || busca_tipo === 'cartao') {
                const cartoesQuery = `
                    SELECT 
                        ce.*,
                        cl.nome as cliente_nome
                    FROM cartoes_evento ce
                    LEFT JOIN clientes_eventos cl ON ce.cliente_cpf = cl.cpf
                    WHERE ce.evento_id = $1 
                        AND (ce.numero_cartao ILIKE $2 OR ce.qr_code ILIKE $2)
                    LIMIT 10
                `;

                const cartoes = await this.executeQuery(cartoesQuery, [eventoId, `%${buscaTexto}%`]);
                
                cartoes.forEach(cartao => {
                    resultados.push({
                        tipo: 'cartao',
                        id: cartao.id,
                        titulo: `Cartão ${cartao.numero_cartao}`,
                        subtitulo: cartao.cliente_nome || '',
                        status: cartao.status,
                        dados_extras: {
                            numero_cartao: cartao.numero_cartao,
                            saldo_credito: parseFloat(cartao.saldo_credito),
                            consumo_total: parseFloat(cartao.consumo_total)
                        }
                    });
                });
            }

            return resultados.slice(0, 20);

        } catch (error) {
            console.error('Error searching operation:', error);
            throw error;
        }
    }

    async atualizarStatusMesa(mesaId, novoStatus, usuarioId, observacoes = null) {
        try {
            const updateQuery = `
                UPDATE mesas 
                SET status = $1, observacoes = COALESCE($2, observacoes), atualizada_em = NOW()
                WHERE id = $3
                RETURNING *
            `;

            const result = await this.executeQuery(updateQuery, [novoStatus, observacoes, mesaId]);
            
            if (result.length === 0) {
                throw new Error('Mesa não encontrada');
            }

            const mesa = result[0];
            
            const eventoQuery = `
                SELECT le.evento_id 
                FROM mesas m
                JOIN areas_evento ae ON m.area_id = ae.id
                JOIN layout_evento le ON ae.layout_id = le.id
                WHERE m.id = $1
            `;
            
            const eventoResult = await this.executeQuery(eventoQuery, [mesaId]);
            const eventoId = eventoResult[0]?.evento_id;

            if (eventoId) {
                this.emit('mesa_atualizada', {
                    eventoId,
                    mesa_id: mesaId,
                    numero: mesa.numero,
                    status_novo: novoStatus,
                    usuario_id: usuarioId,
                    timestamp: new Date().toISOString()
                });

                await this.invalidateCache(`layout_evento_${eventoId}`);
                await this.invalidateCache(`estatisticas_evento_${eventoId}`);
            }

            return mesa;

        } catch (error) {
            console.error('Error updating mesa status:', error);
            throw error;
        }
    }

    async abrirComanda(eventoId, comandaData, usuarioId) {
        try {
            const { mesa_id, numero_comanda, cliente_principal_cpf, tipo = 'mesa', observacoes } = comandaData;

            if (mesa_id) {
                const mesaOcupadaQuery = `
                    SELECT id FROM comandas_operacao 
                    WHERE mesa_id = $1 AND status IN ('aberta', 'bloqueada')
                `;
                
                const mesaOcupada = await this.executeQuery(mesaOcupadaQuery, [mesa_id]);
                
                if (mesaOcupada.length > 0) {
                    throw new Error('Mesa já possui comanda ativa');
                }
            }

            const comandaExistenteQuery = `
                SELECT id FROM comandas_operacao WHERE numero_comanda = $1
            `;
            
            const comandaExistente = await this.executeQuery(comandaExistenteQuery, [numero_comanda]);
            
            if (comandaExistente.length > 0) {
                throw new Error('Número de comanda já existe');
            }

            const insertQuery = `
                INSERT INTO comandas_operacao (
                    uuid, evento_id, mesa_id, numero_comanda, cliente_principal_cpf,
                    status, tipo, observacoes, funcionario_abertura, configuracoes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `;

            const uuid = require('crypto').randomUUID();
            const insertData = [
                uuid, eventoId, mesa_id, numero_comanda, cliente_principal_cpf,
                'aberta', tipo, observacoes, usuarioId, JSON.stringify({})
            ];

            const result = await this.executeQuery(insertQuery, insertData);
            const novaComanda = result[0];

            if (mesa_id) {
                await this.executeQuery(
                    'UPDATE mesas SET status = $1 WHERE id = $2',
                    ['ocupada', mesa_id]
                );
            }

            this.emit('comanda_aberta', {
                eventoId,
                comanda: novaComanda,
                usuario_id: usuarioId,
                timestamp: new Date().toISOString()
            });

            await this.invalidateCache(`layout_evento_${eventoId}`);
            await this.invalidateCache(`estatisticas_evento_${eventoId}`);

            return novaComanda;

        } catch (error) {
            console.error('Error opening comanda:', error);
            throw error;
        }
    }

    async criarBloqueio(bloqueioData, usuarioId) {
        try {
            const { tipo, referencia_id, evento_id, motivo, detalhes, temporario = false, expira_em } = bloqueioData;

            const bloqueioExistenteQuery = `
                SELECT id FROM bloqueios 
                WHERE tipo = $1 AND referencia_id = $2 AND ativo = true
            `;
            
            const bloqueioExistente = await this.executeQuery(bloqueioExistenteQuery, [tipo, referencia_id]);
            
            if (bloqueioExistente.length > 0) {
                throw new Error('Entidade já está bloqueada');
            }

            const insertQuery = `
                INSERT INTO bloqueios (
                    tipo, referencia_id, evento_id, motivo, detalhes,
                    bloqueado_por, temporario, expira_em
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const insertData = [tipo, referencia_id, evento_id, motivo, detalhes, usuarioId, temporario, expira_em];
            const result = await this.executeQuery(insertQuery, insertData);
            const novoBloqueio = result[0];

            if (tipo === 'mesa') {
                await this.executeQuery(
                    'UPDATE mesas SET status = $1 WHERE id = $2',
                    ['bloqueada', parseInt(referencia_id)]
                );
            } else if (tipo === 'comanda') {
                await this.executeQuery(
                    'UPDATE comandas_operacao SET status = $1 WHERE id = $2',
                    ['bloqueada', parseInt(referencia_id)]
                );
            }

            this.emit('entidade_bloqueada', {
                eventoId: evento_id,
                bloqueio: novoBloqueio,
                usuario_id: usuarioId,
                timestamp: new Date().toISOString()
            });

            await this.invalidateCache(`layout_evento_${evento_id}`);
            await this.invalidateCache(`estatisticas_evento_${evento_id}`);

            return novoBloqueio;

        } catch (error) {
            console.error('Error creating bloqueio:', error);
            throw error;
        }
    }

    async emitirCartao(eventoId, cartaoData, usuarioId) {
        try {
            const { grupo_id, numero_cartao, cliente_cpf, saldo_credito = 0, limite_consumo = 0 } = cartaoData;

            const cartaoExistenteQuery = `
                SELECT id FROM cartoes_evento WHERE numero_cartao = $1
            `;
            
            const cartaoExistente = await this.executeQuery(cartaoExistenteQuery, [numero_cartao]);
            
            if (cartaoExistente.length > 0) {
                throw new Error('Número de cartão já existe');
            }

            const uuid = require('crypto').randomUUID();
            const qrCode = `MEEP-${eventoId}-${numero_cartao}-${uuid.substring(0, 8)}`;

            const insertQuery = `
                INSERT INTO cartoes_evento (
                    uuid, evento_id, grupo_id, numero_cartao, cliente_cpf,
                    qr_code, status, saldo_credito, limite_consumo, configuracoes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `;

            const insertData = [
                uuid, eventoId, grupo_id, numero_cartao, cliente_cpf,
                qrCode, 'ativo', saldo_credito, limite_consumo, JSON.stringify({})
            ];

            const result = await this.executeQuery(insertQuery, insertData);
            const novoCartao = result[0];

            this.emit('cartao_emitido', {
                eventoId,
                cartao: novoCartao,
                usuario_id: usuarioId,
                timestamp: new Date().toISOString()
            });

            return novoCartao;

        } catch (error) {
            console.error('Error emitting cartao:', error);
            throw error;
        }
    }

    async invalidateCache(pattern) {
        try {
            const keys = await this.redis.keys(`${pattern}*`);
            if (keys.length > 0) {
                await this.redis.del(keys);
            }
        } catch (error) {
            console.error('Error invalidating cache:', error);
        }
    }

    async executeQuery(query, params = []) {
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });

        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        } finally {
            await pool.end();
        }
    }
}

module.exports = new MapaOperacaoService();

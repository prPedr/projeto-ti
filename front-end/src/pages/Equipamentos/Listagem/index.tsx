import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { excluirEquipamento, listarEquipamentos } from '../../../services/equipamentos';
import type { Equipamento } from '../../../services/equipamentos';
import { useToast } from '../../../contexts/ToastContext';
import ModalConfirmacao from '../../../components/ModalConfirmacao';
import styles from './Listagem.module.css';

export default function Listagem() {
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [equipamentoParaExcluir, setEquipamentoParaExcluir] = useState<Equipamento | null>(null);

  async function carregarDados() {
    setCarregando(true);
    try {
      const dados = await listarEquipamentos();
      setEquipamentos(dados);
    } catch (erro) {
      console.error('Erro ao carregar equipamentos:', erro);
      mostrarToast('Não foi possível carregar a lista de equipamentos.', 'erro');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function handleExcluir(equipamento: Equipamento) {
    setEquipamentoParaExcluir(equipamento);
  }

  async function confirmarExclusao() {
    if (!equipamentoParaExcluir) return;
    try {
      await excluirEquipamento(equipamentoParaExcluir.id);
      mostrarToast('Equipamento descartado com sucesso.', 'sucesso');
      await carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir equipamento:', erro);
      mostrarToast('Não foi possível excluir o equipamento.', 'erro');
    } finally {
      setEquipamentoParaExcluir(null);
    }
  }

  /**
   * Retorna o style inline de fundo + texto para o badge de status,
   * consumindo os tokens CSS de --status-* definidos em index.css.
   * Valores válidos (conforme CHECK no schema.sql):
   *   'ATIVO' | 'ESTOQUE' | 'MANUTENCAO' | 'DESCARTADO'
   */
  function corDoStatus(status: string): React.CSSProperties {
    const mapa: Record<string, React.CSSProperties> = {
      ATIVO:      { backgroundColor: 'var(--status-ativo-fundo)',       color: 'var(--status-ativo-texto)' },
      ESTOQUE:    { backgroundColor: 'var(--status-estoque-fundo)',     color: 'var(--status-estoque-texto)' },
      MANUTENCAO: { backgroundColor: 'var(--status-manutencao-fundo)',  color: 'var(--status-manutencao-texto)' },
      DESCARTADO: { backgroundColor: 'var(--status-descartado-fundo)',  color: 'var(--status-descartado-texto)' },
    };
    return mapa[status] ?? { backgroundColor: 'var(--cor-input-borda)', color: 'var(--cor-texto)' };
  }

  /** Converte o valor uppercase do banco para rótulo legivel em português. */
  function rotuloDoStatus(status: string): string {
    const rotulos: Record<string, string> = {
      ATIVO:      'Ativo',
      ESTOQUE:    'Em estoque',
      MANUTENCAO: 'Manutenção',
      DESCARTADO: 'Descartado',
    };
    return rotulos[status] ?? status;
  }

  return (
    <>
      <div className={styles.cartao} style={{ padding: '1.5rem' }}>
        <div className={styles.cabecalhoAcoes}>
          <h2>Equipamentos</h2>
          <Link to="/equipamentos/cadastro" className={styles.botaoNovo}>
            + Novo Equipamento
          </Link>
        </div>

        <div className={styles.areaRolagem}>
          {carregando ? (
            <p>Carregando equipamentos...</p>
          ) : equipamentos.length === 0 ? (
            <p>Nenhum equipamento cadastrado.</p>
          ) : (
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>IP</th>
                  <th>Nome</th>
                  <th>Usuário</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {equipamentos.map((eq) => (
                  <tr key={eq.id}>
                    <td style={{ color: 'var(--cor-texto-suave)', fontSize: '12px' }}>{eq.id}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                      {eq.ip ?? '—'}
                    </td>
                    <td>{eq.nome ?? '—'}</td>
                    <td>{eq.usuario_alocado ?? '—'}</td>
                    <td>{eq.marca}</td>
                    <td>{eq.modelo}</td>
                    <td>
                      <span className={styles.statusBadge} style={corDoStatus(eq.status)}>
                        {rotuloDoStatus(eq.status)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.grupoAcoes}>
                        {eq.termo_anexo_id && eq.termo_url_download && (
                          <a
                            href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}${eq.termo_url_download}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.botaoIcone} ${styles.botaoIconeTermo}`}
                            title="Ver Termo de Responsabilidade"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                          </a>
                        )}
                        <button
                          type="button"
                          className={styles.botaoIcone}
                          onClick={() => navigate(`/equipamentos/${eq.id}`, { state: { modo: 'visualizar' } })}
                          title="Visualizar"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.botaoIcone}
                          onClick={() => navigate(`/equipamentos/${eq.id}`, { state: { modo: 'editar' } })}
                          title="Editar"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.botaoIcone}
                          onClick={() => handleExcluir(eq)}
                          title="Excluir"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ModalConfirmacao
        aberto={equipamentoParaExcluir !== null}
        titulo="Descartar equipamento?"
        mensagem={`Tem certeza que deseja descartar o equipamento #${equipamentoParaExcluir?.id} (${equipamentoParaExcluir?.marca} ${equipamentoParaExcluir?.modelo})?`}
        textoConfirmar="Descartar"
        textoCancelar="Cancelar"
        variante="perigo"
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setEquipamentoParaExcluir(null)}
      />
    </>
  );
}

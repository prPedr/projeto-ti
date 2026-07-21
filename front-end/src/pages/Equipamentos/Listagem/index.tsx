import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { excluirEquipamento, listarEquipamentos } from '../../../services/equipamentos';
import styles from './Listagem.module.css';

interface Equipamento {
  id: number;
  categoria: string;
  marca: string;
  modelo: string;
  status: string;
  localizacao_id: number;
  localizacao_filial?: string;
  localizacao_predio?: string;
  localizacao_sala?: string;
}

export default function Listagem() {
  const navigate = useNavigate();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarDados() {
    setCarregando(true);
    try {
      const dados = await listarEquipamentos();
      setEquipamentos(dados);
    } catch (erro) {
      console.error('Erro ao carregar equipamentos:', erro);
      alert('Não foi possível carregar a lista de equipamentos.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleExcluir(id: number) {
    const confirmado = window.confirm('Tem certeza que deseja descartar este equipamento?');
    if (!confirmado) return;

    try {
      await excluirEquipamento(id);
      await carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir equipamento:', erro);
      alert('Não foi possível excluir o equipamento.');
    }
  }

  function formatarLocalizacao(eq: Equipamento) {
    const partes = [eq.localizacao_filial, eq.localizacao_predio, eq.localizacao_sala].filter(Boolean);
    return partes.length > 0 ? partes.join(' - ') : 'Não definida';
  }

  return (
    <div className={styles.cartao}>
      <div className={styles.cabecalhoAcoes}>
        <h2>Equipamentos</h2>
        <Link to="/equipamentos/cadastro" className={styles.botaoNovo}>
          + Novo Equipamento
        </Link>
      </div>

      {carregando ? (
        <p>Carregando equipamentos...</p>
      ) : equipamentos.length === 0 ? (
        <p>Nenhum equipamento cadastrado.</p>
      ) : (
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Categoria</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Localização</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipamentos.map((eq) => (
              <tr key={eq.id}>
                <td>{eq.id}</td>
                <td style={{ textTransform: 'capitalize' }}>{eq.categoria}</td>
                <td>{eq.marca}</td>
                <td>{eq.modelo}</td>
                <td>{formatarLocalizacao(eq)}</td>
                <td>
                  <span className={styles.statusBadge}>{eq.status}</span>
                </td>
                <td>
                  <div className={styles.grupoAcoes}>
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
                      onClick={() => handleExcluir(eq.id)}
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
  );
}

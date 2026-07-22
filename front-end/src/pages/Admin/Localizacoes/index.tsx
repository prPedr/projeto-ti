import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { criarLocalizacao, listarLocalizacoesAdmin } from '../../../services/localizacoes';
import type { Localizacao, MetadadosPaginacao } from '../../../services/localizacoes';
import styles from './Localizacoes.module.css';

const LIMITE_POR_PAGINA = 10;

export default function Localizacoes() {
  const [filial, setFilial] = useState('');
  const [predio, setPredio] = useState('');
  const [sala, setSala] = useState('');
  const [descricao, setDescricao] = useState('');

  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);

  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [metadados, setMetadados] = useState<MetadadosPaginacao | null>(null);
  const [carregando, setCarregando] = useState(false);

  function carregarLocalizacoes(paginaAlvo = pagina, buscaAlvo = busca) {
    setCarregando(true);
    listarLocalizacoesAdmin(paginaAlvo, LIMITE_POR_PAGINA, buscaAlvo || undefined)
      .then(({ dados, metadados }) => {
        setLocalizacoes(dados);
        setMetadados(metadados);
      })
      .catch((erro) => console.error('Erro ao carregar localizações:', erro))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregarLocalizacoes(1, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!filial.trim()) {
      return;
    }

    try {
      await criarLocalizacao({
        filial: filial.trim(),
        predio: predio.trim() || undefined,
        sala: sala.trim() || undefined,
        descricao: descricao.trim() || undefined,
      });

      setFilial('');
      setPredio('');
      setSala('');
      setDescricao('');

      // Volta pra primeira página pra garantir que o item recém-criado apareça
      setPagina(1);
      carregarLocalizacoes(1, busca);
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao adicionar localização.');
    }
  }

  function handleBuscar(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPagina(1);
    carregarLocalizacoes(1, busca);
  }

  function irParaPagina(novaPagina: number) {
    setPagina(novaPagina);
    carregarLocalizacoes(novaPagina, busca);
  }

  return (
    <>
      <form className={styles.formulario} onSubmit={handleSubmit}>
        <div className={styles.campo}>
          <label htmlFor="filial">Filial</label>
          <input
            id="filial"
            className={styles.input}
            value={filial}
            onChange={(event) => setFilial(event.target.value)}
            placeholder="Ex: Matriz"
            required
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="predio">Prédio</label>
          <input
            id="predio"
            className={styles.input}
            value={predio}
            onChange={(event) => setPredio(event.target.value)}
            placeholder="Ex: Bloco A"
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="sala">Sala</label>
          <input
            id="sala"
            className={styles.input}
            value={sala}
            onChange={(event) => setSala(event.target.value)}
            placeholder="Ex: 101"
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="descricao">Descrição</label>
          <input
            id="descricao"
            className={styles.input}
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Ex: Próximo ao setor financeiro"
          />
        </div>

        <button type="submit" className={styles.botaoAdicionar}>
          Adicionar
        </button>
      </form>

      <form className={styles.barraBusca} onSubmit={handleBuscar}>
        <input
          className={styles.input}
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por filial, prédio, sala ou descrição..."
        />
      </form>

      <div className={styles.tabelaWrapper}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Filial</th>
              <th>Prédio</th>
              <th>Sala</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {localizacoes.map((localizacao) => (
              <tr key={localizacao.id}>
                <td>{localizacao.filial}</td>
                <td>{localizacao.predio ?? '—'}</td>
                <td>{localizacao.sala ?? '—'}</td>
                <td>{localizacao.descricao ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!carregando && localizacoes.length === 0 && (
          <p className={styles.listaVazia}>Nenhuma localização cadastrada.</p>
        )}
      </div>

      {metadados && metadados.totalPaginas > 1 && (
        <div className={styles.paginacao}>
          <span>
            Página {metadados.paginaAtual} de {metadados.totalPaginas} ({metadados.totalRegistros} registros)
          </span>
          <button
            type="button"
            className={styles.botaoPaginacao}
            onClick={() => irParaPagina(pagina - 1)}
            disabled={pagina <= 1}
          >
            Anterior
          </button>
          <button
            type="button"
            className={styles.botaoPaginacao}
            onClick={() => irParaPagina(pagina + 1)}
            disabled={pagina >= metadados.totalPaginas}
          >
            Próxima
          </button>
        </div>
      )}
    </>
  );
}

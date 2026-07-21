import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { criarOpcao, editarOpcao, excluirOpcao, listarOpcoes } from '../../../services/opcoes';
import type { OpcoesAgrupadas } from '../../../services/opcoes';
import styles from './Opcoes.module.css';

type CategoriaOpcao = 'MARCA' | 'MODELO' | 'PROCESSADOR' | 'MEMORIA' | 'ARMAZENAMENTO';

const CATEGORIAS: Array<{ valor: CategoriaOpcao; rotulo: string }> = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
  { valor: 'PROCESSADOR', rotulo: 'Processador' },
  { valor: 'MEMORIA', rotulo: 'Memória' },
  { valor: 'ARMAZENAMENTO', rotulo: 'Armazenamento' },
];

export default function Opcoes() {
  const [categoria, setCategoria] = useState<CategoriaOpcao>('MARCA');
  const [valor, setValor] = useState('');
  const [dependenciaId, setDependenciaId] = useState('');
  const [opcoes, setOpcoes] = useState<OpcoesAgrupadas>({});

  function carregarOpcoes() {
    listarOpcoes()
      .then((dados) => setOpcoes(dados))
      .catch((erro) => console.error('Erro ao carregar opções:', erro));
  }

  useEffect(() => {
    carregarOpcoes();
  }, []);

  // Resetar dependência quando trocar de categoria
  useEffect(() => {
    setDependenciaId('');
  }, [categoria]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!valor.trim()) {
      return;
    }

    try {
      const depId = dependenciaId ? Number(dependenciaId) : null;
      await criarOpcao(categoria, valor.trim(), depId);
      setValor('');
      setDependenciaId('');
      carregarOpcoes();
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao adicionar opção.');
    }
  }

  async function handleEditar(id: number, valorAtual: string) {
    const novoValor = prompt('Novo nome para a opção:', valorAtual);

    if (novoValor === null || novoValor.trim() === '' || novoValor.trim() === valorAtual) {
      return;
    }

    try {
      await editarOpcao(id, novoValor.trim());
      setOpcoes((prev) => {
        const atualizado: OpcoesAgrupadas = {};
        for (const [cat, itens] of Object.entries(prev)) {
          atualizado[cat] = itens.map((item) =>
            item.id === id ? { ...item, valor: novoValor.trim() } : item,
          );
        }
        return atualizado;
      });
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao editar opção.');
    }
  }

  async function handleExcluir(id: number, valorExcluido: string) {
    const confirmar = confirm(`Tem certeza que deseja excluir "${valorExcluido}"?`);

    if (!confirmar) {
      return;
    }

    try {
      await excluirOpcao(id);
      setOpcoes((prev) => {
        const atualizado: OpcoesAgrupadas = {};
        for (const [cat, itens] of Object.entries(prev)) {
          atualizado[cat] = itens.filter((item) => item.id !== id);
        }
        return atualizado;
      });
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao excluir opção.');
    }
  }

  const marcas = opcoes['MARCA'] ?? [];

  return (
    <div className={styles.cartao}>
      <form className={styles.formulario} onSubmit={handleSubmit}>
        <div className={styles.campo}>
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            className={styles.select}
            value={categoria}
            onChange={(event) => setCategoria(event.target.value as CategoriaOpcao)}
          >
            {CATEGORIAS.map((item) => (
              <option key={item.valor} value={item.valor}>
                {item.rotulo}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.campo}>
          <label htmlFor="valor">Valor</label>
          <input
            id="valor"
            className={styles.input}
            value={valor}
            onChange={(event) => setValor(event.target.value)}
            placeholder="Ex: Dell"
            required
          />
        </div>

        {categoria === 'MODELO' && (
          <div className={styles.campo}>
            <label htmlFor="dependencia">Marca vinculada</label>
            <select
              id="dependencia"
              className={styles.select}
              value={dependenciaId}
              onChange={(event) => setDependenciaId(event.target.value)}
            >
              <option value="">Nenhuma</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.valor}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className={styles.botaoAdicionar}>
          Adicionar
        </button>
      </form>

      <div className={styles.categorias}>
        {CATEGORIAS.map((item) => {
          const valores = opcoes[item.valor] ?? [];

          return (
            <div className={styles.categoriaCard} key={item.valor}>
              <h2 className={styles.categoriaTitulo}>{item.rotulo}</h2>

              {valores.length > 0 ? (
                <ul className={styles.lista}>
                  {valores.map((opcao) => (
                    <li className={styles.itemLista} key={opcao.id}>
                      <span className={styles.itemTexto}>{opcao.valor}</span>

                      <div className={styles.itemAcoes}>
                        <button
                          type="button"
                          className={styles.botaoAcao}
                          title="Editar"
                          onClick={() => handleEditar(opcao.id, opcao.valor)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className={styles.botaoAcao}
                          title="Excluir"
                          onClick={() => handleExcluir(opcao.id, opcao.valor)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.listaVazia}>Nenhum valor cadastrado.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

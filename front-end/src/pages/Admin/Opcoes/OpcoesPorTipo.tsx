import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { criarOpcao, editarOpcao, excluirOpcao, listarOpcoes } from '../../../services/opcoes';
import type { OpcoesAgrupadas, OpcaoItem } from '../../../services/opcoes';
import styles from './Opcoes.module.css';

export type TipoEquipamento = 'COMPUTADOR' | 'SWITCH' | 'CELULAR' | 'NVR_CAMERA';

export interface CategoriaConfig {
  valor: string;
  rotulo: string;
}

interface OpcoesPorTipoProps {
  titulo: string;
  subtitulo?: string;
  tipoEquipamento: TipoEquipamento;
  categorias: CategoriaConfig[];
}

export function OpcoesPorTipo({
  titulo,
  subtitulo,
  tipoEquipamento,
  categorias,
}: OpcoesPorTipoProps) {
  const [categoria, setCategoria] = useState<string>(categorias[0]?.valor ?? '');
  const [valor, setValor] = useState('');
  const [dependenciaId, setDependenciaId] = useState('');
  const [opcoes, setOpcoes] = useState<OpcoesAgrupadas>({});

  function carregarOpcoes() {
    listarOpcoes(tipoEquipamento)
      .then((dados) => setOpcoes(dados))
      .catch((erro) => console.error('Erro ao carregar opções:', erro));
  }

  useEffect(() => {
    carregarOpcoes();
  }, [tipoEquipamento]);

  useEffect(() => {
    setDependenciaId('');
  }, [categoria]);

  useEffect(() => {
    if (categorias.length > 0 && !categorias.some((c) => c.valor === categoria)) {
      setCategoria(categorias[0].valor);
    }
  }, [categorias, categoria]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!valor.trim() || !categoria) {
      return;
    }

    try {
      const depId = dependenciaId ? Number(dependenciaId) : null;
      await criarOpcao(categoria, valor.trim(), depId, tipoEquipamento);
      setValor('');
      setDependenciaId('');
      carregarOpcoes();
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao criar opção.');
    }
  }

  async function handleEditar(id: number, valorAtual: string) {
    const novoValor = prompt('Novo valor para a opção:', valorAtual);
    if (!novoValor || !novoValor.trim() || novoValor.trim() === valorAtual) {
      return;
    }

    try {
      await editarOpcao(id, novoValor.trim());
      carregarOpcoes();
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
      carregarOpcoes();
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao excluir opção.');
    }
  }

  const marcas = opcoes['MARCA'] ?? [];

  function renderItemLista(opcao: OpcaoItem) {
    return (
      <li className={styles.itemLista} key={opcao.id}>
        <span className={styles.itemTexto}>{opcao.valor}</span>

        <div className={styles.grupoAcoes}>
          <button
            type="button"
            className={styles.botaoIcone}
            title="Editar"
            onClick={() => handleEditar(opcao.id, opcao.valor)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </button>

          <button
            type="button"
            className={styles.botaoIcone}
            title="Excluir"
            onClick={() => handleExcluir(opcao.id, opcao.valor)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </li>
    );
  }

  return (
    <>
      <div className={styles.cabecalhoPagina}>
        <div>
          <h1 className={styles.tituloPagina}>{titulo}</h1>
          {subtitulo && <p className={styles.subtituloPagina}>{subtitulo}</p>}
        </div>
      </div>

      <form className={styles.formulario} onSubmit={handleSubmit}>
        <div className={styles.campo}>
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            className={styles.select}
            value={categoria}
            onChange={(event) => setCategoria(event.target.value)}
          >
            {categorias.map((item) => (
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
        {categorias.map((item) => {
          const valores = opcoes[item.valor] ?? [];

          if (item.valor === 'MODELO') {
            const gruposMap: Record<string, OpcaoItem[]> = {};
            valores.forEach((m) => {
              const marca = marcas.find((b) => b.id === m.dependencia_id);
              const chave = marca ? marca.valor : 'Sem marca vinculada';
              if (!gruposMap[chave]) {
                gruposMap[chave] = [];
              }
              gruposMap[chave].push(m);
            });

            const chavesOrdenadas = Object.keys(gruposMap).sort((a, b) => {
              if (a === 'Sem marca vinculada') return 1;
              if (b === 'Sem marca vinculada') return -1;
              return a.localeCompare(b);
            });

            return (
              <div className={styles.categoriaCard} key={item.valor}>
                <h2 className={styles.categoriaTitulo}>{item.rotulo}</h2>

                {valores.length > 0 ? (
                  chavesOrdenadas.map((chave) => (
                    <div key={chave} className={styles.subgrupo}>
                      <h3 className={styles.subgrupoTitulo}>{chave}</h3>
                      <ul className={styles.lista}>
                        {gruposMap[chave].map(renderItemLista)}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className={styles.listaVazia}>Nenhum valor cadastrado.</p>
                )}
              </div>
            );
          }

          return (
            <div className={styles.categoriaCard} key={item.valor}>
              <h2 className={styles.categoriaTitulo}>{item.rotulo}</h2>

              {valores.length > 0 ? (
                <ul className={styles.lista}>
                  {valores.map(renderItemLista)}
                </ul>
              ) : (
                <p className={styles.listaVazia}>Nenhum valor cadastrado.</p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

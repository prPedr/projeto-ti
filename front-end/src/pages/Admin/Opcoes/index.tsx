import { useEffect, useState } from 'react';
import type { SubmitEvent } from 'react';
import { criarOpcao, listarOpcoes } from '../../../services/opcoes';
import type { OpcoesAgrupadas } from '../../../services/opcoes';
import styles from './Opcoes.module.css';

type CategoriaOpcao = 'MARCA' | 'PROCESSADOR' | 'MEMORIA' | 'ARMAZENAMENTO';

const CATEGORIAS: Array<{ valor: CategoriaOpcao; rotulo: string }> = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'PROCESSADOR', rotulo: 'Processador' },
  { valor: 'MEMORIA', rotulo: 'Memória' },
  { valor: 'ARMAZENAMENTO', rotulo: 'Armazenamento' },
];

export default function Opcoes() {
  const [categoria, setCategoria] = useState<CategoriaOpcao>('MARCA');
  const [valor, setValor] = useState('');
  const [opcoes, setOpcoes] = useState<OpcoesAgrupadas>({});

  function carregarOpcoes() {
    listarOpcoes()
      .then((dados) => setOpcoes(dados))
      .catch((erro) => console.error('Erro ao carregar opções:', erro));
  }

  useEffect(() => {
    carregarOpcoes();
  }, []);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!valor.trim()) {
      return;
    }

    try {
      await criarOpcao(categoria, valor.trim());
      setValor('');
      carregarOpcoes();
    } catch (erro) {
      alert(erro instanceof Error ? erro.message : 'Erro ao adicionar opção.');
    }
  }

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
                  {valores.map((valorCadastrado) => (
                    <li className={styles.itemLista} key={valorCadastrado}>
                      {valorCadastrado}
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

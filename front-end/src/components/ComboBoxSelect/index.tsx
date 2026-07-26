import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './ComboBoxSelect.module.css';

export interface OpcaoComboBox {
  valor: string;
  rotulo?: string; // rotulo opcional, usa valor se ausente
}

export interface ComboBoxSelectProps {
  id: string;
  opcoes: OpcaoComboBox[];
  valor: string; // valor confirmado atual (controlado)
  aoMudar: (novoValor: string) => void;
  placeholder?: string;
  obrigatorio?: boolean;
  desabilitado?: boolean;
}

const removerAcentos = (texto: string): string => {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const obterRotuloOpcao = (opcao: OpcaoComboBox): string => {
  return opcao.rotulo ?? opcao.valor;
};

const encontrarOpcaoPorValor = (opcoes: OpcaoComboBox[], val: string): OpcaoComboBox | undefined => {
  return opcoes.find((op) => op.valor === val);
};

const encontrarOpcaoPorTextoExato = (opcoes: OpcaoComboBox[], texto: string): OpcaoComboBox | undefined => {
  const textoLimpo = removerAcentos(texto.trim()).toLowerCase();
  return opcoes.find((op) => {
    const rotulo = removerAcentos(obterRotuloOpcao(op)).toLowerCase();
    const valor = removerAcentos(op.valor).toLowerCase();
    return rotulo === textoLimpo || valor === textoLimpo;
  });
};

export const ComboBoxSelect: React.FC<ComboBoxSelectProps> = ({
  id,
  opcoes,
  valor,
  aoMudar,
  placeholder,
  obrigatorio = false,
  desabilitado = false,
}) => {
  const [textoInput, setTextoInput] = useState<string>('');
  const [estaAberto, setEstaAberto] = useState<boolean>(false);
  const [indiceDestacado, setIndiceDestacado] = useState<number | null>(null);

  const conteinerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const semOpcoes = opcoes.length === 0;
  const campoDesabilitado = desabilitado || semOpcoes;
  const placeholderExibido = semOpcoes ? 'Nenhuma opção cadastrada' : placeholder;

  // Sincroniza o texto do input com a prop `valor` quando ela muda ou as `opcoes` mudam
  useEffect(() => {
    if (!valor) {
      setTextoInput('');
      return;
    }
    const opcaoAtual = encontrarOpcaoPorValor(opcoes, valor);
    if (opcaoAtual) {
      setTextoInput(obterRotuloOpcao(opcaoAtual));
    } else {
      setTextoInput('');
    }
  }, [valor, opcoes]);

  // Filtra até 8 opções baseando-se no texto digitado (case-insensitive, sem acentos)
  const opcoesFiltradas = useMemo(() => {
    if (!textoInput.trim()) {
      return opcoes.slice(0, 8);
    }
    const busca = removerAcentos(textoInput.trim()).toLowerCase();
    return opcoes
      .filter((op) => {
        const rotulo = removerAcentos(obterRotuloOpcao(op)).toLowerCase();
        const val = removerAcentos(op.valor).toLowerCase();
        return rotulo.includes(busca) || val.includes(busca);
      })
      .slice(0, 8);
  }, [opcoes, textoInput]);

  // Garante visualização do item destacado durante a navegação com teclado
  useEffect(() => {
    if (estaAberto && indiceDestacado !== null && listboxRef.current) {
      const itemEl = listboxRef.current.children[indiceDestacado] as HTMLElement;
      if (itemEl && typeof itemEl.scrollIntoView === 'function') {
        itemEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [indiceDestacado, estaAberto]);

  const confirmarSelecao = (opcao: OpcaoComboBox) => {
    aoMudar(opcao.valor);
    setTextoInput(obterRotuloOpcao(opcao));
    setEstaAberto(false);
    setIndiceDestacado(null);
  };

  const validarEReverter = () => {
    const textoLimpo = textoInput.trim();

    if (!textoLimpo) {
      if (!obrigatorio) {
        aoMudar('');
        setTextoInput('');
      } else {
        const opcaoAtual = valor ? encontrarOpcaoPorValor(opcoes, valor) : undefined;
        setTextoInput(opcaoAtual ? obterRotuloOpcao(opcaoAtual) : '');
      }
      setEstaAberto(false);
      setIndiceDestacado(null);
      return;
    }

    const opcaoExata = encontrarOpcaoPorTextoExato(opcoes, textoLimpo);
    if (opcaoExata) {
      confirmarSelecao(opcaoExata);
    } else {
      // Reverte para o último valor confirmado se existir opção correspondente
      const opcaoAtual = valor ? encontrarOpcaoPorValor(opcoes, valor) : undefined;
      setTextoInput(opcaoAtual ? obterRotuloOpcao(opcaoAtual) : '');
      setEstaAberto(false);
      setIndiceDestacado(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoTexto = e.target.value;
    setTextoInput(novoTexto);
    setEstaAberto(true);
    setIndiceDestacado(0);
  };

  const handleInputFocus = () => {
    if (!campoDesabilitado) {
      setEstaAberto(true);
      setIndiceDestacado(0);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Evita validação precoce se o foco se moveu para dentro do próprio container
    if (conteinerRef.current && conteinerRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    validarEReverter();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (campoDesabilitado) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!estaAberto) {
        setEstaAberto(true);
        setIndiceDestacado(0);
      } else if (opcoesFiltradas.length > 0) {
        setIndiceDestacado((prev) =>
          prev === null || prev >= opcoesFiltradas.length - 1 ? 0 : prev + 1
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (estaAberto && opcoesFiltradas.length > 0) {
        setIndiceDestacado((prev) =>
          prev === null || prev <= 0 ? opcoesFiltradas.length - 1 : prev - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (estaAberto) {
        e.preventDefault();
        if (indiceDestacado !== null && opcoesFiltradas[indiceDestacado]) {
          confirmarSelecao(opcoesFiltradas[indiceDestacado]);
        } else {
          validarEReverter();
        }
      }
    } else if (e.key === 'Escape') {
      if (estaAberto) {
        e.preventDefault();
        validarEReverter();
      }
    }
  };

  const handleLimpar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    aoMudar('');
    setTextoInput('');
    setEstaAberto(false);
    setIndiceDestacado(null);
  };

  return (
    <div ref={conteinerRef} className={styles.conteiner}>
      <div className={styles.inputConteiner}>
        <input
          id={id}
          type="text"
          role="combobox"
          className={styles.input}
          value={textoInput}
          placeholder={placeholderExibido}
          disabled={campoDesabilitado}
          required={obrigatorio}
          autoComplete="off"
          aria-expanded={estaAberto}
          aria-haspopup="listbox"
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            estaAberto && indiceDestacado !== null && opcoesFiltradas[indiceDestacado]
              ? `${id}-opcao-${indiceDestacado}`
              : undefined
          }
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
        />
        {textoInput && !campoDesabilitado && (
          <button
            type="button"
            className={styles.botaoLimpar}
            onMouseDown={handleLimpar}
            aria-label="Limpar campo"
            tabIndex={-1}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <div className={`${styles.iconeSeta} ${estaAberto ? styles.iconeSetaAberto : ''}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {estaAberto && !campoDesabilitado && (
        <ul id={`${id}-listbox`} ref={listboxRef} role="listbox" className={styles.dropdown}>
          {opcoesFiltradas.length > 0 ? (
            opcoesFiltradas.map((opcao, index) => {
              const estaDestacado = index === indiceDestacado;
              const rotulo = obterRotuloOpcao(opcao);
              return (
                <li
                  key={`${opcao.valor}-${index}`}
                  id={`${id}-opcao-${index}`}
                  role="option"
                  aria-selected={estaDestacado}
                  className={`${styles.opcao} ${estaDestacado ? styles.opcaoDestacada : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Impede perda de foco do input antes de confirmar
                    confirmarSelecao(opcao);
                  }}
                  onMouseEnter={() => setIndiceDestacado(index)}
                >
                  {rotulo}
                </li>
              );
            })
          ) : (
            <li className={styles.semResultados}>Nenhuma opção encontrada</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ComboBoxSelect;

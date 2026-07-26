import React, { useEffect, useRef } from 'react';
import styles from './ModalConfirmacao.module.css';

export interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
  variante?: 'padrao' | 'perigo';
}

export default function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  aoConfirmar,
  aoCancelar,
  variante = 'padrao',
}: ModalConfirmacaoProps) {
  const botaoCancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        aoCancelar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      botaoCancelarRef.current?.focus();
    }, 0);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [aberto, aoCancelar]);

  if (!aberto) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={aoCancelar}>
      <div
        className={styles.cartao}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirmacao-titulo"
      >
        <h2 id="modal-confirmacao-titulo" className={styles.titulo}>
          {titulo}
        </h2>
        <p className={styles.mensagem}>{mensagem}</p>

        <div className={styles.botoes}>
          <button
            ref={botaoCancelarRef}
            type="button"
            className={styles.botaoCancelar}
            onClick={aoCancelar}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className={`${styles.botaoConfirmar} ${
              variante === 'perigo' ? styles.botaoPerigo : ''
            }`}
            onClick={aoConfirmar}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

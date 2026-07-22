import { Link } from 'react-router-dom';
import styles from './Opcoes.module.css';

interface ItemHub {
  to: string;
  titulo: string;
  inicial: string;
  descricao: string;
}

const ITENS_HUB: ItemHub[] = [
  {
    to: '/admin/opcoes/computadores',
    titulo: 'Computadores',
    inicial: 'C',
    descricao: 'Marcas, modelos, processadores, memórias e armazenamentos.',
  },
  {
    to: '/admin/opcoes/switches',
    titulo: 'Switches',
    inicial: 'S',
    descricao: 'Marcas e modelos para switches e equipamentos de rede.',
  },
  {
    to: '/admin/opcoes/celulares',
    titulo: 'Celulares',
    inicial: 'M',
    descricao: 'Marcas, modelos, operadoras e sistemas operacionais de celulares.',
  },
  {
    to: '/admin/opcoes/nvr-camera',
    titulo: 'NVR / Câmeras',
    inicial: 'V',
    descricao: 'Marcas e modelos para equipamentos e gravadores de CFTV.',
  },
];

export default function OpcoesHub() {
  return (
    <>
      <div className={styles.cabecalhoPagina}>
        <div>
          <h1 className={styles.tituloPagina}>Opções Pré-definidas</h1>
          <p className={styles.subtituloPagina}>
            Selecione o tipo de equipamento para gerenciar as opções sugeridas no cadastro
          </p>
        </div>
      </div>

      <div className={styles.hubGrid}>
        {ITENS_HUB.map((item) => (
          <Link key={item.to} to={item.to} className={styles.hubCard}>
            <div className={styles.hubCardIcone}>{item.inicial}</div>
            <h2 className={styles.hubCardTitulo}>{item.titulo}</h2>
            <p className={styles.hubCardDescricao}>{item.descricao}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

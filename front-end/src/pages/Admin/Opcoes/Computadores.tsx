import { OpcoesPorTipo } from './OpcoesPorTipo';

const CATEGORIAS_COMPUTADORES = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
  { valor: 'PROCESSADOR', rotulo: 'Processador' },
  { valor: 'MEMORIA', rotulo: 'Memória' },
  { valor: 'ARMAZENAMENTO', rotulo: 'Armazenamento' },
];

export default function ComputadoresOpcoes() {
  return (
    <OpcoesPorTipo
      titulo="Opções de Computadores"
      subtitulo="Gerencie as marcas, modelos, processadores, memórias e armazenamentos sugeridos"
      tipoEquipamento="COMPUTADOR"
      categorias={CATEGORIAS_COMPUTADORES}
    />
  );
}

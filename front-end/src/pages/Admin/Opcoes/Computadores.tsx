import { OpcoesPorTipo } from './OpcoesPorTipo';

const CATEGORIAS_COMPUTADORES = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
  { valor: 'PROCESSADOR', rotulo: 'Processador' },
  { valor: 'MEMORIA', rotulo: 'Memória' },
  { valor: 'ARMAZENAMENTO', rotulo: 'Armazenamento' },
  { valor: 'SISTEMA_OPERACIONAL', rotulo: 'Sistema Operacional' },
  { valor: 'TIPO_INTERFACE', rotulo: 'Tipo de Interface de Rede' },
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

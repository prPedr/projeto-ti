import { OpcoesPorTipo } from './OpcoesPorTipo';

const CATEGORIAS_SWITCHES = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
];

export default function SwitchesOpcoes() {
  return (
    <OpcoesPorTipo
      titulo="Opções de Switches"
      subtitulo="Gerencie as marcas e modelos pré-definidos para switches de rede"
      tipoEquipamento="SWITCH"
      categorias={CATEGORIAS_SWITCHES}
    />
  );
}

import { OpcoesPorTipo } from './OpcoesPorTipo';

const CATEGORIAS_IMPRESSORAS = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
  { valor: 'TIPO_INTERFACE', rotulo: 'Tipo de Interface de Rede' },
];

export default function ImpressorasOpcoes() {
  return (
    <OpcoesPorTipo
      titulo="Opções de Impressoras"
      subtitulo="Gerencie marcas, modelos e tipos de interface de rede para impressoras"
      tipoEquipamento="IMPRESSORA"
      categorias={CATEGORIAS_IMPRESSORAS}
    />
  );
}

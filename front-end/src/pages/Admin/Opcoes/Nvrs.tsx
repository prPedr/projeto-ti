import { OpcoesPorTipo } from './OpcoesPorTipo';

const CATEGORIAS_NVRS = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
  { valor: 'TIPO_INTERFACE', rotulo: 'Tipo de Interface de Rede' },
];

export default function NvrsOpcoes() {
  return (
    <OpcoesPorTipo
      titulo="Opções — NVRs"
      subtitulo="Gerencie marcas, modelos e tipos de interface de rede para gravadores NVR"
      tipoEquipamento="NVR"
      categorias={CATEGORIAS_NVRS}
    />
  );
}

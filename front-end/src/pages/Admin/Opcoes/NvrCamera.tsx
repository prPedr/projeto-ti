import { OpcoesPorTipo } from './OpcoesPorTipo';

const CATEGORIAS_NVR_CAMERA = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
];

export default function NvrCameraOpcoes() {
  return (
    <OpcoesPorTipo
      titulo="Opções de NVR / Câmeras"
      subtitulo="Gerencie marcas e modelos de equipamentos de CFTV (NVRs e Câmeras)"
      tipoEquipamento="NVR_CAMERA"
      categorias={CATEGORIAS_NVR_CAMERA}
    />
  );
}

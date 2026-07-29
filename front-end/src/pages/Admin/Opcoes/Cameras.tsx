import { OpcoesPorTipo } from './OpcoesPorTipo';

const CATEGORIAS_CAMERAS = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
  { valor: 'TIPO_INTERFACE', rotulo: 'Tipo de Interface de Rede' },
];

export default function CamerasOpcoes() {
  return (
    <OpcoesPorTipo
      titulo="Opções — Câmeras"
      subtitulo="Gerencie marcas, modelos e tipos de interface de rede para câmeras IP/CFTV"
      tipoEquipamento="CAMERA"
      categorias={CATEGORIAS_CAMERAS}
    />
  );
}

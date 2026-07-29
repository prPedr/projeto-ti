import { OpcoesPorTipo } from './OpcoesPorTipo';

const CATEGORIAS_ANTENAS = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
  { valor: 'TIPO_INTERFACE', rotulo: 'Tipo de Interface de Rede' },
];

export default function AntenasOpcoes() {
  return (
    <OpcoesPorTipo
      titulo="Opções — Antenas Wi-Fi"
      subtitulo="Gerencie marcas, modelos e tipos de interface de rede para antenas e APs"
      tipoEquipamento="ANTENA"
      categorias={CATEGORIAS_ANTENAS}
    />
  );
}

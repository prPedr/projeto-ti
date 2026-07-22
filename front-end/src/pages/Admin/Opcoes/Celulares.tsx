import { OpcoesPorTipo } from './OpcoesPorTipo';

const CATEGORIAS_CELULARES = [
  { valor: 'MARCA', rotulo: 'Marca' },
  { valor: 'MODELO', rotulo: 'Modelo' },
  { valor: 'OPERADORA', rotulo: 'Operadora' },
  { valor: 'SISTEMA_OPERACIONAL', rotulo: 'Sistema Operacional' },
];

export default function CelularesOpcoes() {
  return (
    <OpcoesPorTipo
      titulo="Opções de Celulares"
      subtitulo="Gerencie marcas, modelos, operadoras e sistemas operacionais de celulares"
      tipoEquipamento="CELULAR"
      categorias={CATEGORIAS_CELULARES}
    />
  );
}

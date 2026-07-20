export function formatarMAC(valor: string): string {
  const hex = valor.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 12);
  const grupos = hex.match(/.{1,2}/g) ?? [];
  return grupos.join(':');
}

export function formatarIMEI(valor: string): string {
  return valor.replace(/\D/g, '').slice(0, 15);
}

export function formatarIP(valor: string): string {
  return valor.replace(/[^0-9.]/g, '');
}

export function formatarTag(valor: string): string {
  return valor.replace(/\s/g, '').toUpperCase().slice(0, 20);
}

export enum InsertionMode {
  STRUCTURAL = 'structural', // Para peças estruturais (laterais, fundo, tampo)
  INTERNAL = 'internal'      // Para peças internas (prateleiras, divisórias)
}

export interface InsertionContext {
  mode: InsertionMode;
}

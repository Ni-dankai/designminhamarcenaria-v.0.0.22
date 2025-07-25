export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export enum PieceType {
  LATERAL_LEFT = 'lateral_left',
  LATERAL_RIGHT = 'lateral_right',
  LATERAL_FRONT = 'lateral_front',
  LATERAL_BACK = 'lateral_back',
  BOTTOM = 'bottom',
  TOP = 'top',
  SHELF = 'shelf',
  DIVIDER_VERTICAL = 'divider_vertical',
  // DIVIDER_HORIZONTAL = 'divider_horizontal', // Removido: redundante com SHELF
}

export interface FurniturePiece {
  id: string;
  type: PieceType;
  dimensions: Dimensions;
  position: Position;
  thickness: number;
  color: string;
  name: string;
  parentSpaceId?: string; // Adicionado para ancestralidade de subSpace
}

export interface FurnitureSpace {
  id: string;
  originalDimensions: Dimensions;
  currentDimensions: Dimensions;
  position: Position;
  pieces: FurniturePiece[];
  name: string;
  subSpaces?: FurnitureSpace[]; // Espaços criados após divisões
  parentSpaceId?: string; // ID do espaço pai
  isActive?: boolean; // Se o espaço está ativo (não foi dividido)
  createdByPieceId?: string; // ID da peça que originou este subespaço
}

export interface CutResult {
  remainingSpace: Dimensions;
  cutPosition: Position;
  dividedSpaces?: FurnitureSpace[]; // Novos espaços criados pela divisão
}

export interface SpaceDivisionResult {
  dividedSpaces: FurnitureSpace[];
  insertedPiece: FurniturePiece;
}

export interface PieceConfiguration {
  type: PieceType;
  name: string;
  defaultThickness: number;
  color: string;
  description: string;
}

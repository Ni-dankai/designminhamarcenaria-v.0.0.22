import { Dimensions, Position, FurniturePiece, FurnitureSpace, PieceType, CutResult } from '../types/furniture';

export class SpaceCuttingSystem {
  /**
   * Calcula o corte que uma peça faz no espaço
   */
  static calculateCut(space: FurnitureSpace, piece: FurniturePiece): CutResult {
    const { currentDimensions } = space;
    const { type, thickness } = piece;

    let remainingSpace: Dimensions = { ...currentDimensions };
    let cutPosition: Position = { x: 0, y: 0, z: 0 }; // Espaço nunca se move

    switch (type) {
      case PieceType.LATERAL_LEFT:
        remainingSpace.width -= thickness;
        break;

      case PieceType.LATERAL_RIGHT:
        remainingSpace.width -= thickness;
        break;

      case PieceType.LATERAL_FRONT:
        remainingSpace.depth -= thickness;
        break;

      case PieceType.LATERAL_BACK:
        remainingSpace.depth -= thickness;
        break;

      case PieceType.BOTTOM:
        remainingSpace.height -= thickness;
        break;

      case PieceType.TOP:
        remainingSpace.height -= thickness;
        break;

      case PieceType.SHELF:
        // Prateleira não reduz o espaço geral, apenas divide verticalmente
        break;

      case PieceType.DIVIDER_VERTICAL:
        // Divisória vertical divide o espaço horizontalmente
        break;

      default:
        break;
    }

    return { remainingSpace, cutPosition };
  }

  /**
   * Calcula a posição onde uma peça deve ser colocada no espaço
   */
  static calculatePiecePosition(space: FurnitureSpace, piece: FurniturePiece): Position {
    const { originalDimensions } = space;
    const { type, thickness } = piece;
    
    // Posição base do espaço (sempre 0,0,0 para o espaço original)
    const baseX = 0;
    const baseY = 0; 
    const baseZ = 0;

    let piecePosition: Position = { x: baseX, y: baseY, z: baseZ };

    // Contar quantas peças do mesmo tipo já existem para posicionar corretamente
    const existingPiecesOfSameType = space.pieces.filter(p => p.type === type);
    const offset = existingPiecesOfSameType.length;

    switch (type) {
      case PieceType.LATERAL_LEFT:
        // Lateral esquerda: posicionada na borda esquerda do móvel
        piecePosition.x = baseX - thickness - (offset * thickness);
        piecePosition.y = baseY;
        piecePosition.z = baseZ;
        break;

      case PieceType.LATERAL_RIGHT:
        // Lateral direita: posicionada na borda direita do móvel
        piecePosition.x = baseX + originalDimensions.width + (offset * thickness);
        piecePosition.y = baseY;
        piecePosition.z = baseZ;
        break;

      case PieceType.LATERAL_FRONT:
        // Lateral frontal: posicionada na borda frontal do móvel
        piecePosition.x = baseX;
        piecePosition.y = baseY;
        piecePosition.z = baseZ - thickness - (offset * thickness);
        break;

      case PieceType.LATERAL_BACK:
        // Lateral traseira: posicionada na borda traseira do móvel
        piecePosition.x = baseX;
        piecePosition.y = baseY;
        piecePosition.z = baseZ + originalDimensions.depth + (offset * thickness);
        break;

      case PieceType.BOTTOM:
        // Fundo: posicionado na parte inferior do móvel
        piecePosition.x = baseX;
        piecePosition.y = baseY - thickness - (offset * thickness);
        piecePosition.z = baseZ;
        break;

      case PieceType.TOP:
        // Tampo: posicionado na parte superior do móvel
        piecePosition.x = baseX;
        piecePosition.y = baseY + originalDimensions.height + (offset * thickness);
        piecePosition.z = baseZ;
        break;

      case PieceType.SHELF:
        // Prateleiras: distribuídas verticalmente dentro do espaço
        const shelfSpacing = space.currentDimensions.height / (existingPiecesOfSameType.length + 2);
        piecePosition.x = space.position.x;
        piecePosition.y = space.position.y + shelfSpacing * (offset + 1);
        piecePosition.z = space.position.z;
        break;

      case PieceType.DIVIDER_VERTICAL:
        // Divisórias verticais: distribuídas horizontalmente dentro do espaço
        const dividerSpacing = space.currentDimensions.width / (existingPiecesOfSameType.length + 2);
        piecePosition.x = space.position.x + dividerSpacing * (offset + 1);
        piecePosition.y = space.position.y;
        piecePosition.z = space.position.z;
        break;

      default:
        break;
    }

    return piecePosition;
  }

  /**
   * Calcula as dimensões que uma peça deve ter baseado no espaço original
   */
  static calculatePieceDimensions(space: FurnitureSpace, pieceType: PieceType, thickness: number): Dimensions {
    const { originalDimensions } = space;

    switch (pieceType) {
      case PieceType.LATERAL_LEFT:
      case PieceType.LATERAL_RIGHT:
        return {
          width: thickness,
          height: originalDimensions.height, // Apenas a altura do móvel
          depth: originalDimensions.depth, // Apenas a profundidade do móvel
        };

      case PieceType.LATERAL_FRONT:
      case PieceType.LATERAL_BACK:
        return {
          width: originalDimensions.width, // Largura do móvel
          height: originalDimensions.height, // Altura do móvel
          depth: thickness,
        };

      case PieceType.BOTTOM:
      case PieceType.TOP:
        return {
          width: originalDimensions.width,
          height: thickness,
          depth: originalDimensions.depth,
        };

      case PieceType.SHELF:
        return {
          width: space.currentDimensions.width, // Usa o espaço interno disponível
          height: thickness,
          depth: space.currentDimensions.depth, // Usa o espaço interno disponível
        };

      case PieceType.DIVIDER_VERTICAL:
        return {
          width: thickness,
          height: space.currentDimensions.height, // Usa o espaço interno disponível
          depth: space.currentDimensions.depth, // Usa o espaço interno disponível
        };

      default:
        return { width: 0, height: 0, depth: 0 };
    }
  }

  /**
   * Aplica um corte ao espaço e atualiza suas dimensões
   */
  static applyCutToSpace(space: FurnitureSpace, piece: FurniturePiece): FurnitureSpace {
    const cutResult = this.calculateCut(space, piece);
    const piecePosition = this.calculatePiecePosition(space, piece);
    
    const updatedPiece: FurniturePiece = {
      ...piece,
      position: piecePosition,
      dimensions: this.calculatePieceDimensions(space, piece.type, piece.thickness),
    };

    // O espaço SEMPRE mantém sua posição original (0,0,0)
    // Apenas reduz de tamanho, nunca se move
    const newSpacePosition = { x: 0, y: 0, z: 0 };

    return {
      ...space,
      currentDimensions: cutResult.remainingSpace,
      position: newSpacePosition,
      pieces: [...space.pieces, updatedPiece],
    };
  }
}

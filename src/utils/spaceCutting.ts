import { Dimensions, Position, FurniturePiece, FurnitureSpace, PieceType, CutResult } from '../types/furniture';

export class SpaceCuttingSystem {
  /**
   * Verifica se duas peças colidem no espaço 3D
   */
  static checkCollision(piece1: FurniturePiece, piece2: FurniturePiece): boolean {
    const p1 = piece1.position;
    const d1 = piece1.dimensions;
    const p2 = piece2.position;
    const d2 = piece2.dimensions;

    // Calcular limites das peças (min e max em cada eixo)
    const p1_min_x = p1.x - d1.width / 2;
    const p1_max_x = p1.x + d1.width / 2;
    const p1_min_y = p1.y - d1.height / 2;
    const p1_max_y = p1.y + d1.height / 2;
    const p1_min_z = p1.z - d1.depth / 2;
    const p1_max_z = p1.z + d1.depth / 2;

    const p2_min_x = p2.x - d2.width / 2;
    const p2_max_x = p2.x + d2.width / 2;
    const p2_min_y = p2.y - d2.height / 2;
    const p2_max_y = p2.y + d2.height / 2;
    const p2_min_z = p2.z - d2.depth / 2;
    const p2_max_z = p2.z + d2.depth / 2;

    // Verificar se há sobreposição em todos os três eixos
    const overlapX = p1_max_x > p2_min_x && p1_min_x < p2_max_x;
    const overlapY = p1_max_y > p2_min_y && p1_min_y < p2_max_y;
    const overlapZ = p1_max_z > p2_min_z && p1_min_z < p2_max_z;

    const hasCollision = overlapX && overlapY && overlapZ;

    if (hasCollision) {
      console.warn(`🚨 Colisão detectada entre ${piece1.name} e ${piece2.name}`);
      console.log('Detalhes da colisão:', {
        piece1: {
          name: piece1.name,
          position: p1,
          dimensions: d1,
          bounds: { min_x: p1_min_x, max_x: p1_max_x, min_y: p1_min_y, max_y: p1_max_y, min_z: p1_min_z, max_z: p1_max_z }
        },
        piece2: {
          name: piece2.name,
          position: p2,
          dimensions: d2,
          bounds: { min_x: p2_min_x, max_x: p2_max_x, min_y: p2_min_y, max_y: p2_max_y, min_z: p2_min_z, max_z: p2_max_z }
        },
        overlaps: { x: overlapX, y: overlapY, z: overlapZ }
      });
    }

    return hasCollision;
  }

  /**
   * Verifica se uma peça colidirá com peças existentes
   */
  static checkCollisionWithExistingPieces(newPiece: FurniturePiece, existingPieces: FurniturePiece[]): boolean {
    for (const existingPiece of existingPieces) {
      if (this.checkCollision(newPiece, existingPiece)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calcula uma posição ajustada para evitar colisões
   */
  static calculateCollisionFreePosition(space: FurnitureSpace, piece: FurniturePiece): Position {
    const originalPosition = this.calculatePiecePosition(space, piece);
    
    // Criar uma cópia temporária da peça com posição e dimensões
    const tempPiece: FurniturePiece = {
      ...piece,
      position: originalPosition,
      dimensions: this.calculatePieceDimensions(space, piece.type, piece.thickness),
    };

    // Verificar se há colisão com peças existentes
    const hasCollision = this.checkCollisionWithExistingPieces(tempPiece, space.pieces);
    
    if (!hasCollision) {
      return originalPosition;
    }

    // Se há colisão, calcular nova posição baseada no tipo de peça
    return this.adjustPositionForCollisionAvoidance(space, tempPiece);
  }

  /**
   * Ajusta a posição de uma peça para evitar colisões
   */
  static adjustPositionForCollisionAvoidance(space: FurnitureSpace, piece: FurniturePiece): Position {
    const { type } = piece;
    let adjustedPosition = { ...piece.position };

    console.log(`🔄 Ajustando posição de ${piece.name} para evitar colisão`);

    switch (type) {
      case PieceType.LATERAL_LEFT:
        // Para laterais esquerdas, empilhar da direita para a esquerda
        const leftLaterals = space.pieces.filter(p => p.type === PieceType.LATERAL_LEFT);
        if (leftLaterals.length > 0) {
          // Ordenar por posição X (da direita para a esquerda)
          const sortedLeftLaterals = leftLaterals.sort((a, b) => b.position.x - a.position.x);
          const rightmostLeft = sortedLeftLaterals[0];
          // Posicionar à esquerda da última lateral, com pequeno gap para evitar sobreposição
          adjustedPosition.x = rightmostLeft.position.x - rightmostLeft.dimensions.width / 2 - piece.dimensions.width / 2 - 1;
        }
        break;

      case PieceType.LATERAL_RIGHT:
        // Para laterais direitas, empilhar da esquerda para a direita
        const rightLaterals = space.pieces.filter(p => p.type === PieceType.LATERAL_RIGHT);
        if (rightLaterals.length > 0) {
          // Ordenar por posição X (da esquerda para a direita)
          const sortedRightLaterals = rightLaterals.sort((a, b) => a.position.x - b.position.x);
          const leftmostRight = sortedRightLaterals[0];
          // Posicionar à direita da última lateral, com pequeno gap para evitar sobreposição
          adjustedPosition.x = leftmostRight.position.x + leftmostRight.dimensions.width / 2 + piece.dimensions.width / 2 + 1;
        }
        break;

      case PieceType.LATERAL_FRONT:
        // Para laterais frontais, empilhar de trás para frente
        const frontLaterals = space.pieces.filter(p => p.type === PieceType.LATERAL_FRONT);
        if (frontLaterals.length > 0) {
          // Ordenar por posição Z (de trás para frente)
          const sortedFrontLaterals = frontLaterals.sort((a, b) => b.position.z - a.position.z);
          const backmostFront = sortedFrontLaterals[0];
          // Posicionar à frente da última lateral, com pequeno gap
          adjustedPosition.z = backmostFront.position.z - backmostFront.dimensions.depth / 2 - piece.dimensions.depth / 2 - 1;
        }
        break;

      case PieceType.LATERAL_BACK:
        // Para laterais traseiras, empilhar de frente para trás
        const backLaterals = space.pieces.filter(p => p.type === PieceType.LATERAL_BACK);
        if (backLaterals.length > 0) {
          // Ordenar por posição Z (de frente para trás)
          const sortedBackLaterals = backLaterals.sort((a, b) => a.position.z - b.position.z);
          const frontmostBack = sortedBackLaterals[0];
          // Posicionar atrás da última lateral, com pequeno gap
          adjustedPosition.z = frontmostBack.position.z + frontmostBack.dimensions.depth / 2 + piece.dimensions.depth / 2 + 1;
        }
        break;

      case PieceType.BOTTOM:
        // Para fundos, empilhar de cima para baixo
        const bottomPieces = space.pieces.filter(p => p.type === PieceType.BOTTOM);
        if (bottomPieces.length > 0) {
          // Ordenar por posição Y (de cima para baixo)
          const sortedBottoms = bottomPieces.sort((a, b) => b.position.y - a.position.y);
          const topmostBottom = sortedBottoms[0];
          // Posicionar abaixo do último fundo, com pequeno gap
          adjustedPosition.y = topmostBottom.position.y - topmostBottom.dimensions.height / 2 - piece.dimensions.height / 2 - 1;
        }
        break;

      case PieceType.TOP:
        // Para tampos, empilhar de baixo para cima
        const topPieces = space.pieces.filter(p => p.type === PieceType.TOP);
        if (topPieces.length > 0) {
          // Ordenar por posição Y (de baixo para cima)
          const sortedTops = topPieces.sort((a, b) => a.position.y - b.position.y);
          const bottommostTop = sortedTops[0];
          // Posicionar acima do último tampo, com pequeno gap
          adjustedPosition.y = bottommostTop.position.y + bottommostTop.dimensions.height / 2 + piece.dimensions.height / 2 + 1;
        }
        break;

      default:
        // Para peças internas, manter posição original (divisão de espaço resolve isso)
        break;
    }

    console.log(`✅ Nova posição ajustada:`, adjustedPosition);
    return adjustedPosition;
  }

  /**
   * Verifica se uma peça está dentro dos limites do espaço
   * Para peças estruturais, permite posicionamento nas bordas e até ligeiramente fora
   */
  static isPieceWithinSpace(space: FurnitureSpace, piece: FurniturePiece): boolean {
    const p_pos = piece.position;
    const s_pos = space.position;
    const s_dims = space.currentDimensions;

    const bounds = {
        left: s_pos.x - s_dims.width / 2,
        right: s_pos.x + s_dims.width / 2,
        bottom: s_pos.y - s_dims.height / 2,
        top: s_pos.y + s_dims.height / 2,
    };

    const tolerance = 0.1; // Tolerância para erros de ponto flutuante
    return (
        p_pos.x >= bounds.left - tolerance && p_pos.x <= bounds.right + tolerance &&
        p_pos.y >= bounds.bottom - tolerance && p_pos.y <= bounds.top + tolerance
    );
  }

  /**
   * Verifica se uma peça está dentro dos limites do espaço
   * Para peças estruturais, permite posicionamento nas bordas e até ligeiramente fora
   */
  static isPieceWithinSpaceBounds(space: FurnitureSpace, piece: FurniturePiece): boolean {
    const { type } = piece;
    
    // Para peças estruturais, usar limites baseados no espaço atual
    const isStructuralPiece = [
      PieceType.LATERAL_LEFT,
      PieceType.LATERAL_RIGHT,
      PieceType.LATERAL_FRONT,
      PieceType.LATERAL_BACK,
      PieceType.BOTTOM,
      PieceType.TOP
    ].includes(type);

    if (isStructuralPiece) {
      // Para peças estruturais em espaços internos (subdivisions), ser mais flexível
      // Laterais podem se estender além dos limites do espaço selecionado
      const isLateralPiece = [PieceType.LATERAL_LEFT, PieceType.LATERAL_RIGHT].includes(type);
      const isFrontalPiece = [PieceType.LATERAL_FRONT, PieceType.LATERAL_BACK].includes(type);
      
      // Margem generosa para peças estruturais em espaços internos
      const margin = isLateralPiece || isFrontalPiece ? 50 : 5;
      
      const spaceMinX = space.position.x - space.currentDimensions.width / 2 - margin;
      const spaceMaxX = space.position.x + space.currentDimensions.width / 2 + margin;
      const spaceMinY = space.position.y - space.currentDimensions.height / 2 - margin;
      const spaceMaxY = space.position.y + space.currentDimensions.height / 2 + margin;
      const spaceMinZ = space.position.z - space.currentDimensions.depth / 2 - margin;
      const spaceMaxZ = space.position.z + space.currentDimensions.depth / 2 + margin;

      const pieceMinX = piece.position.x - piece.dimensions.width / 2;
      const pieceMaxX = piece.position.x + piece.dimensions.width / 2;
      const pieceMinY = piece.position.y - piece.dimensions.height / 2;
      const pieceMaxY = piece.position.y + piece.dimensions.height / 2;
      const pieceMinZ = piece.position.z - piece.dimensions.depth / 2;
      const pieceMaxZ = piece.position.z + piece.dimensions.depth / 2;

      // Para laterais e frontais, verificar apenas se a peça intersecta com o espaço
      // ao invés de estar completamente dentro dele
      if (isLateralPiece || isFrontalPiece) {
        // Verificar se há interseção com o espaço (não precisa estar completamente dentro)
        const intersectsX = pieceMaxX > spaceMinX && pieceMinX < spaceMaxX;
        const intersectsY = pieceMaxY > spaceMinY && pieceMinY < spaceMaxY;
        const intersectsZ = pieceMaxZ > spaceMinZ && pieceMinZ < spaceMaxZ;
        
        const hasIntersection = intersectsX && intersectsY && intersectsZ;
        
        if (!hasIntersection) {
          console.warn(`🚫 Peça estrutural ${piece.name} não intersecta com o espaço selecionado`);
          console.log('Espaço atual:', {
            position: space.position,
            dimensions: space.currentDimensions
          });
          console.log('Limites do espaço (com margem):', { spaceMinX, spaceMaxX, spaceMinY, spaceMaxY, spaceMinZ, spaceMaxZ });
          console.log('Limites da peça:', { pieceMinX, pieceMaxX, pieceMinY, pieceMaxY, pieceMinZ, pieceMaxZ });
        } else {
          console.log(`✅ Peça estrutural ${piece.name} intersecta corretamente com o espaço`);
        }
        
        return hasIntersection;
      } else {
        // Para outras peças estruturais (bottom, top), usar verificação tradicional
        const withinBounds = 
          pieceMinX >= spaceMinX && pieceMaxX <= spaceMaxX &&
          pieceMinY >= spaceMinY && pieceMaxY <= spaceMaxY &&
          pieceMinZ >= spaceMinZ && pieceMaxZ <= spaceMaxZ;

        if (!withinBounds) {
          console.warn(`🚫 Peça estrutural ${piece.name} está fora do espaço atual`);
          console.log('Espaço atual:', {
            position: space.position,
            dimensions: space.currentDimensions
          });
          console.log('Limites do espaço (com margem):', { spaceMinX, spaceMaxX, spaceMinY, spaceMaxY, spaceMinZ, spaceMaxZ });
          console.log('Limites da peça:', { pieceMinX, pieceMaxX, pieceMinY, pieceMaxY, pieceMinZ, pieceMaxZ });
        } else {
          console.log(`✅ Peça estrutural ${piece.name} está dentro dos limites`);
        }

        return withinBounds;
      }
    } else {
      // Para peças internas, usar limites rígidos
      const spaceMinX = -space.originalDimensions.width / 2;
      const spaceMaxX = space.originalDimensions.width / 2;
      const spaceMinY = -space.originalDimensions.height / 2;
      const spaceMaxY = space.originalDimensions.height / 2;
      const spaceMinZ = -space.originalDimensions.depth / 2;
      const spaceMaxZ = space.originalDimensions.depth / 2;

      const pieceMinX = piece.position.x - piece.dimensions.width / 2;
      const pieceMaxX = piece.position.x + piece.dimensions.width / 2;
      const pieceMinY = piece.position.y - piece.dimensions.height / 2;
      const pieceMaxY = piece.position.y + piece.dimensions.height / 2;
      const pieceMinZ = piece.position.z - piece.dimensions.depth / 2;
      const pieceMaxZ = piece.position.z + piece.dimensions.depth / 2;

      const withinBounds = 
        pieceMinX >= spaceMinX && pieceMaxX <= spaceMaxX &&
        pieceMinY >= spaceMinY && pieceMaxY <= spaceMaxY &&
        pieceMinZ >= spaceMinZ && pieceMaxZ <= spaceMaxZ;

      if (!withinBounds) {
        console.warn(`🚫 Peça interna ${piece.name} está fora dos limites do espaço`);
      }

      return withinBounds;
    }
  }

  /**
   * Calcula a espessura máxima permitida para uma peça evitar colisões
   */
  static calculateMaxAllowedThickness(space: FurnitureSpace, piece: FurniturePiece): number {
    const { type } = piece;
    const originalPosition = this.calculatePiecePosition(space, piece);
    
    console.log(`📏 Calculando espessura máxima para ${piece.name} do tipo ${type}`);
    console.log(`📏 Posição original:`, originalPosition);
    console.log(`📏 Espaço atual:`, space.currentDimensions);
    console.log(`📏 Peças existentes:`, space.pieces.map(p => `${p.name} (${p.type})`));
    
    // Primeiro, verificar se há peças conflitantes
    const conflictingPieces = this.getConflictingPieces(space, type);
    
    if (conflictingPieces.length === 0) {
      console.log('📏 Nenhuma peça conflitante encontrada, usando espessura original');
      return piece.thickness;
    }
    
    // Calcular espaço interno disponível baseado nas peças conflitantes
    const availableSpace = this.calculateAvailableInternalSpace(space, type, originalPosition);
    
    if (availableSpace === null || availableSpace >= piece.thickness) {
      console.log('📏 Espaço suficiente disponível, usando espessura original');
      return piece.thickness;
    }
    
    const maxThickness = Math.max(1, availableSpace - 2); // -2mm de margem de segurança
    const finalThickness = Math.min(piece.thickness, maxThickness);
    
    console.log(`📏 Espaço disponível: ${availableSpace}mm, espessura final: ${finalThickness}mm`);
    return finalThickness;
  }

  /**
   * Identifica peças que podem conflitar com o tipo de peça sendo inserida
   */
  static getConflictingPieces(space: FurnitureSpace, pieceType: PieceType): FurniturePiece[] {
    const { pieces } = space;
    
    switch (pieceType) {
      case PieceType.LATERAL_LEFT:
        return pieces.filter(p => p.type === PieceType.LATERAL_RIGHT);
      case PieceType.LATERAL_RIGHT:
        return pieces.filter(p => p.type === PieceType.LATERAL_LEFT);
      case PieceType.LATERAL_FRONT:
        return pieces.filter(p => p.type === PieceType.LATERAL_BACK);
      case PieceType.LATERAL_BACK:
        return pieces.filter(p => p.type === PieceType.LATERAL_FRONT);
      case PieceType.BOTTOM:
        return pieces.filter(p => p.type === PieceType.TOP);
      case PieceType.TOP:
        return pieces.filter(p => p.type === PieceType.BOTTOM);
      default:
        return [];
    }
  }

  /**
   * Calcula o espaço interno disponível para um tipo específico de peça
   */
  static calculateAvailableInternalSpace(space: FurnitureSpace, pieceType: PieceType, position: Position): number | null {
    const { pieces } = space;
    
    console.log(`🔍 Calculando espaço interno para ${pieceType}:`, {
      currentDimensions: space.currentDimensions,
      position,
      existingPieces: pieces.map(p => ({ name: p.name, type: p.type, position: p.position, dimensions: p.dimensions }))
    });
    
    switch (pieceType) {
      case PieceType.LATERAL_LEFT: {
        // Para lateral esquerda, verificar se há lateral direita limitando o espaço
        const rightLaterals = pieces.filter(p => p.type === PieceType.LATERAL_RIGHT);
        if (rightLaterals.length > 0) {
          // Encontrar a lateral direita mais próxima
          const closestRight = rightLaterals.reduce((closest, current) => 
            Math.abs(current.position.x - position.x) < Math.abs(closest.position.x - position.x) 
              ? current : closest
          );
          // Calcular espaço disponível entre a posição da nova lateral e a borda interna da lateral direita
          const rightInnerEdge = closestRight.position.x - closestRight.dimensions.width / 2;
          const newLateralRightEdge = position.x + 1; // Assumir espessura mínima para cálculo
          const availableSpace = Math.abs(rightInnerEdge - newLateralRightEdge);
          console.log(`📐 Lateral esquerda: rightInnerEdge=${rightInnerEdge}, newLateralPos=${position.x}, availableSpace=${availableSpace}`);
          return availableSpace;
        }
        // Se não há laterais direitas, verificar espaço até a borda do móvel
        const spaceRightEdge = space.position.x + space.currentDimensions.width / 2;
        const newLateralRightEdge = position.x + 1;
        const availableSpace = Math.abs(spaceRightEdge - newLateralRightEdge);
        console.log(`📐 Lateral esquerda (sem lateral direita): spaceRightEdge=${spaceRightEdge}, availableSpace=${availableSpace}`);
        return availableSpace;
      }

      case PieceType.LATERAL_RIGHT: {
        // Para lateral direita, verificar se há lateral esquerda limitando o espaço
        const leftLaterals = pieces.filter(p => p.type === PieceType.LATERAL_LEFT);
        if (leftLaterals.length > 0) {
          // Encontrar a lateral esquerda mais próxima
          const closestLeft = leftLaterals.reduce((closest, current) => 
            Math.abs(current.position.x - position.x) < Math.abs(closest.position.x - position.x) 
              ? current : closest
          );
          // Calcular espaço disponível entre a borda interna da lateral esquerda e a posição da nova lateral
          const leftInnerEdge = closestLeft.position.x + closestLeft.dimensions.width / 2;
          const newLateralLeftEdge = position.x - 1; // Assumir espessura mínima para cálculo
          const availableSpace = Math.abs(newLateralLeftEdge - leftInnerEdge);
          console.log(`📐 Lateral direita: leftInnerEdge=${leftInnerEdge}, newLateralPos=${position.x}, availableSpace=${availableSpace}`);
          return availableSpace;
        }
        // Se não há laterais esquerdas, verificar espaço até a borda do móvel
        const spaceLeftEdge = space.position.x - space.currentDimensions.width / 2;
        const newLateralLeftEdge = position.x - 1;
        const availableSpace = Math.abs(newLateralLeftEdge - spaceLeftEdge);
        console.log(`📐 Lateral direita (sem lateral esquerda): spaceLeftEdge=${spaceLeftEdge}, availableSpace=${availableSpace}`);
        return availableSpace;
      }

      case PieceType.LATERAL_FRONT: {
        // Para lateral frontal, verificar se há lateral traseira limitando o espaço
        const backLaterals = pieces.filter(p => p.type === PieceType.LATERAL_BACK);
        if (backLaterals.length > 0) {
          const closestBack = backLaterals.reduce((closest, current) => 
            Math.abs(current.position.z - position.z) < Math.abs(closest.position.z - position.z) 
              ? current : closest
          );
          const backInnerEdge = closestBack.position.z - closestBack.dimensions.depth / 2;
          const newLateralBackEdge = position.z + 1;
          const availableSpace = Math.abs(backInnerEdge - newLateralBackEdge);
          console.log(`📐 Lateral frontal: backInnerEdge=${backInnerEdge}, availableSpace=${availableSpace}`);
          return availableSpace;
        }
        const spaceBackEdge = space.position.z + space.currentDimensions.depth / 2;
        const newLateralBackEdge = position.z + 1;
        const availableSpace = Math.abs(spaceBackEdge - newLateralBackEdge);
        console.log(`📐 Lateral frontal (sem lateral traseira): availableSpace=${availableSpace}`);
        return availableSpace;
      }

      case PieceType.LATERAL_BACK: {
        // Para lateral traseira, verificar se há lateral frontal limitando o espaço
        const frontLaterals = pieces.filter(p => p.type === PieceType.LATERAL_FRONT);
        if (frontLaterals.length > 0) {
          const closestFront = frontLaterals.reduce((closest, current) => 
            Math.abs(current.position.z - position.z) < Math.abs(closest.position.z - position.z) 
              ? current : closest
          );
          const frontInnerEdge = closestFront.position.z + closestFront.dimensions.depth / 2;
          const newLateralFrontEdge = position.z - 1;
          const availableSpace = Math.abs(newLateralFrontEdge - frontInnerEdge);
          console.log(`📐 Lateral traseira: frontInnerEdge=${frontInnerEdge}, availableSpace=${availableSpace}`);
          return availableSpace;
        }
        const spaceFrontEdge = space.position.z - space.currentDimensions.depth / 2;
        const newLateralFrontEdge = position.z - 1;
        const availableSpace = Math.abs(newLateralFrontEdge - spaceFrontEdge);
        console.log(`📐 Lateral traseira (sem lateral frontal): availableSpace=${availableSpace}`);
        return availableSpace;
      }

      case PieceType.BOTTOM: {
        // Para fundo, verificar se há tampo limitando o espaço
        const topPieces = pieces.filter(p => p.type === PieceType.TOP);
        if (topPieces.length > 0) {
          const closestTop = topPieces.reduce((closest, current) => 
            Math.abs(current.position.y - position.y) < Math.abs(closest.position.y - position.y) 
              ? current : closest
          );
          const topBottomEdge = closestTop.position.y - closestTop.dimensions.height / 2;
          const newBottomTopEdge = position.y + 1;
          const availableSpace = Math.abs(topBottomEdge - newBottomTopEdge);
          console.log(`📐 Fundo: topBottomEdge=${topBottomEdge}, availableSpace=${availableSpace}`);
          return availableSpace;
        }
        const spaceTopEdge = space.position.y + space.currentDimensions.height / 2;
        const newBottomTopEdge = position.y + 1;
        const availableSpace = Math.abs(spaceTopEdge - newBottomTopEdge);
        console.log(`📐 Fundo (sem tampo): availableSpace=${availableSpace}`);
        return availableSpace;
      }

      case PieceType.TOP: {
        // Para tampo, verificar se há fundo limitando o espaço
        const bottomPieces = pieces.filter(p => p.type === PieceType.BOTTOM);
        if (bottomPieces.length > 0) {
          const closestBottom = bottomPieces.reduce((closest, current) => 
            Math.abs(current.position.y - position.y) < Math.abs(closest.position.y - position.y) 
              ? current : closest
          );
          const bottomTopEdge = closestBottom.position.y + closestBottom.dimensions.height / 2;
          const newTopBottomEdge = position.y - 1;
          const availableSpace = Math.abs(newTopBottomEdge - bottomTopEdge);
          console.log(`📐 Tampo: bottomTopEdge=${bottomTopEdge}, availableSpace=${availableSpace}`);
          return availableSpace;
        }
        const spaceBottomEdge = space.position.y - space.currentDimensions.height / 2;
        const newTopBottomEdge = position.y - 1;
        const availableSpace = Math.abs(newTopBottomEdge - spaceBottomEdge);
        console.log(`📐 Tampo (sem fundo): availableSpace=${availableSpace}`);
        return availableSpace;
      }

      default:
        console.log(`📐 Tipo ${pieceType} sem restrições específicas`);
        return null; // Sem restrições específicas
    }
  }

  /**
   * Calcula o corte que uma peça faz no espaço
   * @param space - O espaço atual
   * @param piece - A peça a ser inserida
   * @param cutThickness - Espessura específica para o corte (opcional, usa a espessura da peça se não fornecida)
   */
  static calculateCut(space: FurnitureSpace, piece: FurniturePiece, cutThickness?: number): CutResult {
    const { currentDimensions } = space;
    const { type, thickness } = piece;
    
    // Use a espessura de corte específica ou a espessura da peça
    const effectiveCutThickness = cutThickness ?? thickness;

    let remainingSpace: Dimensions = { ...currentDimensions };
    let cutPosition: Position = { x: 0, y: 0, z: 0 }; // Será calculado depois

    console.log(`🔧 Calculando corte para ${type}: espessura visual=${thickness}, corte=${effectiveCutThickness}`);

    switch (type) {
      case PieceType.LATERAL_LEFT:
        remainingSpace.width -= effectiveCutThickness;
        break;

      case PieceType.LATERAL_RIGHT:
        remainingSpace.width -= effectiveCutThickness;
        break;

      case PieceType.LATERAL_FRONT:
        remainingSpace.depth -= effectiveCutThickness;
        break;

      case PieceType.LATERAL_BACK:
        remainingSpace.depth -= effectiveCutThickness;
        break;

      case PieceType.BOTTOM:
        remainingSpace.height -= effectiveCutThickness;
        break;

      case PieceType.TOP:
        remainingSpace.height -= effectiveCutThickness;
        break;

      case PieceType.SHELF:
        // Prateleira não reduz o espaço geral, apenas divide verticalmente
        break;

      case PieceType.DIVIDER_VERTICAL:
        // Divisória vertical divide o espaço horizontalmente
        break;

      // case PieceType.DIVIDER_HORIZONTAL: // Removido: redundante com SHELF
      //   // Divisória horizontal divide o espaço verticalmente
      //   break;

      default:
        break;
    }

    return { remainingSpace, cutPosition };
  }

  /**
   * Calcula a posição onde uma peça deve ser colocada no espaço
   * Para peças que dividem espaços, a posição é centrada no espaço sendo dividido
   */
  static calculatePiecePosition(space: FurnitureSpace, piece: FurniturePiece): Position {
    const { type, thickness } = piece;
    const isInternalPiece = [
      PieceType.SHELF,
      PieceType.DIVIDER_VERTICAL,
      // PieceType.DIVIDER_HORIZONTAL // Removido: redundante com SHELF
    ].includes(type);
    
    // Para peças internas, posicionar no centro do espaço sendo dividido
    if (isInternalPiece) {
      const position = {
        x: space.position.x,
        y: space.position.y,
        z: space.position.z,
      };
      console.log('🔧 Posição da peça interna:', {
        pieceType: type,
        spacePosition: space.position,
        calculatedPosition: position
      });
      return position;
    }
    
    // Para peças estruturais, usar a lógica original
    const baseX = 0;
    const baseY = 0; 
    const baseZ = 0;

    let piecePosition: Position = { x: baseX, y: baseY, z: baseZ };

    const existingPiecesOfSameType = space.pieces.filter(p => p.type === type);
    const offset = existingPiecesOfSameType.length;

    console.log(`🔧 Calculando posição para ${piece.type}, offset: ${offset}`);

    switch (type) {
      case PieceType.LATERAL_LEFT:
        // Lateral esquerda: posicionada na borda esquerda DENTRO do espaço atual
        piecePosition.x = -(space.currentDimensions.width / 2 - thickness / 2) + space.position.x;
        piecePosition.y = space.position.y;
        piecePosition.z = space.position.z;
        break;

      case PieceType.LATERAL_RIGHT:
        // Lateral direita: posicionada na borda direita DENTRO do espaço atual
        piecePosition.x = (space.currentDimensions.width / 2 - thickness / 2) + space.position.x;
        piecePosition.y = space.position.y;
        piecePosition.z = space.position.z;
        break;

      case PieceType.LATERAL_FRONT:
        // Lateral frontal: posicionada na borda frontal do espaço atual (Z positivo = frente)
        piecePosition.x = space.position.x; // Centro do espaço atual
        piecePosition.y = space.position.y; // Centro do espaço atual
        piecePosition.z = (space.currentDimensions.depth / 2 - thickness / 2) + space.position.z;
        break;

      case PieceType.LATERAL_BACK:
        // Lateral traseira: posicionada na borda traseira do espaço atual (Z negativo = trás)
        piecePosition.x = space.position.x; // Centro do espaço atual
        piecePosition.y = space.position.y; // Centro do espaço atual
        piecePosition.z = -(space.currentDimensions.depth / 2 - thickness / 2) + space.position.z;
        break;

      case PieceType.BOTTOM:
        // Fundo: posicionado na parte inferior do espaço atual (não original)
        piecePosition.x = space.position.x; // Centro do espaço atual
        piecePosition.y = -(space.currentDimensions.height / 2 - thickness / 2) + space.position.y;
        piecePosition.z = space.position.z; // Centro do espaço atual
        break;

      case PieceType.TOP:
        // Tampo: posicionado na parte superior do espaço atual (não original)
        piecePosition.x = space.position.x; // Centro do espaço atual
        piecePosition.y = (space.currentDimensions.height / 2 - thickness / 2) + space.position.y;
        piecePosition.z = space.position.z; // Centro do espaço atual
        break;

      default:
        break;
    }

    console.log(`✅ Posição final calculada para ${piece.type}:`, piecePosition);
    return piecePosition;
  }

  /**
   * Calcula as dimensões que uma peça deve ter baseado no espaço
   */
  static calculatePieceDimensions(space: FurnitureSpace, pieceType: PieceType, thickness: number): Dimensions {
    const { currentDimensions } = space;

    switch (pieceType) {
      case PieceType.LATERAL_LEFT:
      case PieceType.LATERAL_RIGHT:
        // Laterais devem usar as dimensões atuais do espaço disponível
        return {
          width: thickness,
          height: currentDimensions.height,
          depth: currentDimensions.depth,
        };

      case PieceType.LATERAL_FRONT:
      case PieceType.LATERAL_BACK:
        // Laterais frontais/traseiras devem usar o espaço atual disponível
        const internalBoundsFrontBack = this.calculateInternalSpaceBounds(space);
        return {
          width: internalBoundsFrontBack.width,
          height: internalBoundsFrontBack.height,
          depth: thickness,
        };

      case PieceType.BOTTOM:
      case PieceType.TOP:
        // Fundos/tampos devem usar o espaço interno disponível, não as dimensões originais
        const internalBoundsBottomTop = this.calculateInternalSpaceBounds(space);
        return {
          width: internalBoundsBottomTop.width,
          height: thickness,
          depth: internalBoundsBottomTop.depth,
        };

      case PieceType.SHELF:
        // Calcular dimensões baseadas no espaço interno real
        const internalBounds = this.calculateInternalSpaceBounds(space);
        return {
          width: internalBounds.width,
          height: thickness,
          depth: internalBounds.depth,
        };

      case PieceType.DIVIDER_VERTICAL:
        const internalBoundsVertical = this.calculateInternalSpaceBounds(space);
        const dimensions = {
          width: thickness,
          height: internalBoundsVertical.height,
          depth: internalBoundsVertical.depth,
        };
        console.log('🔧 Dimensões da divisória vertical:', {
          thickness,
          spaceDimensions: space.currentDimensions,
          internalBounds: internalBoundsVertical,
          finalDimensions: dimensions
        });
        return dimensions;

      // case PieceType.DIVIDER_HORIZONTAL: // Removido: redundante com SHELF
      //   // Calcular dimensões baseadas no espaço interno real
      //   const internalBoundsHorizontal = this.calculateInternalSpaceBounds(space);
      //   return {
      //     width: internalBoundsHorizontal.width,
      //     height: thickness,
      //     depth: internalBoundsHorizontal.depth,
      //   };

      default:
        return { width: 0, height: 0, depth: 0 };
    }
  }

  /**
   * Calcula a nova posição do espaço restante após inserir uma peça estrutural
   */
  static calculateRemainingSpacePosition(space: FurnitureSpace, piece: FurniturePiece, cutThickness?: number): Position {
    const { type } = piece;
    const effectiveCutThickness = cutThickness ?? piece.thickness;
    const currentPos = space.position;

    let newPosition: Position = { ...currentPos };

    switch (type) {
      case PieceType.LATERAL_LEFT:
        // Lateral esquerda: o espaço restante se move para a direita
        newPosition.x = currentPos.x + effectiveCutThickness / 2;
        break;

      case PieceType.LATERAL_RIGHT:
        // Lateral direita: o espaço restante se move para a esquerda
        newPosition.x = currentPos.x - effectiveCutThickness / 2;
        break;

      case PieceType.LATERAL_FRONT:
        // Lateral frontal (Z positivo): o espaço restante se move para trás (Z negativo)
        newPosition.z = currentPos.z - effectiveCutThickness / 2;
        break;

      case PieceType.LATERAL_BACK:
        // Lateral traseira (Z negativo): o espaço restante se move para frente (Z positivo)
        newPosition.z = currentPos.z + effectiveCutThickness / 2;
        break;

      case PieceType.BOTTOM:
        // Fundo: o espaço restante se move para cima
        newPosition.y = currentPos.y + effectiveCutThickness / 2;
        break;

      case PieceType.TOP:
        // Tampo: o espaço restante se move para baixo
        newPosition.y = currentPos.y - effectiveCutThickness / 2;
        break;

      default:
        // Para peças internas, manter posição atual
        break;
    }

    console.log(`📍 Nova posição do espaço após ${type}:`, newPosition);
    return newPosition;
  }

  /**
   * Aplica um corte ao espaço e atualiza suas dimensões
   * @param space - O espaço atual
   * @param piece - A peça a ser inserida
   * @param cutThickness - Espessura específica para o corte (opcional)
   */
  static applyCutToSpace(space: FurnitureSpace, piece: FurniturePiece, cutThickness?: number): FurnitureSpace {
    // Se a peça tem manualPosition, não dividir o espaço, só adicionar a peça na posição informada
    const safeThickness = typeof piece.thickness === 'number' && !isNaN(piece.thickness) ? piece.thickness : 18;
    const piecePosition = this.calculatePiecePosition(space, { ...piece, thickness: safeThickness });
    
    const updatedPiece: FurniturePiece = {
      ...piece,
      position: piecePosition,
      dimensions: this.calculatePieceDimensions(space, piece.type, safeThickness),
    };

    // Calcular as novas dimensões do espaço após adicionar a peça
    const effectiveCutThickness = typeof cutThickness === 'number' && !isNaN(cutThickness) ? cutThickness : safeThickness;
    const cutResult = this.calculateCut(space, { ...piece, thickness: safeThickness }, effectiveCutThickness);
    
    // Calcular nova posição do espaço baseado no tipo de peça adicionada
    const newSpacePosition = this.calculateRemainingSpacePosition(space, { ...piece, thickness: safeThickness }, effectiveCutThickness);

    console.log(`🔧 Peça ${piece.type} adicionada:`, {
      position: piecePosition,
      dimensions: updatedPiece.dimensions,
      newSpaceDimensions: cutResult.remainingSpace,
      newSpacePosition: newSpacePosition,
      visualThickness: piece.thickness,
      cutThickness: cutThickness ?? piece.thickness
    });

    return {
      ...space,
      currentDimensions: cutResult.remainingSpace,
      position: newSpacePosition,
      pieces: [...space.pieces, updatedPiece],
    };
  }

  /**
   * Calcula a largura disponível no espaço interno (distância real entre as laterais)
   */
  static calculateAvailableInternalWidth(space: FurnitureSpace): number {
    const leftLaterals = space.pieces.filter(p => p.type === PieceType.LATERAL_LEFT);
    const rightLaterals = space.pieces.filter(p => p.type === PieceType.LATERAL_RIGHT);
    
    // Calcular espessura total das laterais esquerdas e direitas
    const leftThickness = leftLaterals.reduce((total, piece) => total + piece.thickness, 0);
    const rightThickness = rightLaterals.reduce((total, piece) => total + piece.thickness, 0);
    
    // A largura disponível é a largura original menos as espessuras das laterais
    return space.originalDimensions.width - leftThickness - rightThickness;
  }

  /**
   * Calcula os limites do espaço interno (onde as peças internas devem ser posicionadas)
   */
  static calculateInternalSpaceBounds(space: FurnitureSpace) {
    // Calcular limites do espaço interno - sempre centralizado em (0,0,0)
    const leftX = -space.currentDimensions.width / 2;
    const rightX = space.currentDimensions.width / 2;
    const bottomY = -space.currentDimensions.height / 2;
    const topY = space.currentDimensions.height / 2;
    const frontZ = -space.currentDimensions.depth / 2;
    const backZ = space.currentDimensions.depth / 2;

    return {
      leftX,
      rightX,
      bottomY,
      topY,
      frontZ,
      backZ,
      centerX: 0, // Sempre centralizado
      centerY: 0, // Sempre centralizado
      centerZ: 0, // Sempre centralizado
      width: space.currentDimensions.width,
      height: space.currentDimensions.height,
      depth: space.currentDimensions.depth,
    };
  }

  /**
   * Divide um espaço com base em uma peça interna (prateleira ou divisória).
   * Esta versão foi reescrita para ser mais clara e garantir que a espessura da peça seja respeitada.
   */
  static divideSpace(space: FurnitureSpace, piece: FurniturePiece, cutThickness?: number): FurnitureSpace[] {
      const { type, thickness } = piece;
      const effectiveCutThickness = cutThickness ?? thickness;
      const { currentDimensions, position: parentPosition } = space;

      // A peça divisória é sempre posicionada no centro do espaço que está dividindo.
      const piecePosition = { ...parentPosition }; 

      switch (type) {
          case PieceType.SHELF: {
              // A altura restante para os dois novos espaços
              const remainingHeight = currentDimensions.height - effectiveCutThickness;
              if (remainingHeight < 1) return []; // Não pode dividir se não houver espaço
              const heightPerSpace = remainingHeight / 2;

              // Limites do espaço pai (em coordenadas globais)
              const parentBottomY = parentPosition.y - currentDimensions.height / 2;

              // Limites da prateleira (em coordenadas globais), que está no centro do espaço pai
              const shelfTopY = piecePosition.y + effectiveCutThickness / 2;

              // Calcula o novo espaço INFERIOR
              const bottomSpace: FurnitureSpace = {
                  id: `${space.id}_bottom_${piece.id}`, // ID único para o subespaço
                  name: `${space.name} Inferior`,
                  originalDimensions: { ...currentDimensions, height: heightPerSpace },
                  currentDimensions: { width: currentDimensions.width, height: heightPerSpace, depth: currentDimensions.depth },
                  position: {
                      x: parentPosition.x,
                      y: parentBottomY + heightPerSpace / 2, // Posiciona o centro do novo espaço
                      z: parentPosition.z,
                  },
                  pieces: [],
                  parentSpaceId: space.id,
                  isActive: true,
                  createdByPieceId: piece.id,
              };

              // Calcula o novo espaço SUPERIOR
              const topSpace: FurnitureSpace = {
                  id: `${space.id}_top_${piece.id}`, // ID único para o subespaço
                  name: `${space.name} Superior`,
                  originalDimensions: { ...currentDimensions, height: heightPerSpace },
                  currentDimensions: { width: currentDimensions.width, height: heightPerSpace, depth: currentDimensions.depth },
                  position: {
                      x: parentPosition.x,
                      y: shelfTopY + heightPerSpace / 2, // Posiciona o centro do novo espaço
                      z: parentPosition.z,
                  },
                  pieces: [],
                  parentSpaceId: space.id,
                  isActive: true,
                  createdByPieceId: piece.id,
              };

              return [bottomSpace, topSpace];
          }

          case PieceType.DIVIDER_VERTICAL: {
              const remainingWidth = currentDimensions.width - effectiveCutThickness;
              if (remainingWidth < 1) return []; // Não pode dividir
              const widthPerSpace = remainingWidth / 2;

              // Limites do espaço pai (em coordenadas globais)
              const parentLeftX = parentPosition.x - currentDimensions.width / 2;

              // Limites da divisória (em coordenadas globais)
              const dividerRightX = piecePosition.x + effectiveCutThickness / 2;

              // Calcula o novo espaço à ESQUERDA
              const leftSpace: FurnitureSpace = {
                  id: `${space.id}_left_${piece.id}`,
                  name: `${space.name} Esquerda`,
                  originalDimensions: { ...currentDimensions, width: widthPerSpace },
                  currentDimensions: { width: widthPerSpace, height: currentDimensions.height, depth: currentDimensions.depth },
                  position: {
                      x: parentLeftX + widthPerSpace / 2,
                      y: parentPosition.y,
                      z: parentPosition.z,
                  },
                  pieces: [],
                  parentSpaceId: space.id,
                  isActive: true,
                  createdByPieceId: piece.id,
              };

              // Calcula o novo espaço à DIREITA
              const rightSpace: FurnitureSpace = {
                  id: `${space.id}_right_${piece.id}`,
                  name: `${space.name} Direita`,
                  originalDimensions: { ...currentDimensions, width: widthPerSpace },
                  currentDimensions: { width: widthPerSpace, height: currentDimensions.height, depth: currentDimensions.depth },
                  position: {
                      x: dividerRightX + widthPerSpace / 2,
                      y: parentPosition.y,
                      z: parentPosition.z,
                  },
                  pieces: [],
                  parentSpaceId: space.id,
                  isActive: true,
                  createdByPieceId: piece.id,
              };

              return [leftSpace, rightSpace];
          }

          default:
              return []; // Outros tipos de peça não dividem o espaço.
      }
  }

  /**
   * Verifica se uma peça lateral pode ser inserida no espaço
   */
  static canInsertLateralPiece(space: FurnitureSpace, pieceType: PieceType, thickness: number): boolean {
    if (![PieceType.LATERAL_LEFT, PieceType.LATERAL_RIGHT].includes(pieceType)) {
      return true; // Não é lateral, usar lógica normal
    }

    // Verificar se há espaço suficiente para a lateral
    const minRequiredSpace = thickness + 10; // Espessura + margem mínima
    
    // Para laterais, verificar se há espaço interno suficiente
    const existingLaterals = space.pieces.filter(p => 
      p.type === PieceType.LATERAL_LEFT || p.type === PieceType.LATERAL_RIGHT
    );
    
    const usedWidth = existingLaterals.reduce((total, piece) => total + piece.thickness, 0);
    const availableWidth = space.currentDimensions.width - usedWidth;
    
    console.log(`🔍 Verificando inserção de ${pieceType}:`, {
      availableWidth,
      requiredSpace: minRequiredSpace,
      canInsert: availableWidth >= minRequiredSpace
    });
    
    return availableWidth >= minRequiredSpace;
  }

  /**
   * Valida se uma peça individual cabe na chapa padrão
   */
  static validatePieceSheet(pieceType: PieceType, dimensions: Dimensions): { valido: boolean; erro?: string } {
    const CHAPA_MAX_COMPRIMENTO = 2750; // mm
    const CHAPA_MAX_LARGURA = 1850; // mm
    
    // Para cada tipo de peça, determinar qual é o comprimento e largura
    let comprimento: number;
    let largura: number;
    
    switch (pieceType) {
      case PieceType.LATERAL_LEFT:
      case PieceType.LATERAL_RIGHT:
        // Laterais: altura × profundidade (espessura é irrelevante para a chapa)
        comprimento = Math.max(dimensions.height, dimensions.depth);
        largura = Math.min(dimensions.height, dimensions.depth);
        break;
        
      case PieceType.LATERAL_FRONT:
      case PieceType.LATERAL_BACK:
        // Frontais/Traseiras: largura × altura (espessura é irrelevante)
        comprimento = Math.max(dimensions.width, dimensions.height);
        largura = Math.min(dimensions.width, dimensions.height);
        break;
        
      case PieceType.BOTTOM:
      case PieceType.TOP:
      case PieceType.SHELF:
        // Horizontais: largura × profundidade (espessura é irrelevante)
        comprimento = Math.max(dimensions.width, dimensions.depth);
        largura = Math.min(dimensions.width, dimensions.depth);
        break;
        
      case PieceType.DIVIDER_VERTICAL:
        // Divisória vertical: altura × profundidade
        comprimento = Math.max(dimensions.height, dimensions.depth);
        largura = Math.min(dimensions.height, dimensions.depth);
        break;
        
      // case PieceType.DIVIDER_HORIZONTAL: // Removido: redundante com SHELF
      //   // Divisória horizontal: largura × profundidade  
      //   comprimento = Math.max(dimensions.width, dimensions.depth);
      //   largura = Math.min(dimensions.width, dimensions.depth);
      //   break;
        
      default:
        return { valido: true }; // Tipo desconhecido, assumir válido
    }
    
    const comprimentoValido = comprimento <= CHAPA_MAX_COMPRIMENTO;
    const larguraValida = largura <= CHAPA_MAX_LARGURA;
    
    if (!comprimentoValido) {
      return { 
        valido: false, 
        erro: `Peça ${pieceType}: comprimento ${comprimento}mm excede limite da chapa (${CHAPA_MAX_COMPRIMENTO}mm)` 
      };
    }
    
    if (!larguraValida) {
      return { 
        valido: false, 
        erro: `Peça ${pieceType}: largura ${largura}mm excede limite da chapa (${CHAPA_MAX_LARGURA}mm)` 
      };
    }
    
    return { valido: true };
  }

  /**
   * Recalcula os subSpaces de um espaço com base na posição real da peça divisor
   */
  static recalculateSubSpacesByPiece(space: FurnitureSpace, piece: FurniturePiece): FurnitureSpace[] {
    // Usar manualPosition se existir
    const positionToUse = piece.position;
    const { type, thickness } = piece;
    const { currentDimensions, position } = space;
    if (type === PieceType.SHELF) {
      // Prateleira: divide em cima e baixo pela posição Y da peça
      if (typeof positionToUse.y !== 'number') return [];
      const y = positionToUse.y;
      const safeThickness = typeof thickness === 'number' && !isNaN(thickness) ? thickness : 18;
      const halfThickness = safeThickness / 2;
      const baseY = position.y - currentDimensions.height / 2;
      const topY = position.y + currentDimensions.height / 2;
      // Espaço inferior
      const bottomHeight = (y - halfThickness) - baseY;
      const bottomCenterY = baseY + bottomHeight / 2;
      // Espaço superior
      const topHeight = topY - (y + halfThickness);
      const topCenterY = (y + halfThickness) + topHeight / 2;
      const bottomSpace: FurnitureSpace = {
        id: `${space.id}_bottom`,
        name: `${space.name} - Inferior`,
        originalDimensions: { ...currentDimensions },
        currentDimensions: {
          width: currentDimensions.width,
          height: bottomHeight,
          depth: currentDimensions.depth,
        },
        position: {
          x: position.x,
          y: bottomCenterY,
          z: position.z,
        },
        pieces: [],
        parentSpaceId: space.id,
        isActive: true,
      };
      const topSpace: FurnitureSpace = {
        id: `${space.id}_top`,
        name: `${space.name} - Superior`,
        originalDimensions: { ...currentDimensions },
        currentDimensions: {
          width: currentDimensions.width,
          height: topHeight,
          depth: currentDimensions.depth,
        },
        position: {
          x: position.x,
          y: topCenterY,
          z: position.z,
        },
        pieces: [],
        parentSpaceId: space.id,
        isActive: true,
      };
      return [bottomSpace, topSpace];
    }
    if (type === PieceType.DIVIDER_VERTICAL) {
      // Divisória vertical: divide em esquerda e direita pela posição X da peça
      if (typeof positionToUse.x !== 'number') return [];
      const x = Number(positionToUse.x ?? 0);
      const safeThickness = typeof thickness === 'number' && !isNaN(thickness) ? thickness : 18;
      const halfThickness = safeThickness / 2;
      const safeWidth = Number(typeof currentDimensions.width === 'number' ? currentDimensions.width : 1000);
      const safeHeight = Number(typeof currentDimensions.height === 'number' ? currentDimensions.height : 1000);
      const safeDepth = Number(typeof currentDimensions.depth === 'number' ? currentDimensions.depth : 1000);
      const leftX = position.x - safeWidth / 2;
      const rightX = position.x + safeWidth / 2;
      const minX = leftX + halfThickness;
      const maxX = rightX - halfThickness;
      const clampedX = Math.max(minX, Math.min(maxX, x));
      const leftWidth = Math.max(1, (clampedX - halfThickness) - leftX);
      const leftCenterX = leftX + leftWidth / 2;
      const rightWidth = Math.max(1, rightX - (clampedX + halfThickness));
      const rightCenterX = (clampedX + halfThickness) + rightWidth / 2;
      const leftSpace: FurnitureSpace = {
        id: `${space.id}_left`,
        name: `${space.name} - Esquerda`,
        originalDimensions: { ...currentDimensions },
        currentDimensions: {
          width: leftWidth,
          height: safeHeight,
          depth: safeDepth,
        },
        position: {
          x: leftCenterX,
          y: position.y,
          z: position.z,
        },
        pieces: [],
        parentSpaceId: space.id,
        isActive: true,
      };
      const rightSpace: FurnitureSpace = {
        id: `${space.id}_right`,
        name: `${space.name} - Direita`,
        originalDimensions: { ...currentDimensions },
        currentDimensions: {
          width: rightWidth,
          height: safeHeight,
          depth: safeDepth,
        },
        position: {
          x: rightCenterX,
          y: position.y,
          z: position.z,
        },
        pieces: [],
        parentSpaceId: space.id,
        isActive: true,
      };
      // Corrigir a posição da divisória para o valor clamped
      piece.position.x = clampedX;
      return [leftSpace, rightSpace];
    }
    // Outros tipos não dividem
    return [];
  }

  /**
   * Aplica recursivamente peças a um espaço, dividindo-o se necessário.
   * @param space - O espaço principal.
   * @param piecesToApply - Um array de peças a serem aplicadas.
   * @param defaultThickness - Espessura padrão para peças estruturais.
   * @returns O espaço final após a aplicação de todas as peças.
   */
  static applyPiecesRecursively(space: FurnitureSpace, piecesToApply: FurniturePiece[], defaultThickness: number = 18): FurnitureSpace {
    let currentSpace: FurnitureSpace = {
      ...space,
      pieces: [],
      subSpaces: undefined,
    };
    // Ordenar peças: estruturais > divisórias > prateleiras
    const localOrderedPieces = [...piecesToApply].sort((a, b) => this.pieceOrder(a) - this.pieceOrder(b));
    // 1. Aplicar todas as divisórias deste nível primeiro
    const divisoriasAqui = localOrderedPieces.filter(p => p.type === PieceType.DIVIDER_VERTICAL && (!space.subSpaces || SpaceCuttingSystem.findSubSpaceByPosition(space, p).id === space.id));
    for (const piece of divisoriasAqui) {
      const pieceThickness = typeof piece.thickness === 'number' && !isNaN(piece.thickness) ? piece.thickness : defaultThickness;
      currentSpace = {
        ...currentSpace,
        pieces: [...currentSpace.pieces, {
          ...piece,
          dimensions: SpaceCuttingSystem.calculatePieceDimensions(currentSpace, piece.type, pieceThickness),
        }],
      };
      // Dividir o espaço
      const newSubs = SpaceCuttingSystem.recalculateSubSpacesByPiece(currentSpace, piece);
      if (newSubs.length > 0) {
        // 2. Distribuir as peças internas para os subSpaces corretos
        const subSpacesWithPieces = newSubs.map(sub => {
          const subBounds = SpaceCuttingSystem.calculateInternalSpaceBounds(sub);
          let piecesForSub = localOrderedPieces.filter(p => {
            if (p.id === piece.id) return false; // NÃO redistribuir a peça que causou o corte!
            const pos = p.position;
            if (p.type === PieceType.SHELF) {
              if (typeof pos.y !== 'number') return false;
              return pos.y >= subBounds.bottomY && pos.y <= subBounds.topY;
            } else if (p.type === PieceType.DIVIDER_VERTICAL) {
              if (typeof pos.x !== 'number') return false;
              return pos.x >= subBounds.leftX && pos.x <= subBounds.rightX;
            }
            return false;
          });

          // Fallback: garantir que nenhuma peça seja perdida (simplificado para evitar loops)
          const idsDistribuidos = new Set(piecesForSub.map(p => p.id));
          const aindaNaoDistribuidas = localOrderedPieces.filter(p =>
            p.id !== piece.id && !idsDistribuidos.has(p.id)
          );
          
          // Apenas adicionar peças que realmente pertencem a este subSpace
          aindaNaoDistribuidas.forEach(p => {
            const pos = p.position;
            if (p.type === PieceType.SHELF && typeof pos.y === 'number') {
              const posY = pos.y;
              const centroSub = (subBounds.topY + subBounds.bottomY) / 2;
              const dist = Math.abs(posY - centroSub);
              // Só adicionar se estiver próximo do centro do subSpace
              if (dist < (subBounds.topY - subBounds.bottomY) / 4) {
                piecesForSub.push(p);
                console.warn(`[FALLBACK] Peça ${p.id} (${p.type}) atribuída ao subSpace ${sub.id} por proximidade`);
              }
            } else if (p.type === PieceType.DIVIDER_VERTICAL && typeof pos.x === 'number') {
              const posX = pos.x;
              const centroSub = (subBounds.leftX + subBounds.rightX) / 2;
              const dist = Math.abs(posX - centroSub);
              // Só adicionar se estiver próximo do centro do subSpace
              if (dist < (subBounds.rightX - subBounds.leftX) / 4) {
                piecesForSub.push(p);
                console.warn(`[FALLBACK] Peça ${p.id} (${p.type}) atribuída ao subSpace ${sub.id} por proximidade`);
              }
            }
          });

          console.log(`[LOG] Peças para subSpace ${sub.id}:`, piecesForSub.map(pp => ({id: pp.id, type: pp.type, pos: pp.position})));
          return SpaceCuttingSystem.applyPiecesRecursively(sub, piecesForSub, defaultThickness);
        });
        currentSpace = {
          ...currentSpace,
          subSpaces: subSpacesWithPieces,
        };
        return currentSpace; // Após dividir, não aplica mais peças neste nível
      }
    }
    // 3. Se não houver subSpaces, aplicar prateleiras neste nível
    const prateleirasAqui = localOrderedPieces.filter(
      p => p.type === PieceType.SHELF && (!space.subSpaces || SpaceCuttingSystem.findSubSpaceByPosition(space, p).id === space.id)
    );
    for (const piece of prateleirasAqui) {
      const pieceThickness = typeof piece.thickness === 'number' && !isNaN(piece.thickness) ? piece.thickness : defaultThickness;
      currentSpace = {
        ...currentSpace,
        pieces: [...currentSpace.pieces, {
          ...piece,
          dimensions: SpaceCuttingSystem.calculatePieceDimensions(currentSpace, piece.type, pieceThickness),
        }],
      };
      // Dividir o espaço
      const newSubs = SpaceCuttingSystem.recalculateSubSpacesByPiece(currentSpace, piece);
      if (newSubs.length > 0) {
        // 4. Distribuir as peças internas para os subSpaces corretos
        const subSpacesWithPieces = newSubs.map(sub => {
          const subBounds = SpaceCuttingSystem.calculateInternalSpaceBounds(sub);
          const piecesForSub = localOrderedPieces.filter(p => {
            const pos = p.position;
            if (p.type === PieceType.SHELF) {
              if (typeof pos.y !== 'number') return false;
              return pos.y >= subBounds.bottomY && pos.y <= subBounds.topY;
            } else if (p.type === PieceType.DIVIDER_VERTICAL) {
              if (typeof pos.x !== 'number') return false;
              return pos.x >= subBounds.leftX && pos.x <= subBounds.rightX;
            }
            return false;
          });
          console.log(`[LOG] Peças para subSpace ${sub.id}:`, piecesForSub.map(pp => ({id: pp.id, type: pp.type, pos: pp.position})));
          return SpaceCuttingSystem.applyPiecesRecursively(sub, piecesForSub, defaultThickness);
        });
        currentSpace = {
          ...currentSpace,
          subSpaces: subSpacesWithPieces,
        };
        return currentSpace; // Após dividir, não aplica mais peças neste nível
      }
    }
    return currentSpace;
  }

  /**
   * Função auxiliar para ordenar peças.
   * Prioriza peças estruturais sobre peças internas.
   */
  private static pieceOrder(piece: FurniturePiece): number {
    if ([PieceType.LATERAL_LEFT, PieceType.LATERAL_RIGHT, PieceType.LATERAL_FRONT, PieceType.LATERAL_BACK, PieceType.BOTTOM, PieceType.TOP].includes(piece.type)) {
      return 0; // Peças estruturais
    }
    return 1; // Peças internas (SHELF, DIVIDER_VERTICAL)
  }

  /**
   * Encontra o subSpace folha correto para uma peça, dado o espaço raiz e a posição da peça.
   * Para prateleira: busca por Y. Para divisória: busca por X.
   */
  static findSubSpaceByPosition(rootSpace: FurnitureSpace, piece: FurniturePiece): FurnitureSpace {
    // Usar manualPosition se existir
    const pos = piece.position;
    const visitedSpaces = new Set<string>();
    
    function search(space: FurnitureSpace): FurnitureSpace {
      // Proteção contra recursão infinita
      if (visitedSpaces.has(space.id)) {
        console.warn('⚠️ Loop detectado em findSubSpaceByPosition, retornando espaço atual');
        return space;
      }
      visitedSpaces.add(space.id);
      
      if (!space.subSpaces || space.subSpaces.length === 0) {
        return space;
      }
      if (piece.type === PieceType.SHELF) {
        const found = space.subSpaces.find(sub => {
          const b = SpaceCuttingSystem.calculateInternalSpaceBounds(sub);
          return typeof pos.y === 'number' && pos.y >= b.bottomY && pos.y <= b.topY;
        });
        return found ? search(found) : space;
      } else if (piece.type === PieceType.DIVIDER_VERTICAL) {
        const found = space.subSpaces.find(sub => {
          const b = SpaceCuttingSystem.calculateInternalSpaceBounds(sub);
          return typeof pos.x === 'number' && pos.x >= b.leftX && pos.x <= b.rightX;
        });
        return found ? search(found) : space;
      }
      return rootSpace;
    }
    return search(rootSpace);
  }
}

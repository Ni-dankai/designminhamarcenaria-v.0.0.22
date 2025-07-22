import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FurnitureSpace, FurniturePiece, PieceType, Dimensions } from '../types/furniture';
import { InsertionMode, InsertionContext } from '../types/insertion';
import { SpaceCuttingSystem } from '../utils/spaceCutting';

export const useFurnitureDesign = () => {
  const [space, setSpace] = useState<FurnitureSpace>({
    id: uuidv4(),
    name: 'Móvel Principal',
    originalDimensions: { width: 800, height: 2100, depth: 600 },
    currentDimensions: { width: 800, height: 2100, depth: 600 },
    position: { x: 0, y: 0, z: 0 },
    pieces: [],
  });

  const [insertionContext, setInsertionContext] = useState<InsertionContext>({
    mode: InsertionMode.STRUCTURAL,
  });

  const createNewSpace = useCallback((dimensions: Dimensions, name: string = 'Novo Móvel') => {
    const newSpace: FurnitureSpace = {
      id: uuidv4(),
      name,
      originalDimensions: dimensions,
      currentDimensions: dimensions,
      position: { x: 0, y: 0, z: 0 },
      pieces: [],
    };
    setSpace(newSpace);
  }, []);

  const addPiece = useCallback((pieceType: PieceType, thickness: number = 18, customName?: string) => {
    // Validar se a peça pode ser inserida no espaço atual
    const isInternalPiece = [
      PieceType.SHELF,
      PieceType.DIVIDER_VERTICAL
    ].includes(pieceType);

    // Verificar se há espaço disponível para peças internas
    if (isInternalPiece && (space.currentDimensions.width <= 0 || 
                           space.currentDimensions.height <= 0 || 
                           space.currentDimensions.depth <= 0)) {
      console.warn('Espaço não disponível. Adicione peças estruturais primeiro.');
      return;
    }

    const pieceNames: Record<PieceType, string> = {
      [PieceType.LATERAL_LEFT]: 'Lateral Esquerda',
      [PieceType.LATERAL_RIGHT]: 'Lateral Direita',
      [PieceType.LATERAL_FRONT]: 'Lateral Frontal',
      [PieceType.LATERAL_BACK]: 'Lateral Traseira',
      [PieceType.BOTTOM]: 'Fundo',
      [PieceType.TOP]: 'Tampo',
      [PieceType.SHELF]: 'Prateleira',
      [PieceType.DIVIDER_VERTICAL]: 'Divisória Vertical',
    };

    const pieceColors: Record<PieceType, string> = {
      [PieceType.LATERAL_LEFT]: '#8b5cf6',
      [PieceType.LATERAL_RIGHT]: '#8b5cf6',
      [PieceType.LATERAL_FRONT]: '#f59e0b',
      [PieceType.LATERAL_BACK]: '#f59e0b',
      [PieceType.BOTTOM]: '#ef4444',
      [PieceType.TOP]: '#ef4444',
      [PieceType.SHELF]: '#10b981',
      [PieceType.DIVIDER_VERTICAL]: '#3b82f6',
    };

    const newPiece: FurniturePiece = {
      id: uuidv4(),
      type: pieceType,
      name: customName || pieceNames[pieceType],
      thickness,
      color: pieceColors[pieceType],
      dimensions: { width: 0, height: 0, depth: 0 }, // Será calculado pelo sistema
      position: { x: 0, y: 0, z: 0 }, // Será calculado pelo sistema
    };

    setSpace(currentSpace => SpaceCuttingSystem.applyCutToSpace(currentSpace, newPiece));
  }, [insertionContext, space.currentDimensions]);

  const removePiece = useCallback((pieceId: string) => {
    setSpace(currentSpace => {
      // Reconstrói o móvel removendo a peça e recalculando
      const remainingPieces = currentSpace.pieces.filter(p => p.id !== pieceId);
      
      // Reinicia o espaço
      let newSpace: FurnitureSpace = {
        ...currentSpace,
        currentDimensions: currentSpace.originalDimensions,
        position: { x: 0, y: 0, z: 0 },
        pieces: [],
      };

      // Reaplicar todas as peças restantes
      remainingPieces.forEach(piece => {
        newSpace = SpaceCuttingSystem.applyCutToSpace(newSpace, piece);
      });

      return newSpace;
    });
  }, []);

  const updateSpaceDimensions = useCallback((newDimensions: Dimensions) => {
    setSpace(currentSpace => {
      const pieces = [...currentSpace.pieces];
      
      // Reinicia o espaço com as novas dimensões
      let newSpace: FurnitureSpace = {
        ...currentSpace,
        originalDimensions: newDimensions,
        currentDimensions: newDimensions,
        position: { x: 0, y: 0, z: 0 },
        pieces: [],
      };

      // Reaplicar todas as peças
      pieces.forEach(piece => {
        newSpace = SpaceCuttingSystem.applyCutToSpace(newSpace, piece);
      });

      return newSpace;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSpace(currentSpace => ({
      ...currentSpace,
      currentDimensions: currentSpace.originalDimensions,
      position: { x: 0, y: 0, z: 0 },
      pieces: [],
    }));
  }, []);

  const toggleInsertionMode = useCallback(() => {
    setInsertionContext(prev => ({
      ...prev,
      mode: prev.mode === InsertionMode.STRUCTURAL ? InsertionMode.INTERNAL : InsertionMode.STRUCTURAL,
      selectedSpace: prev.mode === InsertionMode.STRUCTURAL ? 'internal' : 'external',
    }));
  }, []);

  const setSpaceSelection = useCallback((spaceType: 'external' | 'internal') => {
    setInsertionContext(prev => ({
      ...prev,
      selectedSpace: spaceType,
      mode: spaceType === 'external' ? InsertionMode.STRUCTURAL : InsertionMode.INTERNAL,
    }));
  }, []);

  const setHighlightedSpace = useCallback((spaceType: 'external' | 'internal' | undefined) => {
    setInsertionContext(prev => ({
      ...prev,
      highlightedSpace: spaceType,
    }));
  }, []);

  return {
    space,
    insertionContext,
    createNewSpace,
    addPiece,
    removePiece,
    updateSpaceDimensions,
    clearAll,
    toggleInsertionMode,
    setSpaceSelection,
    setHighlightedSpace,
  };
};

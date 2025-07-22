import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FurnitureSpace, Dimensions, PieceType, FurniturePiece } from '../types/furniture';
import { InsertionMode, InsertionContext } from '../types/insertion';
import { SpaceCuttingSystem } from '../utils/spaceCutting';

// Interface para as divisões manuais
interface ManualDivision {
  id: string;
  parentSpaceId: string;
  axis: 'x' | 'y';
  value: number;
  fromEnd: boolean;
}

// Configurações de Peças (pode ser mantido como estava)
const PIECE_CONFIG: Record<string, { name: string; color: string }> = {
    [PieceType.LATERAL_LEFT]: { name: 'Lateral Esquerda', color: '#8b5cf6' },
    [PieceType.LATERAL_RIGHT]: { name: 'Lateral Direita', color: '#8b5cf6' },
    [PieceType.BOTTOM]: { name: 'Base', color: '#ef4444' },
    [PieceType.TOP]: { name: 'Tampo', color: '#ef4444' },
    [PieceType.LATERAL_BACK]: { name: 'Costas', color: '#facc15' },
    [PieceType.LATERAL_FRONT]: { name: 'Frontal', color: '#f59e0b' },
    [PieceType.SHELF]: { name: 'Prateleira', color: '#10b981' },
    [PieceType.DIVIDER_VERTICAL]: { name: 'Divisória Vertical', color: '#3b82f6' },
};

export const useSimplifiedFurnitureDesign = () => {
    const [defaultThickness, setDefaultThickness] = useState(18);
    const [allPieces, setAllPieces] = useState<FurniturePiece[]>([]);
    const [manualDivisions, setManualDivisions] = useState<ManualDivision[]>([]);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>('main');
    const [mainSpaceInfo, setMainSpaceInfo] = useState({
        id: 'main',
        name: 'Móvel Principal',
        originalDimensions: { width: 800, height: 2100, depth: 600 },
    });
    // Definição das texturas disponíveis
    const availableTextures = [
        { name: 'Branco', url: '/public/textures/mdf-branco.jpg' },
        { name: 'Carvalho', url: '/public/textures/mdf-carvalho.jpg' },
        { name: 'Cinza', url: '/public/textures/mdf-cinza.jpg' },
        { name: 'Nogueira', url: '/public/textures/mdf-nogueira.jpg' },
    ];
    const [currentTexture, setCurrentTexture] = useState(availableTextures[0]);
    // ... (outros states que você possa ter, como insertionContext, currentTexture, etc.)

    const memoizedState = useMemo(() => {
        // 1. Espaço raiz
        const rootSpace: FurnitureSpace = {
            ...mainSpaceInfo,
            currentDimensions: mainSpaceInfo.originalDimensions,
            position: { x: 0, y: 0, z: 0 },
            pieces: [], isActive: true,
        };

        // 2. Processamento sequencial das peças (divisões por peça)
        let spacesAfterPhysicalPieces: FurnitureSpace[] = [rootSpace];
        let processablePieces = [...allPieces];
        let positionedPieces: FurniturePiece[] = [];
        let processedPieceIds = new Set<string>();
        let changed = true;
        while (changed && processablePieces.length > 0) {
            changed = false;
            const piece = processablePieces.find(p => spacesAfterPhysicalPieces.some(s => s.id === p.parentSpaceId));
            if (piece) {
                const parentIndex = spacesAfterPhysicalPieces.findIndex(s => s.id === piece.parentSpaceId);
                const parentSpace = spacesAfterPhysicalPieces[parentIndex];
                const positioned = { ...piece, position: SpaceCuttingSystem.calculatePiecePosition(parentSpace, piece), dimensions: SpaceCuttingSystem.calculatePieceDimensions(parentSpace, piece.type, piece.thickness) };
                positionedPieces.push(positioned);
                processedPieceIds.add(piece.id);
                if ([PieceType.SHELF, PieceType.DIVIDER_VERTICAL].includes(piece.type)) {
                    const newSubSpaces = SpaceCuttingSystem.divideSpace(parentSpace, positioned);
                    spacesAfterPhysicalPieces.splice(parentIndex, 1, ...newSubSpaces);
                } else {
                    const newReducedSpace = SpaceCuttingSystem.applyCutToSpace(parentSpace, positioned);
                    spacesAfterPhysicalPieces.splice(parentIndex, 1, newReducedSpace);
                }
                processablePieces = processablePieces.filter(p => p.id !== piece.id);
                changed = true;
            }
        }

        // 3. Processamento das divisões manuais
        let finalActiveSpaces = [...spacesAfterPhysicalPieces];
        let divisionsToProcess = [...manualDivisions];
        changed = true;
        while(changed && divisionsToProcess.length > 0) {
            changed = false;
            const division = divisionsToProcess.find(d => finalActiveSpaces.some(s => s.id === d.parentSpaceId));
            if (division) {
                const parentIndex = finalActiveSpaces.findIndex(s => s.id === division.parentSpaceId);
                if (parentIndex > -1) {
                    const parentSpace = finalActiveSpaces[parentIndex];
                    const newSubSpaces = SpaceCuttingSystem.divideSpaceByMeasurement(parentSpace, division.axis, division.value, division.fromEnd);
                    if (newSubSpaces.length > 0) {
                        finalActiveSpaces.splice(parentIndex, 1, ...newSubSpaces);
                        divisionsToProcess = divisionsToProcess.filter(d => d.id !== division.id);
                        changed = true;
                    }
                }
            }
        }

        // 4. Para cada espaço folha manual, associe e posicione apenas peças ainda não processadas
        const manualPositionedPieces: FurniturePiece[] = allPieces
            .filter(piece => !processedPieceIds.has(piece.id) && finalActiveSpaces.some(s => s.id === piece.parentSpaceId))
            .map(piece => {
                const targetSpace = finalActiveSpaces.find(s => s.id === piece.parentSpaceId);
                if (!targetSpace) return piece;
                return {
                    ...piece,
                    position: SpaceCuttingSystem.calculatePiecePosition(targetSpace, piece),
                    dimensions: SpaceCuttingSystem.calculatePieceDimensions(targetSpace, piece.type, piece.thickness)
                };
            });

        // 5. Associe as peças aos espaços finais
        const finalSpacesWithPieces = finalActiveSpaces.map(space => ({
            ...space,
            pieces: [...positionedPieces.filter(p => p.parentSpaceId === space.id), ...manualPositionedPieces.filter(p => p.parentSpaceId === space.id)]
        }));

        // 6. O espaço principal mantém as peças e subSpaces
        const finalContainerSpace = { ...rootSpace, pieces: positionedPieces, subSpaces: finalSpacesWithPieces, isActive: allPieces.length === 0 && manualDivisions.length === 0 };
        return { space: finalContainerSpace, activeSpaces: finalSpacesWithPieces, allPieces: [...positionedPieces, ...manualPositionedPieces] };
    }, [allPieces, manualDivisions, mainSpaceInfo]);

    const selectSpace = useCallback((spaceId: string | null) => { setSelectedSpaceId(spaceId); }, []);

    const addPiece = useCallback((pieceType: PieceType) => {
        const targetSpace = memoizedState.activeSpaces.find(s => s.id === selectedSpaceId) || memoizedState.space;
        if (!targetSpace) return;
        const config = PIECE_CONFIG[pieceType];
        const newPiece: FurniturePiece = { id: uuidv4(), type: pieceType, name: config.name, thickness: defaultThickness, color: config.color, position: targetSpace.position, dimensions: { width: 0, height: 0, depth: 0 }, parentSpaceId: targetSpace.id };
        setAllPieces(prev => [...prev, newPiece]);
    }, [selectedSpaceId, defaultThickness, memoizedState.activeSpaces, memoizedState.space]);
    
    const splitSpace = useCallback((spaceToSplitId: string, axis: 'x' | 'y', value: number, fromEnd: boolean) => {
        const newDivision: ManualDivision = { id: uuidv4(), parentSpaceId: spaceToSplitId, axis, value, fromEnd };
        setManualDivisions(prev => [...prev, newDivision]);
    }, []);

    const removePiece = useCallback((pieceId: string) => {
        setAllPieces(prev => {
            const pieceToRemove = prev.find(p => p.id === pieceId);
            if (!pieceToRemove) return prev;
            const parentIdOfRemoved = pieceToRemove.parentSpaceId;
            return prev.filter(p => p.id !== pieceId).map(p => (p.parentSpaceId && p.parentSpaceId.includes(pieceToRemove.id)) ? { ...p, parentSpaceId: parentIdOfRemoved } : p);
        });
        if (selectedSpaceId?.includes(pieceId)) setSelectedSpaceId('main');
    }, [selectedSpaceId]);

    const clearAllPieces = useCallback(() => {
        setAllPieces([]);
        setManualDivisions([]);
    }, []);

    const updateDimensions = useCallback((newDimensions: Dimensions) => {
        setMainSpaceInfo(prev => ({ ...prev, originalDimensions: newDimensions }));
    }, []);

    // Adicione aqui outros states e callbacks que você precisa retornar
    return { 
        ...memoizedState, 
        selectSpace, 
        addPiece, 
        splitSpace, 
        removePiece, 
        clearAllPieces, 
        updateDimensions, 
        selectedSpaceId, 
        availableTextures,
        currentTexture,
        setCurrentTexture,
        defaultThickness,
        setDefaultThickness
    };
};



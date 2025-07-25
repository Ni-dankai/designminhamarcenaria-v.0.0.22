import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FurnitureSpace, Dimensions, PieceType, FurniturePiece } from '../types/furniture';
import { InsertionMode, InsertionContext } from '../types/insertion';
import { SpaceCuttingSystem } from '../utils/spaceCutting';

// =====================================================================================
// CORREÇÃO: "Carvalho" movido para a primeira posição da lista
// =====================================================================================
export const availableTextures = [
    { name: 'Carvalho', url: '/textures/mdf-carvalho.jpg' },
    { name: 'Branco TX', url: '/textures/mdf-branco.jpg' },
    { name: 'Nogueira', url: '/textures/mdf-nogueira.jpg' },
    { name: 'Cinza Sagrado', url: '/textures/mdf-cinza.jpg' },
];

const PIECE_CONFIG: Record<string, { name: string; color: string }> = {
    [PieceType.LATERAL_LEFT]: { name: 'Lateral Esquerda', color: '#8b5cf6' },
    [PieceType.LATERAL_RIGHT]: { name: 'Lateral Direita', color: '#8b5cf6' },
    [PieceType.LATERAL_FRONT]: { name: 'Lateral Frontal', color: '#f59e0b' },
    [PieceType.LATERAL_BACK]: { name: 'Costas', color: '#facc15' },
    [PieceType.BOTTOM]: { name: 'Base', color: '#ef4444' },
    [PieceType.TOP]: { name: 'Tampo', color: '#ef4444' },
    [PieceType.SHELF]: { name: 'Prateleira', color: '#10b981' },
    [PieceType.DIVIDER_VERTICAL]: { name: 'Divisória Vertical', color: '#3b82f6' },
};

export const useSimplifiedFurnitureDesign = () => {
    const [defaultThickness, setDefaultThickness] = useState(18);
    const [allPieces, setAllPieces] = useState<FurniturePiece[]>([]);
    const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>('main');
    const [mainSpaceInfo, setMainSpaceInfo] = useState({
        id: 'main',
        name: 'Móvel Principal',
        originalDimensions: { width: 800, height: 2100, depth: 600 },
    });
    const [insertionContext, setInsertionContext] = useState<InsertionContext>({ mode: InsertionMode.STRUCTURAL });

    // NOVO: State para controlar a textura atual
    const [currentTexture, setCurrentTexture] = useState(availableTextures[0]);

    const memoizedState = useMemo(() => {
        // Lista final de todas as peças com posições e dimensões corretas para renderizar
        const positionedPieces: FurniturePiece[] = [];

        // Função recursiva que constrói a árvore de espaços e posiciona as peças
        const buildTree = (parentSpace: FurnitureSpace): FurnitureSpace => {
            let currentVoid = { ...parentSpace };
            
            // Encontra todas as peças que são filhas diretas do espaço atual
            const childPieces = allPieces.filter(p => p.parentSpaceId === parentSpace.id);

            // Separa peças que cortam (estruturais) das que dividem (internas)
            const cuttingPieces = childPieces.filter(p => ![PieceType.SHELF, PieceType.DIVIDER_VERTICAL].includes(p.type));
            const dividingPieces = childPieces.filter(p => [PieceType.SHELF, PieceType.DIVIDER_VERTICAL].includes(p.type));

            // 1. Aplica todas as peças que CORTAM o espaço atual
            cuttingPieces.forEach(piece => {
                const positioned = { ...piece,
                    position: SpaceCuttingSystem.calculatePiecePosition(currentVoid, piece),
                    dimensions: SpaceCuttingSystem.calculatePieceDimensions(currentVoid, piece.type, piece.thickness),
                };
                positionedPieces.push(positioned);
                currentVoid = SpaceCuttingSystem.applyCutToSpace(currentVoid, piece);
            });

            // Se não houver peças que dividem, este é um espaço final (ativo)
            if (dividingPieces.length === 0) {
                return currentVoid;
            }

            // 2. Usa a primeira peça que DIVIDE para criar subespaços
            dividingPieces.sort(a => a.type === PieceType.DIVIDER_VERTICAL ? -1 : 1); // Prioriza divisórias
            const divider = dividingPieces[0];
            
            const positionedDivider = { ...divider,
                position: SpaceCuttingSystem.calculatePiecePosition(currentVoid, divider),
                dimensions: SpaceCuttingSystem.calculatePieceDimensions(currentVoid, divider.type, divider.thickness),
            };
            positionedPieces.push(positionedDivider);
            
            currentVoid.isActive = false;
            const subSpaces = SpaceCuttingSystem.divideSpace(currentVoid, positionedDivider);
            
            // 3. Chamada recursiva para cada subespaço
            currentVoid.subSpaces = subSpaces.map(sub => buildTree(sub));
            
            return currentVoid;
        };

        const rootSpace: FurnitureSpace = {
            ...mainSpaceInfo,
            currentDimensions: mainSpaceInfo.originalDimensions,
            position: { x: 0, y: 0, z: 0 },
            pieces: [], isActive: true,
        };

        const spaceTree = buildTree(rootSpace);
        
        const collectActiveSpaces = (s: FurnitureSpace): FurnitureSpace[] => {
            if (s.subSpaces && s.subSpaces.length > 0) {
                return s.subSpaces.flatMap(collectActiveSpaces);
            }
            return s.isActive ? [s] : [];
        };
        
        return {
            space: spaceTree,
            activeSpaces: collectActiveSpaces(spaceTree),
            positionedPieces,
        };
    }, [allPieces, mainSpaceInfo]);

    const getSelectedSpace = useCallback((): FurnitureSpace | null => {
        const find = (s: FurnitureSpace, id: string): FurnitureSpace | null => {
            if (s.id === id) return s;
            if (s.subSpaces) {
                for(const sub of s.subSpaces) {
                    const found = find(sub, id);
                    if (found) return found;
                }
            }
            return null;
        }
        return selectedSpaceId ? find(memoizedState.space, selectedSpaceId) : memoizedState.space;
    }, [selectedSpaceId, memoizedState.space]);

    const addPiece = useCallback((pieceType: PieceType) => {
        const targetSpace = getSelectedSpace();
        if (!targetSpace) return;
        
        const config = PIECE_CONFIG[pieceType];
        const newPiece: FurniturePiece = {
            id: uuidv4(), type: pieceType, name: config.name,
            thickness: defaultThickness, color: config.color,
            position: targetSpace.position,
            dimensions: { width: 0, height: 0, depth: 0 },
            parentSpaceId: targetSpace.id,
        };
        setAllPieces(prev => [...prev, newPiece]);
    }, [getSelectedSpace, defaultThickness]);

    const removePiece = useCallback((pieceId: string) => {
        setAllPieces(prev => {
            const pieceToRemove = prev.find(p => p.id === pieceId);
            if (!pieceToRemove) return prev;
            const parentIdOfRemoved = pieceToRemove.parentSpaceId;
            return prev
                .filter(p => p.id !== pieceId)
                .map(p => {
                    if (p.parentSpaceId && p.parentSpaceId.includes(pieceToRemove.id)) {
                        return { ...p, parentSpaceId: parentIdOfRemoved };
                    }
                    return p;
                });
        });
        if (selectedSpaceId && selectedSpaceId.includes(pieceId)) setSelectedSpaceId('main');
    }, [selectedSpaceId]);

    // =====================================================================================
    // CORREÇÃO: A função agora atualiza as dimensões sem apagar as peças.
    // =====================================================================================
    const updateDimensions = useCallback((newDimensions: Dimensions) => {
        // A linha "setAllPieces([]);" foi removida.
        
        // Apenas atualizamos as dimensões originais do móvel.
        setMainSpaceInfo(prev => ({ 
            ...prev, 
            originalDimensions: newDimensions 
        }));
        
        // Resetamos a seleção para o espaço principal.
        setSelectedSpaceId('main');
    }, []);

    const clearAllPieces = useCallback(() => {
        setAllPieces([]);
        setSelectedSpaceId('main');
    }, []);

    const setInsertionMode = useCallback((mode: InsertionMode) => { setInsertionContext({ mode }); }, []);

    return {
        space: memoizedState.space,
        activeSpaces: memoizedState.activeSpaces,
        allPieces: memoizedState.positionedPieces,
        addPiece, removePiece, updateDimensions, clearAllPieces,
        selectedSpaceId, selectSpace: setSelectedSpaceId,
        insertionContext, setInsertionMode,
        defaultThickness, setDefaultThickness,
        // NOVO: propriedades para textura
        currentTexture,
        setCurrentTexture,
        availableTextures,
    };
};



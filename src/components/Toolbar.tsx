import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { PieceType, FurniturePiece } from '../types/furniture';

// ALTERAÇÃO 1: Novas posições definidas para evitar sobreposição.
type FloatingPanelPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'topCenter' | 'topCenterBelow';

const PiecesList = styled.div`
  max-height: 220px;
  overflow-y: auto;
  padding: var(--space-2);
`;

const FloatingPanel = styled.div<{ position: FloatingPanelPosition }>`
  position: fixed;
  z-index: 1000;
  background: var(--color-toolbar-surface, #ffffffcc);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-xl, 12px);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border, #e5e7eb);
  padding: var(--space-3);
  min-width: 180px;
  ${(props) => {
    switch (props.position) {
      case 'topLeft': return 'top: 16px; left: 16px;';
      case 'topRight': return 'top: 16px; right: 16px;';
      case 'bottomLeft': return 'bottom: 16px; left: 16px;';
      case 'bottomRight': return 'bottom: 16px; right: 16px;';
      // ALTERAÇÃO 2: Posições centrais ajustadas para não conflitarem.
      case 'topCenter': return 'top: 16px; left: 50%; transform: translateX(-50%);';
      case 'topCenterBelow': return 'top: 90px; left: 50%; transform: translateX(-50%);';
      default: return '';
    }
  }}
`;

const ToolbarSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-2);
  padding: 8px 0 0 0;
  margin: 0;
  width: 100%;
  border: none;

  @media (max-width: 900px) {
    flex-wrap: wrap;
    gap: var(--space-1);
    padding: 4px 0 0 0;
  }
`;

const SectionLabel = styled.span`
  font-size: var(--font-size-xs, 12px);
  font-weight: 700;
  color: var(--color-primary);
  margin-right: var(--space-2);
  min-width: 80px;
  text-align: right;
`;

const ToolButton = styled.button`
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 6px);
  font-size: var(--font-size-sm, 14px);
  font-weight: 500;
  cursor: pointer;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: all 0.2s ease;
  margin: var(--space-1) !important;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`;

const DimensionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-background-alt, #f9fafb);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md, 6px);
  border: 1px solid var(--color-border-light, #f3f4f6);
`;

const DimensionInput = styled.input`
  width: 60px;
  padding: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm, 4px);
  font-size: var(--font-size-sm);
  text-align: center;
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 600;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light, #dbeafe);
  }
`;

const TextureSwatch = styled.button<{ $imageUrl: string; $isActive: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${({ $isActive }) => ($isActive ? 'var(--color-primary)' : 'var(--color-border)')};
  background-image: url(${({ $imageUrl }) => $imageUrl});
  background-size: cover;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ $isActive }) => ($isActive ? '0 0 0 4px var(--color-primary)' : 'none')};

  &:hover {
    transform: scale(1.1);
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1001;
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  min-width: 260px;
  max-height: 320px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownHeader = styled.div`
  padding: var(--space-3) var(--space-4);
  background: var(--color-background-alt);
  font-weight: 600;
`;

interface ToolbarProps {
  onAddPiece: (pieceType: PieceType) => void;
  onClearAll: () => void;
  pieces: FurniturePiece[];
  onRemovePiece: (pieceId: string) => void;
  originalDimensions: { width: number; height: number; depth: number };
  onUpdateDimensions: (dimensions: { width: number; height: number; depth: number }) => void;
  defaultThickness: number;
  onThicknessChange: (thickness: number) => void;
  availableTextures: { name: string; url: string; }[];
  currentTexture: { url: string; };
  onTextureChange: (texture: any) => void;
  onHoverPiece?: (id: string | null) => void;
}

const PieceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-1);
  border-radius: var(--radius-md);
  transition: background 0.2s ease;
  &:hover {
    background: var(--color-background-alt);
  }
`;

const PieceName = styled.span`
  font-weight: 500;
  color: var(--color-text-secondary);
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1.2em;
  line-height: 1;
  padding: 4px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    color: var(--color-error);
    background: var(--color-error)15;
  }
`;

const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddPiece,
  onClearAll,
  pieces,
  onRemovePiece,
  originalDimensions,
  onUpdateDimensions,
  defaultThickness,
  onThicknessChange,
  availableTextures,
  currentTexture,
  onTextureChange,
  onHoverPiece,
}) => {
  const [tempDimensions, setTempDimensions] = useState(originalDimensions);
  const [showPiecesList, setShowPiecesList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempDimensions(originalDimensions);
  }, [originalDimensions]);

  const hasChanges = tempDimensions.width !== originalDimensions.width || 
                     tempDimensions.height !== originalDimensions.height || 
                     tempDimensions.depth !== originalDimensions.depth;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onUpdateDimensions(tempDimensions);
    }
  };

  const handleApplyDimensions = () => {
    onUpdateDimensions(tempDimensions);
  };

  return (
    <>
      {/* Estrutura - topo esquerdo */}
      <FloatingPanel position="topLeft">
        <SectionLabel>Estrutura</SectionLabel>
        <ToolButton onClick={() => onAddPiece(PieceType.LATERAL_LEFT)} title="Lateral Esquerda">L. Esq</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.LATERAL_RIGHT)} title="Lateral Direita">L. Dir</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.BOTTOM)} title="Base">Base</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.TOP)} title="Tampo">Tampo</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.LATERAL_BACK)} title="Costas">Costas</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.LATERAL_FRONT)} title="Peça Frontal">Frontal</ToolButton>
      </FloatingPanel>

      {/* Divisões - topo direito */}
      <FloatingPanel position="topRight">
        <SectionLabel>Divisões</SectionLabel>
        <ToolButton onClick={() => onAddPiece(PieceType.SHELF)} title="Prateleira">Prateleira</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.DIVIDER_VERTICAL)} title="Divisória Vertical">Divisória V.</ToolButton>
      </FloatingPanel>

      {/* ALTERAÇÃO 3: Usando a posição 'topCenter' para o painel de Dimensões. */}
      <FloatingPanel position="topCenter">
        <SectionLabel>Dimensões</SectionLabel>
        <DimensionGroup>
          <SectionLabel style={{marginLeft: '4px'}}>L</SectionLabel>
          <DimensionInput 
            type="number" 
            value={tempDimensions.width} 
            onChange={(e) => setTempDimensions(p => ({...p, width: Number(e.target.value)}))} 
            onKeyDown={handleKeyDown}
          />
          <SectionLabel>A</SectionLabel>
          <DimensionInput 
            type="number" 
            value={tempDimensions.height} 
            onChange={(e) => setTempDimensions(p => ({...p, height: Number(e.target.value)}))} 
            onKeyDown={handleKeyDown}
          />
          <SectionLabel>P</SectionLabel>
          <DimensionInput 
            type="number" 
            value={tempDimensions.depth} 
            onChange={(e) => setTempDimensions(p => ({...p, depth: Number(e.target.value)}))} 
            onKeyDown={handleKeyDown}
          />
          <span style={{color: 'var(--color-text-muted)', paddingRight: '4px'}}>mm</span>
        </DimensionGroup>
        <ToolButton onClick={handleApplyDimensions} title="Aplicar dimensões" disabled={!hasChanges}>✓</ToolButton>
        <ToolButton onClick={() => setTempDimensions(originalDimensions)} title="Resetar dimensões">↺</ToolButton>
      </FloatingPanel>

      {/* Espessura - canto inferior esquerdo */}
      <FloatingPanel position="bottomLeft">
        <SectionLabel>Espessura</SectionLabel>
        <DimensionGroup>
          <DimensionInput
            type="number"
            value={defaultThickness}
            onChange={(e) => onThicknessChange(Number(e.target.value))}
          />
          <span style={{color: 'var(--color-text-muted)', paddingRight: '4px'}}>mm</span>
        </DimensionGroup>
      </FloatingPanel>

      {/* Acabamento - canto inferior direito */}
      <FloatingPanel position="bottomRight">
        <SectionLabel>Acabamento</SectionLabel>
        {availableTextures && availableTextures.map(texture => (
            <TextureSwatch
                key={texture.url}
                $imageUrl={texture.url}
                $isActive={currentTexture?.url === texture.url}
                onClick={() => onTextureChange(texture)}
                title={texture.name}
            />
        ))}
      </FloatingPanel>

      {/* ALTERAÇÃO 4: Usando a posição 'topCenterBelow' para o painel Gerenciar. */}
      <FloatingPanel position="topCenterBelow">
        <SectionLabel>Gerenciar</SectionLabel>
        <div style={{position: 'relative'}} ref={dropdownRef}>
          <ToolButton 
            disabled={!pieces || pieces.length === 0}
            onClick={() => setShowPiecesList(s => !s)}
          >
            Peças ({pieces ? pieces.length : 0}) {showPiecesList ? '▲' : '▼'}
          </ToolButton>
          <Dropdown $isOpen={showPiecesList}>
            <DropdownHeader>Peças Adicionadas</DropdownHeader>
            <PiecesList>
              {pieces && pieces.length > 0 ? pieces.map((piece) => (
                <PieceItem 
                  key={piece.id}
                  onMouseEnter={() => onHoverPiece && onHoverPiece(piece.id)}
                  onMouseLeave={() => onHoverPiece && onHoverPiece(null)}
                >
                  <PieceName>{piece.name}</PieceName>
                  <RemoveButton onClick={() => onRemovePiece(piece.id)} title="Remover">✕</RemoveButton>
                </PieceItem>
              )) : <div style={{color: 'var(--color-text-muted)', padding: '8px'}}>Nenhuma peça adicionada</div>}
            </PiecesList>
          </Dropdown>
        </div>
        <ToolButton onClick={onClearAll} title="Limpar tudo">Limpar</ToolButton>
      </FloatingPanel>
    </>
  );
};

export { Toolbar };

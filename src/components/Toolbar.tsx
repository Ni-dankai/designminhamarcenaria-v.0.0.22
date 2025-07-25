import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { PieceType, FurniturePiece } from '../types/furniture';

// Seus Componentes Estilizados (Styled Components)
// ToolbarContainer, ToolbarSection, ToolButton, etc.

const ToolbarContainer = styled.div`
  position: fixed;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-toolbar-surface, #ffffffcc);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl, 12px);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border, #e5e7eb);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: var(--space-3);
  flex-wrap: wrap; /* Permite que os itens quebrem a linha */
  justify-content: center;

  /* =================================================================== */
  /* CORREÇÃO: Delimitando a largura da Toolbar                          */
  /* =================================================================== */
  width: auto; /* A largura se ajusta ao conteúdo */
  max-width: 1600px; /* Largura máxima para telas grandes */

  @media (max-width: 1600px) {
    max-width: 95vw; /* Em telas menores, ocupa 95% da largura */
  }
`;

const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);

  &:not(:last-child) {
    border-right: 1px solid var(--color-border);
  }

  @media (max-width: 1600px) {
    border-right: none !important;
  }
`;

const SectionLabel = styled.span`
  font-size: var(--font-size-xs, 12px);
  font-weight: 600;
  color: var(--color-text-muted, #6b7280);
  margin-right: var(--space-2);
`;

const ToolButton = styled.button`
  /* =================================================================== */
  /* CORREÇÃO: Aumentado o padding para dar mais respiro aos botões      */
  /* =================================================================== */
  padding: var(--space-2) var(--space-4); /* Antes: var(--space-2) var(--space-3) */
  
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

  /* =================================================================== */
  /* CORREÇÃO: Adicionado espaçamento vertical e horizontal (margem)     */
  /* =================================================================== */
  margin: var(--space-1) !important; /* Adiciona uma pequena margem em todos os lados */

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
  width: 60px; /* Aumentado um pouco para melhor visualização */
  padding: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm, 4px);
  font-size: var(--font-size-sm);
  text-align: center;
  background: var(--color-surface);
  color: var(--color-text); /* Garante que a cor principal seja usada */
  
  /* =================================================================== */
  /* CORREÇÃO: Aumenta o peso da fonte para dar mais destaque            */
  /* =================================================================== */
  font-weight: 600;

  /* Remove as setas de aumentar/diminuir (steppers) do input */
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
  color: var(--color-text);
`;

const PiecesList = styled.div`
  max-height: 220px;
  overflow-y: auto;
  padding: var(--space-2);
`;

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

// ... Defina aqui os outros styled-components que você usa (Dropdown, PiecesList, etc)

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

export const Toolbar: React.FC<ToolbarProps> = ({ 
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
    <ToolbarContainer>
      {/* ======================================================================= */}
      {/* SEÇÕES RESTAURADAS */}
      {/* ======================================================================= */}
      <ToolbarSection>
        <SectionLabel>Espessura</SectionLabel>
        <DimensionGroup>
          <DimensionInput
            type="number"
            value={defaultThickness}
            onChange={(e) => onThicknessChange(Number(e.target.value))}
          />
          <span style={{color: 'var(--color-text-muted)', paddingRight: '4px'}}>mm</span>
        </DimensionGroup>
      </ToolbarSection>
      
      <ToolbarSection>
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
      </ToolbarSection>

      <ToolbarSection>
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
      </ToolbarSection>

      {/* Seções de Peças */}
      <ToolbarSection>
        <SectionLabel>Estrutura</SectionLabel>
        <ToolButton onClick={() => onAddPiece(PieceType.LATERAL_LEFT)} title="Lateral Esquerda">L. Esq</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.LATERAL_RIGHT)} title="Lateral Direita">L. Dir</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.BOTTOM)} title="Base">Base</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.TOP)} title="Tampo">Tampo</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.LATERAL_BACK)} title="Costas">Costas</ToolButton>
        {/* =================================================================== */}
        {/* BOTÃO ADICIONADO: Peça Frontal                                      */}
        {/* =================================================================== */}
        <ToolButton onClick={() => onAddPiece(PieceType.LATERAL_FRONT)} title="Peça Frontal">Frontal</ToolButton>
      </ToolbarSection>

      <ToolbarSection>
        <SectionLabel>Divisões</SectionLabel>
        <ToolButton onClick={() => onAddPiece(PieceType.SHELF)} title="Prateleira">Prateleira</ToolButton>
        <ToolButton onClick={() => onAddPiece(PieceType.DIVIDER_VERTICAL)} title="Divisória Vertical">Divisória V.</ToolButton>
      </ToolbarSection>
      
      {/* Seção de Gerenciamento */}
      <ToolbarSection>
        <SectionLabel>Gerenciar</SectionLabel>
        {/* Container do Dropdown */}
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
                  <RemoveButton onClick={() => onRemovePiece(piece.id)} title={`Remover ${piece.name}`}>×</RemoveButton>
                </PieceItem>
              )) : <div style={{padding: '16px', color: 'var(--color-text-muted)'}}>Nenhuma peça.</div>}
            </PiecesList>
          </Dropdown>
        </div>
        <ToolButton onClick={onClearAll} disabled={!pieces || pieces.length === 0}>
          Limpar
        </ToolButton>
      </ToolbarSection>
    </ToolbarContainer>
  );
};

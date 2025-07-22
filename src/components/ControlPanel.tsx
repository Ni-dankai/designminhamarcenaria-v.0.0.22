import styled from 'styled-components';
import { PieceType, Dimensions } from '../types/furniture';
import { useState } from 'react';

const ControlPanelContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
  z-index: 1000;
`;

const Section = styled.div`
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #3b82f6;
          color: white;
          &:hover { background: #2563eb; }
        `;
      case 'secondary':
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover { background: #e5e7eb; }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
        `;
    }
  }}
`;

const PieceList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const PieceItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 6px;
`;

const PieceName = styled.span`
  flex: 1;
  font-size: 14px;
  color: #374151;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #dc2626;
  }
`;

const ModeIndicator = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ isActive }) => {
    if (isActive) {
      return `
        background: #dbeafe;
        color: #1e40af;
        border: 2px solid #3b82f6;
      `;
    } else {
      return `
        background: #f3f4f6;
        color: #6b7280;
        border: 2px solid #e5e7eb;
        &:hover {
          background: #e5e7eb;
        }
      `;
    }
  }}
`;

const ModeIcon = styled.div<{ isActive: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  ${({ isActive }) => 
    isActive ? 'background: #3b82f6;' : 'background: #9ca3af;'
  }
`;

interface ControlPanelProps {
  space: any;
  insertionContext: any;
  addPiece: (type: PieceType) => void;
  removePiece: (id: string) => void;
  updateSpaceDimensions: (dimensions: Dimensions) => void;
  clearAll: () => void;
  toggleInsertionMode: () => void;
  setSpaceSelection: (selection: string) => void;
}

export const ControlPanel = ({ 
  space, 
  insertionContext,
  addPiece, 
  removePiece, 
  updateSpaceDimensions, 
  clearAll,
  toggleInsertionMode
}: ControlPanelProps) => {
  const [dimensions, setDimensions] = useState<Dimensions>(space.originalDimensions);

  const handleDimensionChange = (key: keyof Dimensions, value: string) => {
    const numValue = parseInt(value) || 0;
    setDimensions((prev: Dimensions) => ({ ...prev, [key]: numValue }));
  };

  const handleUpdateDimensions = () => {
    updateSpaceDimensions(dimensions);
  };

  // Filtrar peças baseado no modo atual
  const getAvailablePieces = () => {
    if (insertionContext.mode === 'structural') {
      return [
        { type: PieceType.LATERAL_LEFT, label: 'Lateral Esquerda' },
        { type: PieceType.LATERAL_RIGHT, label: 'Lateral Direita' },
        { type: PieceType.LATERAL_FRONT, label: 'Lateral Frontal' },
        { type: PieceType.LATERAL_BACK, label: 'Lateral Traseira' },
        { type: PieceType.BOTTOM, label: 'Fundo' },
        { type: PieceType.TOP, label: 'Tampo' },
      ];
    } else {
      return [
        { type: PieceType.SHELF, label: 'Prateleira' },
        { type: PieceType.DIVIDER_VERTICAL, label: 'Divisória Vertical' },
      ];
    }
  };

  return (
    <ControlPanelContainer>
      <h2 style={{ marginTop: 0, color: '#1f2937' }}>Design Minha Marcenaria</h2>
      
      <Section>
        <SectionTitle>Modo de Inserção</SectionTitle>
        <ModeIndicator 
          isActive={insertionContext.mode === 'structural'} 
          onClick={toggleInsertionMode}
        >
          <ModeIcon isActive={insertionContext.mode === 'structural'} />
          Estrutural (Laterais, Fundo, Tampo)
        </ModeIndicator>
        <ModeIndicator 
          isActive={insertionContext.mode === 'internal'} 
          onClick={toggleInsertionMode}
        >
          <ModeIcon isActive={insertionContext.mode === 'internal'} />
          Interno (Prateleiras, Divisórias)
        </ModeIndicator>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
          {insertionContext.mode === 'structural' 
            ? '🔧 Clique no espaço verde externo na visualização 3D para selecionar estrutura'
            : '📦 Clique no espaço azul interno na visualização 3D para selecionar interior'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>Dimensões do Móvel (mm)</SectionTitle>
        <InputGroup>
          <Label>Largura</Label>
          <Input
            type="number"
            value={dimensions.width}
            onChange={(e) => handleDimensionChange('width', e.target.value)}
          />
        </InputGroup>
        <InputGroup>
          <Label>Altura</Label>
          <Input
            type="number"
            value={dimensions.height}
            onChange={(e) => handleDimensionChange('height', e.target.value)}
          />
        </InputGroup>
        <InputGroup>
          <Label>Profundidade</Label>
          <Input
            type="number"
            value={dimensions.depth}
            onChange={(e) => handleDimensionChange('depth', e.target.value)}
          />
        </InputGroup>
        <Button onClick={handleUpdateDimensions}>
          Atualizar Dimensões
        </Button>
      </Section>

      <Section>
        <SectionTitle>
          {insertionContext.mode === 'structural' ? 'Peças Estruturais' : 'Peças Internas'}
        </SectionTitle>
        {getAvailablePieces().map(({ type, label }) => (
          <Button
            key={type}
            variant="secondary"
            onClick={() => addPiece(type)}
          >
            + {label}
          </Button>
        ))}
      </Section>

      <Section>
        <SectionTitle>Peças Adicionadas</SectionTitle>
        <PieceList>
          {space.pieces.map((piece: any) => (
            <PieceItem key={piece.id}>
              <PieceName>{piece.name}</PieceName>
              <RemoveButton onClick={() => removePiece(piece.id)}>
                Remover
              </RemoveButton>
            </PieceItem>
          ))}
          {space.pieces.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
              Nenhuma peça adicionada
            </p>
          )}
        </PieceList>
      </Section>

      <Section>
        <SectionTitle>Ações</SectionTitle>
        <Button variant="danger" onClick={clearAll}>
          Limpar Tudo
        </Button>
      </Section>

      <Section>
        <SectionTitle>Informações</SectionTitle>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          <p><strong>Espaço Restante:</strong></p>
          <p>L: {space.currentDimensions.width}mm</p>
          <p>A: {space.currentDimensions.height}mm</p>
          <p>P: {space.currentDimensions.depth}mm</p>
          <p><strong>Peças:</strong> {space.pieces.length}</p>
        </div>
      </Section>
    </ControlPanelContainer>
  );
};

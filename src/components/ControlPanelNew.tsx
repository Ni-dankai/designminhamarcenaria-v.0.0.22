import { useState } from 'react';
import styled from 'styled-components';
import { PieceType, Dimensions } from '../types/furniture';
// Removido: import { useFurnitureDesign } from '../hooks/useFurnitureDesign';

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

const ModeIndicator = styled.div<{ $isActive: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid;
  
  ${({ $isActive, $color }) => {
    if ($isActive) {
      return `
        background: ${$color}15;
        color: ${$color};
        border-color: ${$color};
        box-shadow: 0 2px 8px ${$color}20;
      `;
    } else {
      return `
        background: #f9fafb;
        color: #6b7280;
        border-color: #e5e7eb;
        &:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
      `;
    }
  }}
`;

const SpaceSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const SpaceButton = styled.button<{ $isSelected: boolean; $spaceType: 'external' | 'internal' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${({ $isSelected, $spaceType }) => {
    const colors = {
      external: { bg: '#22c55e', text: '#ffffff', border: '#22c55e' },
      internal: { bg: '#3b82f6', text: '#ffffff', border: '#3b82f6' }
    };
    
    const color = colors[$spaceType];
    
    if ($isSelected) {
      return `
        background: ${color.bg};
        color: ${color.text};
        border-color: ${color.border};
        box-shadow: 0 2px 8px ${color.bg}30;
      `;
    } else {
      return `
        background: white;
        color: ${color.bg};
        border-color: ${color.border};
        &:hover {
          background: ${color.bg}10;
        }
      `;
    }
  }}
`;

const ModeIcon = styled.div<{ $isActive: boolean; $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  ${({ $isActive, $color }) => 
    $isActive ? `background: ${$color};` : 'background: #9ca3af;'
  }
`;

const PieceList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const PieceItem = styled.div`
  display: flex;
  justify-content: space-between;
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

// Substituir o tipo ControlPanelProps por tipos explícitos
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
  toggleInsertionMode,
  setSpaceSelection
}: ControlPanelProps) => {
  const [dimensions, setDimensions] = useState<Dimensions>(space.originalDimensions);

  const handleDimensionChange = (key: keyof Dimensions, value: string) => {
    const numValue = parseInt(value) || 0;
    setDimensions(prev => ({ ...prev, [key]: numValue }));
  };

  const handleUpdateDimensions = () => {
    updateSpaceDimensions(dimensions);
  };

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

  const hasInternalSpace = space.currentDimensions.width > 0 && 
                          space.currentDimensions.height > 0 && 
                          space.currentDimensions.depth > 0;

  return (
    <ControlPanelContainer>
      <h2 style={{ marginTop: 0, color: '#1f2937' }}>Design Minha Marcenaria</h2>
      
      <Section>
        <SectionTitle>Seleção de Espaço</SectionTitle>
        <SpaceSelector>
          <SpaceButton 
            $isSelected={insertionContext.selectedSpace === 'external'}
            $spaceType="external"
            onClick={() => setSpaceSelection('external')}
          >
            🟢 Externo
          </SpaceButton>
          <SpaceButton 
            $isSelected={insertionContext.selectedSpace === 'internal'}
            $spaceType="internal"
            onClick={() => setSpaceSelection('internal')}
            disabled={!hasInternalSpace}
            style={!hasInternalSpace ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            🔵 Interno
          </SpaceButton>
        </SpaceSelector>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0', marginBottom: '16px' }}>
          {insertionContext.selectedSpace === 'external' 
            ? '🟢 Espaço Externo selecionado - Adicione peças estruturais (laterais, fundo, tampo)'
            : hasInternalSpace
              ? '🔵 Espaço Interno selecionado - Adicione prateleiras e divisórias'
              : '⚠️ Espaço interno não disponível. Adicione peças estruturais primeiro.'
          }
        </p>
      </Section>

      <Section>
        <SectionTitle>Modo de Inserção</SectionTitle>
        <ModeIndicator 
          $isActive={insertionContext.mode === 'structural'} 
          $color="#22c55e"
          onClick={toggleInsertionMode}
        >
          <ModeIcon $isActive={insertionContext.mode === 'structural'} $color="#22c55e">
            {insertionContext.mode === 'structural' ? '✓' : ''}
          </ModeIcon>
          Estrutural (Laterais, Fundo, Tampo)
        </ModeIndicator>
        <ModeIndicator 
          $isActive={insertionContext.mode === 'internal'} 
          $color="#3b82f6"
          onClick={toggleInsertionMode}
        >
          <ModeIcon $isActive={insertionContext.mode === 'internal'} $color="#3b82f6">
            {insertionContext.mode === 'internal' ? '✓' : ''}
          </ModeIcon>
          Interno (Prateleiras, Divisórias)
        </ModeIndicator>
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
          {insertionContext.mode === 'structural' ? 'Adicionar Peças Estruturais' : 'Adicionar Peças Internas'}
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
          <p><strong>Modo:</strong> {insertionContext.mode === 'structural' ? 'Estrutural' : 'Interno'}</p>
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

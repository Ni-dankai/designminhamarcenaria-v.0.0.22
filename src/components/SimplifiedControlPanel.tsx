import styled from 'styled-components';
import { PieceType } from '../types/furniture';
import { InsertionMode, InsertionContext } from '../types/insertion';

const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--color-border);
  max-width: 300px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1000;
`;

const Header = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  border-radius: 12px 12px 0 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const Section = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
`;

const ModeIndicator = styled.div<{ $isActive: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
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
        background: var(--color-background-alt);
        color: var(--color-text-secondary);
        border-color: var(--color-border);
        &:hover {
          background: var(--color-background);
          border-color: var(--color-primary);
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
    $isActive ? `background: ${$color};` : 'background: var(--color-secondary);'
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
`;

const PieceButton = styled.button<{ $color: string }>`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: ${({ $color }) => $color};
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const InstructionsText = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
`;

interface SimplifiedControlPanelProps {
  insertionContext: InsertionContext;
  onModeChange: (mode: InsertionMode) => void;
  onAddPiece: (pieceType: PieceType) => void;
  currentDimensions: { width: number; height: number; depth: number };
}

export const SimplifiedControlPanel = ({ 
  insertionContext, 
  onModeChange, 
  onAddPiece,
  currentDimensions
}: SimplifiedControlPanelProps) => {
  const toggleInsertionMode = () => {
    const newMode = insertionContext.mode === InsertionMode.STRUCTURAL 
      ? InsertionMode.INTERNAL 
      : InsertionMode.STRUCTURAL;
    onModeChange(newMode);
  };

  const structuralPieces = [
    { type: PieceType.LATERAL_LEFT, name: 'Lateral Esq.', color: '#8b5cf6' },
    { type: PieceType.LATERAL_RIGHT, name: 'Lateral Dir.', color: '#8b5cf6' },
    { type: PieceType.LATERAL_FRONT, name: 'Lateral Front.', color: '#f59e0b' },
    { type: PieceType.LATERAL_BACK, name: 'Lateral Tras.', color: '#f59e0b' },
    { type: PieceType.BOTTOM, name: 'Fundo', color: '#ef4444' },
    { type: PieceType.TOP, name: 'Tampo', color: '#ef4444' },
  ];

  const internalPieces = [
    { type: PieceType.SHELF, name: 'Prateleira', color: '#10b981' },
    { type: PieceType.DIVIDER_VERTICAL, name: 'Div. Vertical', color: '#3b82f6' },
  ];

  const hasInternalSpace = currentDimensions.width > 0 && 
                          currentDimensions.height > 0 && 
                          currentDimensions.depth > 0;

  return (
    <Container>
      <Header>
        <Title>Construtor de Móveis</Title>
      </Header>

      <Section>
        <SectionTitle>Modo de Inserção</SectionTitle>
        <ModeIndicator 
          $isActive={insertionContext.mode === InsertionMode.STRUCTURAL} 
          $color="#22c55e"
          onClick={toggleInsertionMode}
        >
          <ModeIcon $isActive={insertionContext.mode === InsertionMode.STRUCTURAL} $color="#22c55e">
            {insertionContext.mode === InsertionMode.STRUCTURAL ? '✓' : ''}
          </ModeIcon>
          Estrutural (Laterais, Fundo, Tampo)
        </ModeIndicator>
        <ModeIndicator 
          $isActive={insertionContext.mode === InsertionMode.INTERNAL} 
          $color="#3b82f6"
          onClick={toggleInsertionMode}
        >
          <ModeIcon $isActive={insertionContext.mode === InsertionMode.INTERNAL} $color="#3b82f6">
            {insertionContext.mode === InsertionMode.INTERNAL ? '✓' : ''}
          </ModeIcon>
          Interno (Prateleiras, Divisórias)
        </ModeIndicator>
      </Section>

      <Section>
        <SectionTitle>
          {insertionContext.mode === InsertionMode.STRUCTURAL ? 'Peças Estruturais' : 'Peças Internas'}
        </SectionTitle>
        
        {insertionContext.mode === InsertionMode.STRUCTURAL ? (
          <>
            <ButtonGrid>
              {structuralPieces.map((piece) => (
                <PieceButton
                  key={piece.type}
                  $color={piece.color}
                  onClick={() => onAddPiece(piece.type)}
                >
                  {piece.name}
                </PieceButton>
              ))}
            </ButtonGrid>
            <InstructionsText>
              Adicione peças estruturais para definir a estrutura do móvel.
            </InstructionsText>
          </>
        ) : (
          <>
            {hasInternalSpace ? (
              <>
                <ButtonGrid>
                  {internalPieces.map((piece) => (
                    <PieceButton
                      key={piece.type}
                      $color={piece.color}
                      onClick={() => onAddPiece(piece.type)}
                    >
                      {piece.name}
                    </PieceButton>
                  ))}
                </ButtonGrid>
                <InstructionsText>
                  Adicione prateleiras e divisórias no espaço interno disponível.
                </InstructionsText>
              </>
            ) : (
              <InstructionsText>
                ⚠️ Nenhum espaço interno disponível. Adicione peças estruturais primeiro.
              </InstructionsText>
            )}
          </>
        )}
      </Section>

      <Section>
        <SectionTitle>Espaço Disponível</SectionTitle>
        <InstructionsText>
          <strong>Largura:</strong> {currentDimensions.width}mm<br/>
          <strong>Altura:</strong> {currentDimensions.height}mm<br/>
          <strong>Profundidade:</strong> {currentDimensions.depth}mm
        </InstructionsText>
      </Section>
    </Container>
  );
};

import React from 'react';
import styled from 'styled-components';

const SpaceSelectorContainer = styled.div`
  position: fixed;
  top: 120px;
  left: 24px;
  background: var(--color-toolbar-surface);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);
  z-index: 950;
  padding: var(--space-4);
  width: 280px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 320px);
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: auto; /* Largura automática para se ajustar ao conteúdo */
    left: var(--space-3);
    right: var(--space-3); /* Ocupa a largura da tela com margens */
    top: 150px; /* Desce um pouco para não colar no toolbar */
    max-height: 35vh; /* Altura máxima menor em celulares */
    padding: var(--space-3);
  }

  /* Breakpoint extra para celulares pequenos */
  @media (max-width: 480px) {
    left: var(--space-1);
    right: var(--space-1);
    padding: var(--space-2);
    top: 120px;
    max-height: 30vh;
    min-width: 0;
    width: 98vw;
  }
`;

const Title = styled.h3`
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0; /* Impede que o título seja esmagado */
`;

const SpaceCount = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  text-align: center;
  font-weight: 500;
  flex-shrink: 0; /* Impede que o contador seja esmagado */
`;

// CORREÇÃO: Container para a lista com a funcionalidade de rolagem
const SpaceList = styled.div`
  overflow-y: auto; /* Adiciona a barra de rolagem vertical QUANDO NECESSÁRIO */
  flex-grow: 1; /* Faz a lista ocupar o espaço restante */
  padding-right: var(--space-2);
  margin-right: -12px;

  /* Estilização da barra de rolagem */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-text-muted);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-primary);
  }
`;

const SpaceButton = styled.button<{ $isSelected: boolean; }>`
  width: 100%;
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-2);
  border: 1px solid;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-align: left;
  
  background: ${({ $isSelected }) => $isSelected ? 'var(--color-primary)' : 'var(--color-surface)'};
  color: ${({ $isSelected }) => $isSelected ? 'white' : 'var(--color-text)'};
  border-color: ${({ $isSelected }) => $isSelected ? 'var(--color-primary)' : 'var(--color-border)'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
  }
  
  &:last-child {
    margin-bottom: var(--space-1);
  }
`;

interface SpaceSelectorProps {
  activeSpaces: any[];
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string | null) => void;
  mainSpaceId: string;
  mainSpaceName: string;
}

export const SpaceSelector: React.FC<SpaceSelectorProps> = ({ 
  activeSpaces, 
  selectedSpaceId, 
  onSelectSpace, 
  mainSpaceId,
  mainSpaceName 
}) => {
  // A lista de espaços a ser mostrada é sempre a lista de "activeSpaces" recebida.
  const spacesToShow = activeSpaces || [];

  return (
    <SpaceSelectorContainer>
      <Title>🎯 Seleção de Espaços</Title>
      <SpaceCount>
        {spacesToShow.length} espaço{spacesToShow.length !== 1 ? 's' : ''} disponível{spacesToShow.length !== 1 ? 'is' : ''}
      </SpaceCount>
      <SpaceList>
        {spacesToShow.map((space) => (
          <SpaceButton
            key={space.id}
            $isSelected={selectedSpaceId === space.id}
            onClick={() => onSelectSpace(space.id)}
            title={space.name}
          >
            {/* O ícone agora é dinâmico, mostrando '🏠' apenas para o espaço raiz se ele estiver na lista de ativos */}
            {space.id === 'main' ? '🏠' : '🔵'} {space.name}
          </SpaceButton>
        ))}
      </SpaceList>
    </SpaceSelectorContainer>
  );
}; 
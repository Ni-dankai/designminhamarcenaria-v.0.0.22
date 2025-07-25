import React, { useState } from 'react';
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


import { FurnitureSpace } from '../types/furniture';

interface SpaceSelectorProps {
  selectedSpaceId: string | null;
  space: FurnitureSpace;
  onSelectSpace: (spaceId: string | null) => void;
}


// Função recursiva para renderizar a árvore de espaços
const TreeNode: React.FC<{
  node?: FurnitureSpace;
  selectedSpaceId: string | null;
  onSelect: (id: string) => void;
  level?: number;
}> = ({ node, selectedSpaceId, onSelect, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  if (!node) return null;
  const hasChildren = Array.isArray(node.subSpaces) && node.subSpaces.length > 0;

  return (
    <div style={{ marginLeft: level * 16 }}>
      <SpaceButton
        $isSelected={selectedSpaceId === node.id}
        onClick={() => onSelect(node.id)}
        title={node.name}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        {hasChildren && (
          <span
            style={{ cursor: 'pointer', marginRight: 4 }}
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          >
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {level === 0 ? '🏠' : '🔵'} {node.name}
      </SpaceButton>
      {hasChildren && expanded && (
        <div>
          {node.subSpaces && node.subSpaces.map(sub => (
            sub ? (
              <TreeNode
                key={sub.id}
                node={sub}
                selectedSpaceId={selectedSpaceId}
                onSelect={onSelect}
                level={level + 1}
              />
            ) : null
          ))}
        </div>
      )}
    </div>
  );
};

export const SpaceSelector: React.FC<SpaceSelectorProps> = ({
  selectedSpaceId,
  space,
  onSelectSpace,
}) => {
  // Função para contar todos os espaços disponíveis (folhas)
  const countSpaces = (s?: FurnitureSpace | null): number => {
    if (!s) return 0;
    if (Array.isArray(s.subSpaces) && s.subSpaces.length > 0) {
      return s.subSpaces.map(countSpaces).reduce((a, b) => a + b, 0);
    }
    return 1;
  };

  return (
    <SpaceSelectorContainer>
      <Title>🎯 Seleção de Espaços</Title>
      <SpaceCount>
        {countSpaces(space)} espaço{countSpaces(space) !== 1 ? 's' : ''} disponível{countSpaces(space) !== 1 ? 'is' : ''}
      </SpaceCount>
      <SpaceList>
        <TreeNode
          node={space}
          selectedSpaceId={selectedSpaceId}
          onSelect={onSelectSpace}
        />
      </SpaceList>
    </SpaceSelectorContainer>
  );
};
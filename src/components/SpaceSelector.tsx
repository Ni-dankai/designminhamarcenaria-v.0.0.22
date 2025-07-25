import React, { useState } from 'react';
import styled from 'styled-components';
import { FurnitureSpace } from '../types/furniture';

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
`;

const Title = styled.h3`
  margin: 0 0 var(--space-3) 0;
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
`;

const SpaceCount = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
  text-align: center;
  font-weight: 500;
`;

const SpaceList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const SpaceButton = styled.button<{ $isSelected: boolean; $isActive: boolean; $level: number }>`
  width: calc(100% - ${({ $level }) => $level * 16}px);
  margin-left: ${({ $level }) => $level * 16}px;
  padding: var(--space-2) var(--space-3);
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
  
  background: ${({ $isSelected, $isActive }) => 
    $isSelected ? 'var(--color-primary)' : 
    $isActive ? 'var(--color-surface)' : 'var(--color-background)'
  };
  color: ${({ $isSelected }) => $isSelected ? 'white' : 'var(--color-text)'};
  border-color: ${({ $isSelected }) => $isSelected ? 'var(--color-primary)' : 'var(--color-border)'};
  opacity: ${({ $isActive }) => $isActive ? 1 : 0.6};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

interface SpaceSelectorProps {
  space: FurnitureSpace;
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string) => void;
}

const TreeNode: React.FC<{
  node: FurnitureSpace;
  selectedSpaceId: string | null;
  onSelect: (id: string) => void;
  level?: number;
}> = ({ node, selectedSpaceId, onSelect, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Array.isArray(node.subSpaces) && node.subSpaces.length > 0;

  return (
    <div>
      <SpaceButton
        $isSelected={selectedSpaceId === node.id}
        $isActive={!!node.isActive}
        $level={level}
        onClick={() => onSelect(node.id)}
        disabled={!node.isActive}
        title={node.isActive ? node.name : `${node.name} (Dividido)`}
      >
        {hasChildren && (
          <span style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {level === 0 ? '🏠' : (node.isActive ? '🔵' : '⚪️')} {node.name}
      </SpaceButton>

      {hasChildren && expanded && (
        <div>
          {node.subSpaces?.map(sub => (
            <TreeNode
              key={sub.id}
              node={sub}
              selectedSpaceId={selectedSpaceId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const SpaceSelector: React.FC<SpaceSelectorProps> = ({
  space,
  selectedSpaceId,
  onSelectSpace,
}) => {
  // CORREÇÃO: Função para contar apenas os espaços ativos (folhas da árvore)
  const countActiveSpaces = (s: FurnitureSpace): number => {
    if (!s) return 0;
    if (s.isActive) return 1;
    if (s.subSpaces && s.subSpaces.length > 0) {
      return s.subSpaces.map(countActiveSpaces).reduce((a, b) => a + b, 0);
    }
    return 0;
  };
  
  const activeCount = countActiveSpaces(space);

  return (
    <SpaceSelectorContainer>
      <Title>🎯 Seleção de Espaços</Title>
      <SpaceCount>
        {activeCount} espaço{activeCount !== 1 ? 's' : ''} disponível{activeCount !== 1 ? 'is' : ''}
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
import React from 'react';
import styled from 'styled-components';
import { FurniturePiece } from '../types/furniture';

// =====================================================================================
// CORREÇÃO: Posição do container alterada para o canto inferior direito
// =====================================================================================
const InfoContainer = styled.div`
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4); /* Alterado de 'left' para 'right' */
  background: var(--color-toolbar-surface, #ffffffcc);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg, 8px);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: 1000;
  padding: var(--space-4);
  min-width: 250px;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Ajustes para telas menores */
  @media (max-width: 768px) {
    left: 50%;
    right: auto; /* Remove o posicionamento da direita */
    transform: translateX(-50%);
    width: 90%;
    bottom: var(--space-3);
    text-align: center;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
`;

const Title = styled.h3`
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-text);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-muted);
  &:hover { color: var(--color-text); }
`;

const InfoRow = styled.p`
  margin: var(--space-1) 0;
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  display: flex;
  justify-content: space-between;

  & > span:first-child {
    font-weight: 600;
  }
`;

interface SelectionInfoProps {
  piece: FurniturePiece | null;
  onClose: () => void;
}

export const SelectionInfo: React.FC<SelectionInfoProps> = ({ piece, onClose }) => {
  if (!piece) {
    return null;
  }

  const { name, dimensions } = piece;

  return (
    <InfoContainer>
      <Header>
        <Title>{name}</Title>
        <CloseButton onClick={onClose} title="Fechar">×</CloseButton>
      </Header>
      <InfoRow>
        <span>Largura:</span>
        <span>{dimensions.width.toFixed(0)} mm</span>
      </InfoRow>
      <InfoRow>
        <span>Altura:</span>
        <span>{dimensions.height.toFixed(0)} mm</span>
      </InfoRow>
      <InfoRow>
        <span>Profundidade:</span>
        <span>{dimensions.depth.toFixed(0)} mm</span>
      </InfoRow>
    </InfoContainer>
  );
}; 
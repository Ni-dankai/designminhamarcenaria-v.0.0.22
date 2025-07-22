import styled from 'styled-components';

const FABContainer = styled.div`
  position: fixed;
  bottom: var(--space-8);
  right: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  z-index: 1000;
`;

const FAB = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'danger':
        return `
          background: linear-gradient(135deg, var(--color-error), #b91c1c);
          color: white;
          
          &:hover {
            background: linear-gradient(135deg, #b91c1c, #991b1b);
          }
        `;
      case 'secondary':
        return `
          background: linear-gradient(135deg, var(--color-surface), var(--color-background-alt));
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          
          &:hover {
            background: linear-gradient(135deg, var(--color-background-alt), var(--color-background));
            color: var(--color-primary);
            border-color: var(--color-primary);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          color: white;
          
          &:hover {
            background: linear-gradient(135deg, var(--color-primary-hover), var(--color-primary));
          }
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-xl);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  /* Ripple effect */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    transition: transform 0.3s ease;
  }
  
  &:active::before {
    transform: scale(1);
  }
`;

const FABTooltip = styled.div`
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-text);
  color: var(--color-surface);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 500;
  white-space: nowrap;
  margin-right: var(--space-3);
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-left-color: var(--color-text);
  }
  
  ${FAB}:hover & {
    opacity: 1;
  }
`;

interface FloatingActionButtonProps {
  icon: string;
  tooltip: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const FloatingActionButton = ({ 
  icon, 
  tooltip, 
  onClick, 
  variant = 'primary' 
}: FloatingActionButtonProps) => {
  return (
    <FAB $variant={variant} onClick={onClick}>
      <FABTooltip>{tooltip}</FABTooltip>
      {icon}
    </FAB>
  );
};

interface FloatingActionButtonsProps {
  onReset: () => void;
  onSave: () => void;
  onFullscreen: () => void;
}

export const FloatingActionButtons = ({ 
  onReset, 
  onSave, 
  onFullscreen 
}: FloatingActionButtonsProps) => {
  return (
    <FABContainer>
      <FloatingActionButton
        icon="⛶"
        tooltip="Tela Cheia"
        onClick={onFullscreen}
        variant="secondary"
      />
      <FloatingActionButton
        icon="💾"
        tooltip="Salvar Projeto"
        onClick={onSave}
        variant="primary"
      />
      <FloatingActionButton
        icon="🗑️"
        tooltip="Limpar Tudo"
        onClick={onReset}
        variant="danger"
      />
    </FABContainer>
  );
};

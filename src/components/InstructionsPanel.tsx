import { useState } from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  position: fixed;
  bottom: var(--space-4);
  left: var(--space-4); // Posição padrão

  @media (max-width: 768px) {
    left: auto; // Remove o posicionamento da esquerda
    right: var(--space-3); // Posiciona na direita
    bottom: var(--space-3);
  }

  @media (max-width: 480px) {
    right: var(--space-1);
    bottom: var(--space-1);
    width: 96vw;
    max-width: 400px;
    padding: var(--space-2);
  }
`;

const InstructionsContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: var(--space-6);
  left: var(--space-6);
  background: var(--color-surface);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);
  max-width: 420px;
  z-index: 1001;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $isOpen }) => $isOpen ? `
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
  ` : `
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
    pointer-events: none;
  `}
  
  /* Glassmorphism effect */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.05));
    border-radius: var(--radius-2xl);
    pointer-events: none;
  }
`;

const InstructionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border-light);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: var(--space-6);
    right: var(--space-6);
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  }
`;

const InstructionsTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  
  &::before {
    content: '🎯';
    font-size: var(--font-size-xl);
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const InstructionsContent = styled.div`
  padding: var(--space-6);
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div<{ $color: string }>`
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ $color }) => $color}, ${({ $color }) => $color + 'dd'});
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  margin: 0 0 var(--space-1) 0;
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text);
`;

const StepDescription = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
`;

const ToggleButton = styled.button<{ $isOpen: boolean }>`
  position: fixed;
  top: var(--space-6);
  left: var(--space-6);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  border: none;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1002;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
    filter: brightness(1.1);
  }
  
  ${({ $isOpen }) => $isOpen && `
    opacity: 0;
    pointer-events: none;
    transform: translateY(-20px) scale(0.9);
  `}
  
  /* Icon before text */
  &::before {
    content: '💡';
    margin-right: var(--space-2);
    font-size: var(--font-size-base);
  }
`;

export const InstructionsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      title: "1. Escolha o Modo",
      description: "Alterne entre modo Estrutural (laterais, fundo, tampo) e modo Interno (prateleiras, divisórias).",
      color: "#10b981"
    },
    {
      title: "2. Configure Espessuras",
      description: "Visual: define a espessura visual das peças. Redução: define quanto cada peça reduz o espaço disponível.",
      color: "#06b6d4"
    },
    {
      title: "3. Adicione Peças Estruturais",
      description: "Comece com peças estruturais como laterais e fundo para definir a estrutura básica do móvel.",
      color: "#22c55e"
    },
    {
      title: "4. Observe o Espaço",
      description: "O espaço azul mostra o espaço disponível que diminui conforme você adiciona peças.",
      color: "#3b82f6"
    },
    {
      title: "5. Selecione Espaços",
      description: "Clique nos espaços azuis/verdes para selecioná-los. O espaço selecionado fica laranja e é onde as próximas peças serão inseridas.",
      color: "#f59e0b"
    },
    {
      title: "6. Adicione Peças Internas",
      description: "Após selecionar um espaço, mude para modo Interno e adicione prateleiras que dividirão o espaço selecionado.",
      color: "#8b5cf6"
    },
    {
      title: "7. Gerencie as Peças",
      description: "Use o botão 'Peças' para ver lista e remover peças individuais, ou 'Limpar Tudo' para recomeçar.",
      color: "#ef4444"
    },
    {
      title: "8. Visualize em 3D",
      description: "Use o mouse para rotacionar, zoom e navegar pela cena 3D. Cada tipo de peça tem uma cor diferente.",
      color: "#6366f1"
    }
  ];

  return (
    <>
      <ToggleButton 
        $isOpen={isOpen}
        onClick={() => setIsOpen(true)}
      >
        💡 Como Usar
      </ToggleButton>
      
      <PanelContainer>
        <InstructionsContainer $isOpen={isOpen}>
          <InstructionsHeader>
            <InstructionsTitle>Como Usar o Sistema</InstructionsTitle>
            <CloseButton onClick={() => setIsOpen(false)}>×</CloseButton>
          </InstructionsHeader>
          
          <InstructionsContent>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepNumber $color={step.color}>{index + 1}</StepNumber>
                <StepContent>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </StepContent>
              </Step>
            ))}
          </InstructionsContent>
        </InstructionsContainer>
      </PanelContainer>
    </>
  );
};

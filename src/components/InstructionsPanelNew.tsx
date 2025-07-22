import { useState } from 'react';
import styled from 'styled-components';

const InstructionsContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: calc(var(--space-6) + 60px); /* Position above the button */
  left: var(--space-6);
  background: var(--color-surface);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);
  max-width: 420px;
  max-height: 80vh; /* Limit height to prevent overflow */
  overflow-y: auto;
  z-index: 1001;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${({ $isOpen }) => $isOpen ? `
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
  ` : `
    opacity: 0;
    transform: translateY(20px) scale(0.95);
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
  
  /* Add scrollbar styling for overflow content */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-background-alt);
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
    border-radius: var(--radius-sm);
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
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
  bottom: var(--space-6);
  left: var(--space-6);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  border: none;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1002;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 48px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-xl);
    filter: brightness(1.1);
    scale: 1.05;
  }
  
  ${({ $isOpen }) => $isOpen && `
    opacity: 0;
    pointer-events: none;
    transform: translateY(20px) scale(0.9);
  `}
  
  /* Icon before text */
  &::before {
    content: '💡';
    margin-right: var(--space-2);
    font-size: var(--font-size-base);
  }
  
  /* Add pulse animation to draw attention */
  animation: instructionsPulse 3s infinite;
  
  @keyframes instructionsPulse {
    0%, 100% {
      box-shadow: var(--shadow-lg);
    }
    50% {
      box-shadow: var(--shadow-xl), 0 0 20px rgba(37, 99, 235, 0.3);
    }
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
      description: "Defina a espessura padrão das peças (18mm recomendado para móveis).",
      color: "#3b82f6"
    },
    {
      title: "3. Ajuste Dimensões",
      description: "Configure largura, altura e profundidade do móvel. Respeitando limite da chapa (2750x1850mm).",
      color: "#8b5cf6"
    },
    {
      title: "4. Adicione Peças",
      description: "Clique nos botões para adicionar peças estruturais ou internas conforme o modo selecionado.",
      color: "#f59e0b"
    },
    {
      title: "5. Selecione Espaços",
      description: "Clique em qualquer espaço (área laranja) para selecioná-lo antes de adicionar peças internas.",
      color: "#ef4444"
    },
    {
      title: "6. Gerencie Peças",
      description: "Use o menu de peças para visualizar e remover peças individuais do projeto.",
      color: "#06b6d4"
    }
  ];

  return (
    <>
      <ToggleButton $isOpen={isOpen} onClick={() => setIsOpen(true)}>
        Instruções
      </ToggleButton>
      
      <InstructionsContainer $isOpen={isOpen}>
        <InstructionsHeader>
          <InstructionsTitle>Como Usar</InstructionsTitle>
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
    </>
  );
};

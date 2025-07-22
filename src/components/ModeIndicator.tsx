import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const IndicatorContainer = styled.div<{ $visible: boolean }>`
  /* =================================================================== */
  /* CORREÇÃO: Posição alterada para a parte inferior central da tela     */
  /* =================================================================== */
  position: fixed;
  bottom: var(--space-8); /* Distância da parte de baixo da tela */
  top: auto; /* Remove o posicionamento antigo do topo */
  left: 50%;
  transform: translateX(-50%);
  
  background: var(--color-toolbar-surface);
  color: var(--color-text);
  padding: 12px 24px; /* Aumentado para melhor visualização */
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  z-index: 2000;
  font-weight: 600;
  font-size: var(--font-size-md);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  /* Efeito de transição suave */
  transition: all 0.4s ease-in-out;
  transform: ${({ $visible }) => ($visible ? 'translateY(0) translateX(-50%)' : 'translateY(20px) translateX(-50%)')};
  pointer-events: none;
  white-space: nowrap;
`;

interface ModeIndicatorProps {
    mode: 'piece' | 'space';
}

export const ModeIndicator: React.FC<ModeIndicatorProps> = ({ mode }) => {
    const [visible, setVisible] = useState(false);

    // Efeito para mostrar a notificação toda vez que o modo muda
    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
        }, 2000); // Esconde a notificação após 2 segundos

        return () => clearTimeout(timer);
    }, [mode]);

    const modeText = mode === 'piece' ? 'Seleção de Peças' : 'Seleção de Espaços';
    const shortcutText = '(Ctrl + S)';

    return (
        <IndicatorContainer $visible={visible}>
            <span>{`Modo Ativo: ${modeText}`}</span>
            <span style={{opacity: 0.7, marginLeft: '12px', fontSize: '14px'}}>{shortcutText}</span>
        </IndicatorContainer>
    );
};
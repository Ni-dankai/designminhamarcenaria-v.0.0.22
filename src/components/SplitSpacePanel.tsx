import React, { useState } from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--color-surface);
  padding: 16px;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 1001;
`;

const Title = styled.h4` margin-top: 0; `;
const InputGroup = styled.div` margin: 12px 0; `;
const Label = styled.label` display: block; margin-bottom: 4px; font-size: 12px; `;
const Select = styled.select` width: 100%; padding: 8px; `;
const Input = styled.input` width: 100%; padding: 8px; `;
const Button = styled.button` width: 100%; padding: 10px; background: var(--color-primary); color: white; border: none; border-radius: 4px; `;

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

interface SplitSpacePanelProps {
    show: boolean;
    onClose: () => void;
    onSplit: (axis: 'x' | 'y', value: number, fromEnd: boolean) => void;
}

export const SplitSpacePanel: React.FC<SplitSpacePanelProps> = ({ show, onClose, onSplit }) => {
    const [axis, setAxis] = useState<'x' | 'y'>('y');
    const [value, setValue] = useState(100);
    const [fromEnd, setFromEnd] = useState(false); // Novo state para a direção

    if (!show) return null;

    const handleSplit = () => {
        onSplit(axis, value, fromEnd);
        onClose();
    };
    
    // Nomes dinâmicos para os labels
    const startLabel = axis === 'y' ? 'A partir da Base' : 'A partir da Esquerda';
    const endLabel = axis === 'y' ? 'A partir do Topo' : 'A partir da Direita';

    return (
        <PanelContainer>
            <Title>Dividir Espaço</Title>
            <InputGroup>
                <Label>Direção da Divisão</Label>
                <Select value={axis} onChange={(e) => setAxis(e.target.value as any)}>
                    <option value="y">Superior / Inferior</option>
                    <option value="x">Esquerda / Direita</option>
                </Select>
            </InputGroup>
            <InputGroup>
                <Label>Posição do Corte (mm)</Label>
                <Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} />
                {/* NOVO: Radio buttons para a referência */}
                <RadioGroup>
                    <label><input type="radio" checked={!fromEnd} onChange={() => setFromEnd(false)} /> {startLabel}</label>
                    <label><input type="radio" checked={fromEnd} onChange={() => setFromEnd(true)} /> {endLabel}</label>
                </RadioGroup>
            </InputGroup>
            <Button onClick={handleSplit}>Aplicar Divisão</Button>
            <Button onClick={onClose} style={{background: 'gray', marginTop: '8px'}}>Cancelar</Button>
        </PanelContainer>
    );
}; 
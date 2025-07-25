import React from 'react';
import { useSimplifiedFurnitureDesign } from '../hooks/useSimplifiedFurnitureDesign';
import './DimensionsPanel.css'; // Usaremos um novo CSS para ele

interface Props {
  design: ReturnType<typeof useSimplifiedFurnitureDesign>;
}

export const DimensionsPanel: React.FC<Props> = ({ design }) => {
  if (!design || !design.space) {
    return <aside className="dimensions-panel">Carregando...</aside>;
  }

  const dims = design.space.originalDimensions;
  const displayWidth = Math.round(dims.width);
  const displayHeight = Math.round(dims.height);
  const displayDepth = Math.round(dims.depth);

  return (
    <aside className="dimensions-panel">
      <div className="panel-section">
        <h4>Dimensões (mm)</h4>
        <div className="dimension-display-grid">
          <div className="dim-label">Altura:</div>
          <div className="dim-value">{displayHeight}</div>
          <div className="dim-label">Largura:</div>
          <div className="dim-value">{displayWidth}</div>
          <div className="dim-label">Profundidade:</div>
          <div className="dim-value">{displayDepth}</div>
        </div>
      </div>
      <div className="panel-section">
        <button onClick={design.clearAllPieces} className="clear-button">
          Limpar Móvel
        </button>
      </div>
    </aside>
  );
};

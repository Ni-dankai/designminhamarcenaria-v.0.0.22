import React, { useState, useEffect } from 'react';
import { Scene3D } from './components/Scene3D';
import { Toolbar } from './components/Toolbar';
import { SpaceSelector } from './components/SpaceSelector';
import { useSimplifiedFurnitureDesign } from './hooks/useSimplifiedFurnitureDesign';
import { FurniturePiece } from './types/furniture';
import { SelectionInfo } from './components/SelectionInfo';
import { ModeIndicator } from './components/ModeIndicator';
import { SplitSpacePanel } from './components/SplitSpacePanel';

export const App = () => {
  // Hook principal que gerencia todo o estado
  const design = useSimplifiedFurnitureDesign();

  const [selectedPiece, setSelectedPiece] = useState<FurniturePiece | null>(null);
  const [hoveredPieceId, setHoveredPieceId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'piece' | 'space'>('piece');
  const [isSplitPanelOpen, setSplitPanelOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setSelectionMode(prev => (prev === 'piece' ? 'space' : 'piece'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ModeIndicator mode={selectionMode} />

      <Scene3D
        space={design.space}
        allPieces={design.allPieces}
        selectionMode={selectionMode}
        hoveredPieceId={hoveredPieceId}
        selectedPieceId={selectedPiece?.id || null}
        onPieceClick={(piece) => setSelectedPiece(prev => (prev?.id === piece.id ? null : piece))}
        onSelectSpace={design.selectSpace}
        textureUrl={design.currentTexture.url}
      />
      
      <Toolbar
        onAddPiece={design.addPiece}
        onRemovePiece={design.removePiece}
        onClearAll={design.clearAllPieces}
        pieces={design.allPieces}
        originalDimensions={design.space.originalDimensions}
        onUpdateDimensions={design.updateDimensions}
        defaultThickness={design.defaultThickness}
        onThicknessChange={design.setDefaultThickness}
        availableTextures={design.availableTextures}
        currentTexture={design.currentTexture}
        onTextureChange={design.setCurrentTexture}
        onHoverPiece={setHoveredPieceId}
        onOpenSplitPanel={() => setSplitPanelOpen(true)}
      />

      <SpaceSelector
        activeSpaces={design.activeSpaces}
        selectedSpaceId={design.selectedSpaceId}
        onSelectSpace={design.selectSpace}
        mainSpaceId={design.space.id}
        mainSpaceName={design.space.name}
      />

      <SelectionInfo piece={selectedPiece} onClose={() => setSelectedPiece(null)} />

      <SplitSpacePanel
        show={isSplitPanelOpen}
        onClose={() => setSplitPanelOpen(false)}
        onSplit={(axis, value, fromEnd) => { // <-- Recebe o 'fromEnd'
            if (design.selectedSpaceId) {
                design.splitSpace(design.selectedSpaceId, axis, value, fromEnd);
            }
        }}
      />
      {/* ... outros componentes como o Painel de Instruções ... */}
    </div>
  );
};

export default App;

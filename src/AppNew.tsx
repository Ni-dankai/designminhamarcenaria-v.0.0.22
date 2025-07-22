import { Scene3D } from './components/Scene3D';
import { SimplifiedControlPanel } from './components/SimplifiedControlPanel';
import { InstructionsPanel } from './components/InstructionsPanel';
import { useSimplifiedFurnitureDesign } from './hooks/useSimplifiedFurnitureDesign';

const App = () => {
  const {
    space,
    insertionContext,
    addPiece,
    setInsertionMode,
    allPieces,
    currentTexture, // Adicionado para passar para Scene3D
  } = useSimplifiedFurnitureDesign();

  // Removido: selectedPieceId e setSelectedPieceId não são mais usados

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Scene3D
        space={space}
        allPieces={allPieces}
        textureUrl={currentTexture.url} // Corrigido: prop obrigatória
      />

      <SimplifiedControlPanel
        insertionContext={insertionContext}
        onModeChange={setInsertionMode}
        onAddPiece={addPiece}
        currentDimensions={space.currentDimensions}
      />

      <InstructionsPanel />
    </div>
  );
};

export default App;

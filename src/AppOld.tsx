// Arquivo inutilizado e removido devido a erro de sintaxe. Mantido vazio para evitar erro no build.
import { SimplifiedControlPanel } from './components/SimplifiedControlPanel';
import { InstructionsPanel } from './components/InstructionsPanel';
import { useSimplifiedFurnitureDesign } from './hooks/useSimplifiedFurnitureDesign';

const App = () => {
  const {
    space,
    insertionContext,
    addPiece,
    setInsertionMode,
  } = useSimplifiedFurnitureDesign();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* <Scene3D space={space} /> */}
      
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

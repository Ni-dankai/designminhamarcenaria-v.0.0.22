// Este arquivo agora faz parte do sistema React/TypeScript
// A funcionalidade principal foi movida para:
// - src/App.tsx (componente principal)
// - src/components/Scene3D.tsx (visualização 3D)
// - src/utils/spaceCutting.ts (sistema de cortes)
// - src/hooks/useFurnitureDesign.ts (gerenciamento de estado)

// Para executar a aplicação, use: npm run dev

import { createRoot } from 'react-dom/client';
import App from './src/App.tsx';

// Compatibilidade com o arquivo original
if (typeof document !== 'undefined') {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(App());
  }
}
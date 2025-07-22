import { PieceType } from './src/types/furniture';
import { useFurnitureDesign } from './src/hooks/useFurnitureDesign';

// Exemplo de como criar um armário de cozinha programaticamente
export const exemploArmarioCozinha = () => {
  const { createNewSpace, addPiece } = useFurnitureDesign();
  
  // 1. Criar espaço para armário de cozinha (80cm x 210cm x 60cm)
  createNewSpace({ width: 800, height: 2100, depth: 600 }, 'Armário de Cozinha');
  
  // 2. Adicionar estrutura básica
  addPiece(PieceType.LATERAL_LEFT, 18);    // Lateral esquerda
  addPiece(PieceType.LATERAL_RIGHT, 18);   // Lateral direita
  addPiece(PieceType.LATERAL_BACK, 18);    // Lateral traseira
  addPiece(PieceType.BOTTOM, 18);          // Fundo
  addPiece(PieceType.TOP, 18);             // Tampo
  
  // 3. Adicionar prateleiras
  addPiece(PieceType.SHELF, 18);           // Prateleira 1
  addPiece(PieceType.SHELF, 18);           // Prateleira 2
  addPiece(PieceType.SHELF, 18);           // Prateleira 3
  
  // 4. Adicionar divisória vertical no meio
  addPiece(PieceType.DIVIDER_VERTICAL, 18);
};

// Exemplo de como criar uma estante simples
export const exemploEstante = () => {
  const { createNewSpace, addPiece } = useFurnitureDesign();
  
  // 1. Criar espaço para estante (120cm x 180cm x 30cm)
  createNewSpace({ width: 1200, height: 1800, depth: 300 }, 'Estante');
  
  // 2. Adicionar estrutura
  addPiece(PieceType.LATERAL_LEFT, 18);    // Lateral esquerda
  addPiece(PieceType.LATERAL_RIGHT, 18);   // Lateral direita
  addPiece(PieceType.LATERAL_BACK, 15);    // Fundo mais fino
  addPiece(PieceType.BOTTOM, 18);          // Base
  addPiece(PieceType.TOP, 18);             // Tampo
  
  // 3. Adicionar múltiplas prateleiras
  for (let i = 0; i < 4; i++) {
    addPiece(PieceType.SHELF, 18);
  }
};

// Exemplo de como criar um módulo de banheiro
export const exemploModuloBanheiro = () => {
  const { createNewSpace, addPiece } = useFurnitureDesign();
  
  // 1. Criar espaço para módulo de banheiro (60cm x 80cm x 45cm)
  createNewSpace({ width: 600, height: 800, depth: 450 }, 'Módulo Banheiro');
  
  // 2. Estrutura básica
  addPiece(PieceType.LATERAL_LEFT, 18);
  addPiece(PieceType.LATERAL_RIGHT, 18);
  addPiece(PieceType.LATERAL_BACK, 18);
  addPiece(PieceType.BOTTOM, 18);
  addPiece(PieceType.TOP, 18);
  
  // 3. Divisória horizontal para criar duas gavetas
  addPiece(PieceType.DIVIDER_HORIZONTAL, 18);
};

/*
INSTRUÇÕES DE USO:

1. Interface Web:
   - Acesse http://localhost:3001
   - Use o painel direito para:
     * Definir dimensões do móvel
     * Adicionar peças clicando nos botões
     * Remover peças individuais
     * Limpar tudo para recomeçar

2. Visualização 3D:
   - Clique e arraste para rotacionar a vista
   - Use scroll do mouse para zoom
   - Arraste com botão direito para mover a câmera

3. Sistema de Cortes:
   - Cada peça reduz automaticamente o espaço disponível
   - Laterais reduzem a largura/profundidade
   - Fundo/tampo reduzem a altura
   - Prateleiras dividem o espaço verticalmente

4. Cores das Peças:
   - Verde: Espaço disponível
   - Roxo: Laterais esquerda/direita
   - Laranja: Laterais frontal/traseira
   - Vermelho: Fundo/tampo
   - Verde escuro: Prateleiras
   - Azul: Divisórias verticais
   - Índigo: Divisórias horizontais

5. Dicas:
   - Comece sempre pelas laterais e estrutura
   - Adicione prateleiras por último
   - Use divisórias para criar compartimentos
   - Observe o espaço restante no painel direito
*/

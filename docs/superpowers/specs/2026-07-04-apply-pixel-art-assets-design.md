# Design: Aplicar assets pixel-art no GameScene

**Data:** 2026-07-04
**Jogo:** Physis (Phaser 3 platformer)

## Objetivo

Substituir os placeholders gerados por código (retângulos/círculos coloridos) por
assets pixel-art reais no `GameScene`, dando ao jogo uma identidade visual de
pântano/floresta coerente com o tema de restauração.

## Escopo

- **Incluído:** apenas o `GameScene` (jogador, plataformas, fundo, sementes, decoração).
- **Fora de escopo:** menus (`MainMenuScene`, `InstructionsScene`).

## Assets disponíveis

- `assets/fox_charsheet_by_kinetic-kitsune.png` — 704×384, frames 64×64 (11 col × 6 lin):
  - IDLE: frames 0-1
  - SIT: 11-13 (não usado)
  - SIT-IDLE: 22-29 (não usado)
  - WALK: 33-40
  - JUMP: 44-45
  - HIT: 55-56
- `assets/free-swamp-game-tileset-pixel-art/1 Tiles/Tile_XX.png` — tiles de chão 32×32.
- `assets/free-swamp-game-tileset-pixel-art/2 Background/Layers/1..5.png` — camadas de parallax.
- `assets/free-swamp-game-tileset-pixel-art/3 Objects/` — árvores, arbustos, grama, pedras.
- `assets/free-swamp-game-tileset-pixel-art/4 Animated objects/Rune.png` — 64×16, frames 16×16 (4).

## Decisões

1. **pixel art** — adicionar `pixelArt: true` na config do Phaser (`main.js`) para
   sprites nítidos ao escalar.

2. **Jogador (raposa Luna)** — carregar o charsheet como spritesheet 64×64.
   Criar animações `idle` (0-1), `walk` (33-40), `jump` (44-45), `hit` (55-56).
   Em `Player.update()` selecionar a animação por estado (parado/andando/no ar) e
   usar `flipX` para direção (raposa olha para a esquerda no sheet). Tocar `hit`
   em `takeDamage()`. **Física inalterada:** manter o corpo de colisão em ~32×32
   com offset, escalando o sprite para caber — não altera level design nem o feel.

3. **Plataformas** — trocar o `block` esticado por `tileSprite` que repete um tile
   de chão 32×32 pela largura de cada plataforma. Corpo estático mantém `width×32`.

4. **Fundo parallax** — adicionar as 5 camadas como tileSprites com `scrollFactor`
   crescente, atrás de tudo, no lugar do `backgroundColor` sólido. Ao purificar
   barreiras, em vez de trocar cor sólida, manter/ajustar as camadas conforme fizer
   sentido (a lógica de troca de cor pode virar troca de tint/camada).

5. **Sementes → Rune** — carregar `Rune.png` como spritesheet 16×16 (4 frames),
   animação girando em loop. Substitui o círculo amarelo; mantém 16×16.

6. **Decoração ambiental** — espalhar árvores, arbustos, grama e pedras ao longo do
   nível, sem colisão, com `depth` atrás do jogador, para dar clima.

## Mantidos como placeholder (escolha do usuário)

- Inimigo (`enemy`), espinho (`spike`), animal curado (`animal_cured`) — o pack não
  tem sprites correspondentes.
- Barreiras `fog`.
- HUD (folhas de vida) permanece como está.

Consequência aceita: `animal_cured` reusa a textura do inimigo e seguirá como o
quadrado colorido.

## Critérios de sucesso

- Jogo roda sem erros no navegador (Phaser via CDN, `index.html`).
- Raposa anima ao andar/pular/parar e vira conforme direção.
- Plataformas e fundo mostram a arte do swamp sem distorção/borrão.
- Sementes aparecem como runes animadas.
- Colisões, dano, coleta e barreiras continuam funcionando como antes.

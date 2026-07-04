export class InstructionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.cameras.main.setBackgroundColor('#222222');

        // Título
        this.add.text(width / 2, 40, 'INSTRUÇÕES', {
            fontSize: '28px',
            fill: '#d95a2b',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Texto reformatado (sem quebras de linha manuais longas)
        const instructionsText = `OBJETIVO:
O mundo foi sufocado pela poluição. Você é Luna, uma raposa que deve coletar Sementes de Luz para dissipar a névoa tóxica e revitalizar a Árvore Matriz.

CONTROLES:
[A] e [D] - Movimentação lateral
[W] - Pular
[E] - Interagir / Purificar Barreiras

MECÂNICAS:
- Pule sobre os animais corrompidos para libertá-los e obter sementes.
- Use as sementes para abrir os caminhos bloqueados pela névoa.
- Cuidado com buracos, espinhos e animais hostis!`;

        // Renderização do Texto com Restrição Espacial (Word Wrap)
        this.add.text(width / 2, height / 2, instructionsText, {
            fontSize: '18px',
            fill: '#dddddd',
            align: 'center',
            lineSpacing: 10,
            // A regra de ouro para UI responsiva em Phaser:
            wordWrap: { width: 650, useAdvancedWrap: true } 
        }).setOrigin(0.5);

        // Botão Voltar
        const backButton = this.add.text(width / 2, height - 30, '[ Voltar ao Menu ]', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#d95a2b' });
            this.input.setDefaultCursor('pointer');
        });

        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#ffffff' });
            this.input.setDefaultCursor('default');
        });

        backButton.on('pointerdown', () => {
            this.input.setDefaultCursor('default');
            this.scene.start('MainMenuScene');
        });
    }
}
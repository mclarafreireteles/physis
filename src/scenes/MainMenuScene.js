export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fundo contemplativo condizente com a estética do GDD
        this.cameras.main.setBackgroundColor('#1a1a1a');

        // Título do Jogo
        const titleText = this.add.text(width / 2, height / 3, 'PHYSIS', {
            fontSize: '64px',
            fill: '#d95a2b', // Laranja da raposa
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtítulo
        this.add.text(width / 2, height / 3 + 50, 'A cura da floresta de cinzas', {
            fontSize: '18px',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        // Botão: Jogar
        const playButton = this.add.text(width / 2, height / 2 + 50, 'Jogar', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        // Botão: Instruções
        const instructionsButton = this.add.text(width / 2, height / 2 + 120, 'Instruções', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5).setInteractive();

        // Eventos de Interação (Feedback Visual)
        this.setupButtonEvents(playButton, () => {
            this.scene.start('GameScene'); // Transição de Estado para o Jogo
        });

        this.setupButtonEvents(instructionsButton, () => {
            this.scene.start('InstructionsScene'); // Transição de Estado para Instruções
        });
    }

    setupButtonEvents(button, callback) {
        // Altera a cor quando o mouse passa por cima (Hover)
        button.on('pointerover', () => {
            button.setStyle({ fill: '#32a852' }); // Verde purificação
            this.input.setDefaultCursor('pointer');
        });

        // Retorna à cor original
        button.on('pointerout', () => {
            button.setStyle({ fill: '#ffffff' });
            this.input.setDefaultCursor('default');
        });

        // Executa a ação do clique
        button.on('pointerdown', () => {
            this.input.setDefaultCursor('default');
            callback();
        });
    }
}
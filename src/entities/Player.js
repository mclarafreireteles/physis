export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'fox', 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setDepth(5);
        // The fox art sits inside a mostly-empty 64x64 frame. Keep a compact
        // collider anchored near the fox's feet so gameplay physics stay close
        // to the original 32x32 box.
        this.body.setSize(30, 30);
        this.body.setOffset(17, 30);
        this.play('fox_idle');
        
        this.health = 3;
        this.seeds = 0;
        this.spawnPoint = { x, y };
        this.isInvulnerable = false;
        
        this.keys = scene.input.keyboard.addKeys('W,A,D,E');
        
        // --------------------------------------------------------
        // SISTEMA DE HUD (Heads-Up Display)
        // --------------------------------------------------------
        
        // 1. Array para armazenar os ícones de vida (Folhas)
        this.healthIcons = [];
        for (let i = 0; i < 3; i++) {
            // Posiciona cada folha com um espaçamento de 40 pixels
            const icon = scene.add.image(30 + (i * 40), 30, 'ui_leaf');
            icon.setScrollFactor(0); // Fixa na câmara
            this.healthIcons.push(icon);
        }

        // 2. Ícone e Contador de Sementes
        this.seedIcon = scene.add.image(30, 75, 'seed');
        this.seedIcon.setScrollFactor(0);
        
        this.seedText = scene.add.text(50, 65, 'x 0', { 
            fontSize: '24px', 
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.seedText.setScrollFactor(0);

        this.updateUI();
    }

    update() {
        const onGround = this.body.touching.down || this.body.blocked.down;

        if (this.keys.A.isDown) {
            this.setVelocityX(-200);
            this.setFlipX(true); // fox faces right in the sheet, so mirror it to go left
        } else if (this.keys.D.isDown) {
            this.setVelocityX(200);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        if (this.keys.W.isDown && onGround) {
            this.setVelocityY(-450);
        }

        // Don't override the hit animation while it is still playing.
        const playingHit = this.anims.currentAnim
            && this.anims.currentAnim.key === 'fox_hit'
            && this.anims.isPlaying;

        if (!playingHit) {
            if (!onGround) {
                this.play('fox_jump', true);
            } else if (this.body.velocity.x !== 0) {
                this.play('fox_walk', true);
            } else {
                this.play('fox_idle', true);
            }
        }

        if (this.y > 570) {
            this.die();
        }
    }

    takeDamage() {
        if (this.isInvulnerable) return;

        this.health -= 1;
        this.isInvulnerable = true;
        this.setTint(0xff0000);
        this.play('fox_hit', true);

        this.scene.time.delayedCall(1000, () => {
            this.clearTint();
            this.isInvulnerable = false;
        });
        
        if (this.health <= 0) {
            this.die();
        }
        
        this.updateUI(); // Atualiza a HUD imediatamente após o dano
    }

    die() {
        this.health = 3;
        this.seeds = 0;
        this.isInvulnerable = false;
        this.clearTint();
        this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.setVelocity(0, 0);
        this.scene.resetArea();
        this.updateUI();
    }

    collectSeed() {
        this.seeds += 1;
        this.updateUI();
    }

    updateUI() {
        this.seedText.setText(`x ${this.seeds}`);

        for (let i = 0; i < 3; i++) {
            if (i < this.health) {
                this.healthIcons[i].setAlpha(1);
                this.healthIcons[i].setTint(0xffffff); 
            } else {
                this.healthIcons[i].setAlpha(0.3);
                this.healthIcons[i].setTint(0x000000); 
            }
        }
    }
}
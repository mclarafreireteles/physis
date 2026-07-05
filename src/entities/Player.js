export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'foxy_idle', 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setDepth(5);
        // Foxy frames are 33x32 and mostly filled. Keep a compact collider
        // around the body, anchored near the feet. Tunable if misaligned.
        this.body.setSize(18, 28);
        this.body.setOffset(8, 4);
        this.play('foxy_idle');
        
        this.health = 3;
        this.seeds = 0;
        this.spawnPoint = { x, y };
        this.isInvulnerable = false;
        
        this.keys = scene.input.keyboard.addKeys('W,A,D,E');
        
        // --------------------------------------------------------
        // SISTEMA DE HUD (Heads-Up Display)
        // --------------------------------------------------------
        
        // 1. Array para armazenar os ícones de vida (Folhas)
        // HUD is drawn on top of the world.
        this.healthIcons = [];
        for (let i = 0; i < 3; i++) {
            // Posiciona cada folha com um espaçamento de 40 pixels
            const icon = scene.add.image(30 + (i * 40), 30, 'ui_leaf');
            icon.setScrollFactor(0); // Fixa na câmara
            icon.setDepth(100);
            this.healthIcons.push(icon);
        }

        // 2. Ícone e Contador de Sementes
        this.seedIcon = scene.add.image(30, 75, 'seed');
        this.seedIcon.setScrollFactor(0);
        this.seedIcon.setDepth(100);

        this.seedText = scene.add.text(50, 65, 'x 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.seedText.setScrollFactor(0);
        this.seedText.setDepth(100);

        this.updateUI();
    }

    update() {
        const onGround = this.body.touching.down || this.body.blocked.down;

        if (this.keys.A.isDown) {
            this.setVelocityX(-200);
            this.setFlipX(true); // Foxy faces right by default, so mirror it to go left
        } else if (this.keys.D.isDown) {
            this.setVelocityX(200);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        if (this.keys.W.isDown && onGround) {
            this.setVelocityY(-450);
        }

        // Don't override the hurt animation while it is still playing.
        const playingHurt = this.anims.currentAnim
            && this.anims.currentAnim.key === 'foxy_hurt'
            && this.anims.isPlaying;

        if (!playingHurt) {
            if (!onGround) {
                // Distinct poses for rising vs falling.
                if (this.body.velocity.y < 0) {
                    this.play('foxy_rise', true);
                } else {
                    this.play('foxy_fall', true);
                }
            } else if (this.body.velocity.x !== 0) {
                this.play('foxy_run', true);
            } else {
                this.play('foxy_idle', true);
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
        this.play('foxy_hurt', true);

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
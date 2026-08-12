import { _decorator, Animation, AnimationState, AudioClip, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, Sprite } from 'cc';
import { Bullet } from './Bullet';
import { GameManager } from './GameManager';
import { EnemyManager } from './EnemyManager';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    
    // 飞船移动速度
    @property
    speed:number=300;
    // 飞船动画组件
    @property(Animation)
    animation: Animation = null;

    @property
    private hp:number = 1;

    @property
    private aniHitName:string = "";
    @property
    private aniDownName:string = "";

    private collider: Collider2D = null;
    // 飞船边界坐标
    private boundary:number = -560;

    @property
    private score:number = 0;

    @property(AudioClip)
    private enemyAudioClip: AudioClip = null;
    
    start() {
        //
        // 注册单个碰撞体的回调函数
        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        // 在动画播放完后销毁节点
        this.animation.on(Animation.EventType.FINISHED, () => {
            
            if (this.hp <= 0) {
                this.node.destroy();
            }
            
        }, this);
    }

    update(deltaTime: number) {
        if (this.hp > 0) {
                
            if (this.node.position.y < this.boundary) {
                //到达边界销毁
                this.node.destroy();
            } else {
                //正常移动
                const position = this.node.position;
                this.node.setPosition(position.x,position.y - this.speed * deltaTime,position.z);
            }
        }
    }

    protected onDestroy(): void {
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        this.animation.off(Animation.EventType.FINISHED);

        EnemyManager.instance.removeEnemyFromPool(this.node);
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        
        if (otherCollider.getComponent(Bullet)) {
            otherCollider.enabled = false; // 禁用子弹碰撞体
            otherCollider.getComponent(Sprite).enabled = false; // 隐藏子弹
        }
        //otherCollider.node.destroy(); // 销毁子弹节点
        this.hp -= 1;
        if (this.hp <= 0) {
            this.dead();
        } else {
            // 播放受击动画
            this.animation.play(this.aniHitName);
        }
    }

    private deaded: boolean = false;
    private dead() {
        if (this.deaded) {
            return;
        }
        if (this.enemyAudioClip) {
            AudioMgr.inst.playOneShot(this.enemyAudioClip, 1);
        }
        this.deaded = true;
        // 播放爆炸动画并禁用碰撞体
        this.animation.play(this.aniDownName);
        this.collider.enabled = false;
        GameManager.instance.addScore(this.score);
    }

    public killNow() {
        if (this.hp > 0) {
            this.hp = 0;
            this.dead();
        }   
        
    }
}



import { _decorator, Animation, AudioClip, Collider2D, Component, Contact2DType, EventTouch, Input, input, instantiate, IPhysics2DContact, Node, Prefab, Sprite, UITransform } from 'cc';
import { Enemy } from './Enemy';
import { Gift, GiftType } from './Gift';
import { GameManager } from './GameManager';
import { LifeCountUI } from './LifeCountUI';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

enum ShootType {
    NONE = 0,
    ONE = 1,
    TWO = 2
}

@ccclass('Player')
export class Player extends Component {
    
    // 边界坐标
    private boundary = {xL: -230, xR: 230, yT: 374, yB: -385};

    // 子弹发射频率
    @property
    private shootFrequency: number = 0.3; // 每0.2秒发射一颗子弹
    private shootTimer: number = 0;
    // 子弹容器节点
    @property(Node)
    private bulletContainer: Node = null;
    // 发射类型
    
    private shootType: ShootType = ShootType.ONE;

    //单子弹预制体
    @property(Prefab)
    public oneBulletPrefab: Prefab = null;
    //单子弹发射位置节点
    @property(Node)
    private oneBulletPosition: Node = null;

    
    //双子弹预制体
    @property(Prefab)
    public twoBulletPrefab: Prefab = null;

    //双子弹发射位置节点
    @property(Node)
    private twoBulletPosition1: Node = null;
    @property(Node)
    private twoBulletPosition2: Node = null;


    private collider: Collider2D = null;

    @property
    private hp: number = 3;

    @property(Animation)
    animation:Animation = null;
    @property
    private aniHitName:string = "";
    @property
    private aniDownName:string = "";

    @property
    private hitedFrequency: number = 1;
    private hitedTimer: number = 0;
    private hited: boolean = false;

    @property
    private twoShootTime:number = 5; //双发持续时间
    private twoShootTimer:number = 0;

    @property(LifeCountUI)
    private lifeCountUI:LifeCountUI = null;

    private canController:boolean = true;


    @property(AudioClip)
    private bulletAudioClip: AudioClip = null;

    @property(AudioClip)
    private getTwoShootAudioClip: AudioClip = null;
    @property(AudioClip)
    private getBombAudioClip: AudioClip = null;


    protected onLoad(): void {
        // 监听触摸移动事件
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    
    start() {

        this.lifeCountUI.updateLifeCount(this.hp);
        // 注册单个碰撞体的回调函数
        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

        // 在动画播放完后销毁节点
        this.animation.on(Animation.EventType.FINISHED, () => {
            
            if (this.hp <= 0) {
                GameManager.instance.gameOver();
            }
            
        }, this);
    }

    update(deltaTime: number) {
        if (this.shootType === ShootType.TWO) {
            this.twoShootTimer += deltaTime;
            if (this.twoShootTimer >= this.twoShootTime) {
                this.closeTwoShoot();
                this.twoShootTimer = 0;
            }   
        }

        this.shootTimer += deltaTime;
        if (this.shootTimer >= this.shootFrequency) {
            this.shootTimer = 0;
            switch (this.shootType) {
                case ShootType.ONE:
                    this.oneShoot(deltaTime);
                    break;
                case ShootType.TWO:
                    this.twoShoot(deltaTime);
                    break;
                case ShootType.NONE:
                default:
                    break;
            }
        }

        if (this.hited) {
            this.hitedTimer += deltaTime;
            if (this.hitedTimer > this.hitedFrequency) {
                this.hited = false;
            }
        }
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        if (this.collider) {
                this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
    }
    
    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        
        if (otherCollider.getComponent(Enemy)) {
            this.hitEnemy();
        } else {
            this.hitGift(otherCollider);
        }
        

    }

    /** 撞击敌机处理 */
    private hitEnemy() {
        //进入无敌时间（一段时间内撞击无效）
        if (this.hited) {
            return;
        } else {
            this.hited = true;
            this.hitedTimer = 0;
        }

        this.hp -= 1;
        if (this.hp <= 0) {
            // 播放爆炸动画并禁用碰撞体
            this.animation.play(this.aniDownName);
            this.collider.enabled = false;
            this.shootType = ShootType.NONE;
        } else {
            // 播放受击动画
            this.animation.play(this.aniHitName);
        }
        this.lifeCountUI.updateLifeCount(this.hp);
    }

    private lastGift:Gift = null;
    /**
     * 撞击礼包处理
     */
    private hitGift(otherCollider: Collider2D) {
        // 避免重复碰撞
        const gift = otherCollider.getComponent(Gift)
        if (this.lastGift == gift) {
            return;
        }
        this.lastGift = gift;
        
        if (gift.giftType == GiftType.ONE) {
            // 双发礼包
            if (this.getTwoShootAudioClip) {
                AudioMgr.inst.playOneShot(this.getTwoShootAudioClip, 1);
            }
            this.openTwoShoot();
        } else if (gift.giftType == GiftType.TWO) {
            // 炸弹礼包
            if (this.getBombAudioClip) {
                AudioMgr.inst.playOneShot(this.getBombAudioClip, 1);
            }
            GameManager.instance.addGift2();
        }
        otherCollider.enabled = false; // 禁用礼包碰撞体
        otherCollider.getComponent(Sprite).enabled = false; // 隐藏礼包
    }


    /**
     * 触摸事件处理（移动玩家节点）
     * @param event 
     */
    private onTouchMove(event: EventTouch): void {
        if (!this.canController) {
            return;
        }
        if (this.hp <= 0) {
            return;
        }
        const delta = event.getDelta();

        let x = this.node.position.x + delta.x;
        let y = this.node.position.y + delta.y;

        if (x < this.boundary.xL) {
            x = this.boundary.xL;
        }
        if (x > this.boundary.xR) {
            x = this.boundary.xR;
        }

        if (y < this.boundary.yB) {
            y = this.boundary.yB;
        }
        if (y > this.boundary.yT) {
            y = this.boundary.yT;
        }

        this.node.setPosition(x, y, this.node.position.z);
    }

    /** 发射单子弹 */
    private oneShoot(deltaTime: number): void {
        if (this.bulletAudioClip) {
            AudioMgr.inst.playOneShot(this.bulletAudioClip, 0.1);
        }
        // 实例化子弹节点
        const bullet = instantiate(this.oneBulletPrefab);

        // 将子弹添加到场景中
        this.bulletContainer.addChild(bullet);
        // 设置子弹的世界位置（与上面的方法顺序不能调换）
        bullet.setWorldPosition(this.oneBulletPosition.worldPosition);
        
    }

    /** 发射双子弹 */
    private twoShoot(deltaTime: number): void {
        if (this.bulletAudioClip) {
            AudioMgr.inst.playOneShot(this.bulletAudioClip, 0.1);
        }
        // 实例化子弹节点
        const bullet1 = instantiate(this.twoBulletPrefab);
        const bullet2 = instantiate(this.twoBulletPrefab);

        // 将子弹添加到场景中
        this.bulletContainer.addChild(bullet1);
        this.bulletContainer.addChild(bullet2);
        // 设置子弹的世界位置（与上面的方法顺序不能调换）
        bullet1.setWorldPosition(this.twoBulletPosition1.worldPosition);
        bullet2.setWorldPosition(this.twoBulletPosition2.worldPosition);
        
    }

    /**开启双发 */
    private openTwoShoot() {
        this.shootType = ShootType.TWO;
    }

    /**关闭双发 */
    private closeTwoShoot() {
        this.shootType = ShootType.ONE;
    }

    public setCanController(canController:boolean) {
        this.canController = canController;
    }
}
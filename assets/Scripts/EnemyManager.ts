import { _decorator, Component, EventTouch, Input, input, instantiate, math, Node, Prefab } from 'cc';
import { GameManager } from './GameManager';
import { Enemy } from './Enemy';
const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends Component {

    private static _instance: EnemyManager = null;

    public static get instance(): EnemyManager {
        return this._instance;
    }
    
    // Enemy0生成频率
    @property
    private enemy0Frequency: number = 1; // 每1秒生成一只Enemy0
    @property(Prefab)
    private enemy0Prefab: Prefab = null;

    // Enemy1生成频率
    @property
    private enemy1Frequency: number = 3; // 每3秒生成一只Enemy1
    @property(Prefab)
    private enemy1Prefab: Prefab = null;

    // Enemy2生成频率
    @property
    private enemy2Frequency: number = 10; // 每10秒生成一只Enemy2
    @property(Prefab)
    private enemy2Prefab: Prefab = null;

    // Gift生成频率
    @property
    private giftFrequency: number = 15; // 每10秒生成一只Gift
    @property(Prefab)
    private gift1Prefab: Prefab = null;
    @property(Prefab)
    private gift2Prefab: Prefab = null;

    doubleClickTimer: number = 0;
    doubleClickInterval: number = 0.2; // 双击间隔时间

    @property([Node])
    private enemyPool: Node[] = [];
    
    onLoad(): void {
        EnemyManager._instance = this;
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    start() {
        this.schedule(this.spawnEnemy0, this.enemy0Frequency);
        this.schedule(this.spawnEnemy1, this.enemy1Frequency);
        this.schedule(this.spawnEnemy2, this.enemy2Frequency);
        this.schedule(this.spawnGift, this.giftFrequency);
    }

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        this.unschedule(this.spawnEnemy0);
        this.unschedule(this.spawnEnemy1);
        this.unschedule(this.spawnEnemy2);
        this.unschedule(this.spawnGift);
        input.off(Input.EventType.TOUCH_END);
    }

    private spawnEnemy0() {
        const enemy0 = this.rendering(this.enemy0Prefab, -215, 215, 450);
        this.enemyPool.push(enemy0);
    }

    private spawnEnemy1() {
        const enemy1 = this.rendering(this.enemy1Prefab, -205, 205, 475);
        this.enemyPool.push(enemy1);
    }

    private spawnEnemy2() {
        const enemy2 = this.rendering(this.enemy2Prefab, -155, 155, 560);
        this.enemyPool.push(enemy2);
    }

    private spawnGift() {
        const randomNum = math.randomRangeInt(0, 2);
        if (randomNum === 0) {
            this.rendering(this.gift1Prefab, -210, 210, 475);
        } else {
            this.rendering(this.gift2Prefab, -210, 210, 480);
        }
    }

    private rendering(prefab:Prefab, xMinPos:number, xMaxPos:number, yRange:number):Node {
        const object = instantiate(prefab);
        this.node.addChild(object);

        //(-155, 155), 560
        object.setPosition(math.randomRange(xMinPos, xMaxPos), yRange, 0);
        return object;
    }

    private onTouchEnd(event: EventTouch) {
        const time = new Date().getTime();

        if ((time - this.doubleClickTimer)/1000 < this.doubleClickInterval) {
            this.doubleClickTimer = 0;
            this.doubleClick();
        } else {
            this.doubleClickTimer = time;
        }
    }

    private doubleClick() {
        // 处理双击事件的逻辑
        if (GameManager.instance.hasBombGift()) {
            //使用炸弹
            GameManager.instance.useBombGift();
            for(let enemy of this.enemyPool) {
                enemy.getComponent(Enemy).killNow();
            }
        }
    }

    public removeEnemyFromPool(enemy: Node) {
        const index = this.enemyPool.indexOf(enemy);
        if (index !== -1) {
            this.enemyPool.splice(index, 1);
        }
    }
}
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum GiftType {
    ONE = "one",
    TWO = "two"
}

@ccclass('Gift')
export class Gift extends Component {
    
    // 移动速度
    @property
    speed:number=100;

    // 边界坐标
    private boundary:number = -560;

    @property
    giftType: GiftType = GiftType.ONE;
    
    start() {

    }

    update(deltaTime: number) {
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



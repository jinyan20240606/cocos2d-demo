import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    
    // 子弹移动速度
    @property
    speed:number=100;

    // 子弹边界坐标
    private boundary:number = 400;
    
    start() {

    }

    update(deltaTime: number) {
        const position = this.node.position;
        this.node.setPosition(position.x,position.y + this.speed * deltaTime,position.z);
    
        if(this.node.position.y > this.boundary){
            this.node.destroy();
        }
    }
}



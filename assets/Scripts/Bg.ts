import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bg')
export class Bg extends Component {
    
    @property(Node)
    bg01:Node=null;
    @property(Node)
    bg02:Node=null;

    @property
    speed:number=100;
    bgHeight:number=850;
    
    start() {

    }

    update(deltaTime: number) {

        if (this.bg01.position.y <= -this.bgHeight){
            this.bg01.setPosition(0,this.bg02.position.y + this.bgHeight,0);
        }
        if (this.bg02.position.y <= -this.bgHeight){
            this.bg02.setPosition(0,this.bg01.position.y + this.bgHeight,0);
        }   

        this.bg01.setPosition(this.bg01.position.x,this.bg01.position.y - this.speed * deltaTime,0);
        this.bg02.setPosition(this.bg02.position.x,this.bg02.position.y - this.speed * deltaTime,0);
    }
}



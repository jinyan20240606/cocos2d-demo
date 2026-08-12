import { _decorator, Component, Label, Node } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('BombUI')
export class BombUI extends Component {
    
    @property(Label)
    private gift2CountLabel: Label = null;
    
    start() {
        GameManager.instance.node.on('updateGift2Count', this.updateGift2Count, this);
    }

    update(deltaTime: number) {
        
    }

    private updateGift2Count() {
        this.gift2CountLabel.string = GameManager.instance.getGift2Count.toString();
    }
}



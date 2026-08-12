import { _decorator, Component, Label, Node } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('LifeCountUI')
export class LifeCountUI extends Component {
    
    @property(Label)
    private lifeCountLabel: Label = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    public updateLifeCount(lifeCount: number) {
        this.lifeCountLabel.string = lifeCount.toString();
    }
}



import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreUI')
export class ScoreUI extends Component {
    
    @property(Label)
    private scoreLabel: Label = null;
    
    start() {

    }

    update(deltaTime: number) {
        
    }

    public updateScore(score: number) {
        this.scoreLabel.string = score.toString();
    }
}



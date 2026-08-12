import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameOverUI')
export class GameOverUI extends Component {
    
    @property(Label)
    private highestScoreLabel: Label = null;
    @property(Label)
    private finishedScoreLabel: Label = null;
    
    start() {

    }

    update(deltaTime: number) {
        
    }

    public showGameOverUI(finishedScore: number, highestScore: number) {
        this.node.active = true;
        this.finishedScoreLabel.string = finishedScore.toString();
        this.highestScoreLabel.string = highestScore.toString();
    }
}



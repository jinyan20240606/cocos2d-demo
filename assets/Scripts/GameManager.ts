import { _decorator, AudioClip, Component, director, Node, sys } from 'cc';
import { ScoreUI } from './ScoreUI';
import { Player } from './Player';
import { GameOverUI } from './GameOverUI';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    
    private static _instance: GameManager = null;

    @property
    private gift2Count: number = 0;

    @property
    private totalScore:number = 0;
    @property(ScoreUI)
    private totalScoreUI:ScoreUI = null;
    @property(Player)
    private player:Player = null;
    @property(Node)
    private pauseButton:Node = null;
    @property(Node)
    private resumeButton:Node = null;
    @property(GameOverUI)
    private gameOverUI:GameOverUI = null;

    @property(AudioClip)
    private bgm:AudioClip = null;
    @property(AudioClip)
    private buttonAudioClip: AudioClip = null;
    @property(AudioClip)
    private gameOverAudioClip: AudioClip = null;
    @property(AudioClip)
    private useBombAudioClip: AudioClip = null;

    public static get instance(): GameManager {
        return this._instance;
    }

    protected onLoad(): void {
        GameManager._instance = this;
    }
    
    start() {
        AudioMgr.inst.play(this.bgm, 0.1, true);
    }

    update(deltaTime: number) {
        
    }

    public addGift2() {
        this.gift2Count += 1;
        this.node.emit('updateGift2Count', this.gift2Count);
    }

    public get getGift2Count(): number {
        return this.gift2Count;
    }

    public addScore(score:number) {
        this.totalScore += score;
        this.totalScoreUI.updateScore(this.totalScore);
    }

    public pauseGame() {
        if (this.buttonAudioClip) {
            AudioMgr.inst.playOneShot(this.buttonAudioClip, 1);
            AudioMgr.inst.pause();
        }
        director.pause();
        this.player.setCanController(false);
        this.pauseButton.active = false;
        this.resumeButton.active = true;
    }

    public resumeGame() {
        if (this.buttonAudioClip) {
            AudioMgr.inst.playOneShot(this.buttonAudioClip, 1);
            AudioMgr.inst.resume();
        }
        director.resume();
        this.player.setCanController(true);
        this.pauseButton.active = true;
        this.resumeButton.active = false;
    }

    public gameOver() {
        AudioMgr.inst.playOneShot(this.buttonAudioClip, 1);
        this.pauseGame();

        let highestScore = sys.localStorage.getItem('highestScore');

        let highestScoreNum = 0;
        if (highestScore == null || this.totalScore > Number(highestScore)) {
            highestScoreNum = this.totalScore;
            sys.localStorage.setItem('highestScore', this.totalScore.toString());
        } else {
            highestScoreNum = Number(highestScore);
        }

        this.gameOverUI.showGameOverUI(this.totalScore, highestScoreNum);
    }

    public restartGame() {
        if (this.buttonAudioClip) {
            AudioMgr.inst.playOneShot(this.buttonAudioClip, 1);
        }
        this.resumeGame();
        director.loadScene(director.getScene().name);
    }

    public quitGame() {
        
    }

    public hasBombGift(): boolean {
        return this.gift2Count > 0;
    }

    public useBombGift(): void {
        if (this.gift2Count > 0) {
            if (this.useBombAudioClip) {
                AudioMgr.inst.playOneShot(this.useBombAudioClip, 1);
            }   
            this.gift2Count -= 1;    
            this.node.emit('updateGift2Count', this.gift2Count);
        }   
    }
}



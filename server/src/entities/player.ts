class Player{
    private username: string;
    private time: number;    
    private numOfWins: number
    constructor(username:string, time: number, numOfWins: number){
        this.time = time;
        this.username = username;
        this.numOfWins = numOfWins;
    }
}
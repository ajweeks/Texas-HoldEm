
function get(what: string): HTMLElement {
    return document.getElementById(what);
}

class Main {

    static canvas: HTMLCanvasElement;
    static SIZE: { w:number, h: number};
    static context: CanvasRenderingContext2D;

    static lastRender: number;
    static lastTick: number;
    static tickLength: number = 1000/60;

    static table: Table;

    constructor() {
        Main.canvas = (<HTMLCanvasElement>get('gameCanvas'));
        Main.context = Main.canvas.getContext('2d');
        Main.SIZE = { w: Main.canvas.width, h: Main.canvas.height };

        Main.table = new Table();
        Main.table.addPlayer(new Player("AJ", Main.table, false));

        Main.loop(performance.now());
    }

    static loop(tFrame) {
        window.requestAnimationFrame(Main.loop);

        var nextTick = Main.lastTick + Main.tickLength;
        var numTicks = 0;

        if (tFrame > nextTick) {
            var timeSinceTick = tFrame - Main.lastTick;
            numTicks = Math.floor(timeSinceTick / Main.tickLength);
        }

        Main.queueUpdates(numTicks);
        Main.render();
        Main.lastRender = tFrame;
    }

    static queueUpdates(numTicks: number) {
        for (var i = 0; i < numTicks; i++) {
            Main.lastTick = Main.lastTick + Main.tickLength; // Now lastTick is this tick.
            Main.update(Main.lastTick);
        }
    }

    static update(delta: number) {
        Main.table.update();
    }

    static render() {
        Main.context.fillStyle = "#353";
        Main.context.fillRect(0, 0, Main.SIZE.w, Main.SIZE.h);

        Main.table.render();
    }
}

class Table {

    players: Array<Player>;
    deck: Deck;
    pot: number;
    maxPlayers: number = 6;

    constructor() {
        this.deck = new Deck();
        this.deck.shuffle();
        this.players = new Array<Player>();
    }

    addPlayer(player: Player) {
        if (this.players.length === this.maxPlayers) {
            console.error("Can not add player, there are already 6!");
            return;
        }
        this.players.push(player);
    }

    removePlayer(player: Player) {
        var i = this.players.indexOf(player);
        if (i != -1) this.players.splice(i);
    }

    update() { // used for animations

    }

    render() {
        Main.context.drawImage(Images.table, Main.SIZE.w / 2 - 360, Main.SIZE.h / 2 - 240);
        for (var p in this.players) {
            this.players[p].render();
        }
    }

}

class Player {

    cards: Array<Card>;
    balance: number;
    name: string;
    table: Table;
    ai: boolean;

    constructor(name: string, table: Table,  ai: boolean, balance: number = 0) {
        this.name = name;
        this.table = table;
        this.ai = ai;
        this.balance = balance;
        this.cards = new Array<Card>(0);
    }

    render() {
        for (var c in this.cards) {
            this.cards[c].render(c * 50, 150);
        }
    }

}

class Deck {

    cards: Array<Card>;

    constructor() {
        this.cards = this.newDeck();
    }

    // returns an ordered deck of 52 cards
    newDeck(): Array<Card> {
        var deck = new Array<Card>(52),
            i = 0;
        for (var s in Card.SUITS) {
            for (var v in Card.VALUES) {
                deck[i] = new Card(s, v);
                i++;
            }
        }
        return deck;
    }

    shuffle() {

        var i,
            tempCard: Card,
            rnd: number;

        for (i = 0; i < this.cards.length; i++) {
            rnd = Math.random() * this.cards.length;
            tempCard = this.cards[rnd];
            this.cards[rnd] = this.cards[i];
            this.cards[i] = tempCard;
        }

    }

    deal(players: Array<Player>) {
        if (this.cards.length < 2 * players.length) {
            console.error("Can't deal cards! Not enough left!");
            return;
        }
        for (var i = 0; i < 2; i++) {
            players[i].cards[i] = this.cards.pop();
        }
    }
}

class Card {

    static SUITS = ["Spade", "Heart", "Club", "Diamond"];
    static VALUES = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];

    static SIZE = { w: 50, h: 70 };

    suit: number;
    value: number;

    constructor(suit: number, value: number) {
        this.suit = suit;
        this.value = value;
    }

    toString(): string {
        return this.value + " of " + this.suit + "s";
    }

    render(x: number, y: number, front: boolean) {
        if (front) Main.context.drawImage(Images.card_back, x, y);
        else Main.context.drawImage(Images.card_back, x, y);

        Main.context.fillStyle = "#000";
        Main.context.fillText(Card.SUITS[this.suit].charAt(0) + " " + this.value, x, y);
    }

}

class Images {

    static table: HTMLImageElement;

    static card_front: HTMLImageElement;
    static card_back: HTMLImageElement;

    static init() {
        Images.table = new Image();
        Images.table.src = "res/table.png";
        Images.card_front = new Image();
        Images.card_front.src = "res/card-front.png";
        Images.card_back = new Image();
        Images.card_back.src = "res/card-back.png";
    }

}

window.onload = function() {
    Images.init();
    new Main();
}

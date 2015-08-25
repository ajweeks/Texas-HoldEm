
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
            Main.lastTick += Main.tickLength; // Now lastTick is this tick.
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
        Main.context.drawImage(Images.table, Main.SIZE.w / 2 - Images.table.width / 2, Main.SIZE.h / 2 - Images.table.height / 2);
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
        // this.cards = new Array<Card>(0);
        var deck = new Deck();
        deck.shuffle();
        this.cards = deck.cards;
        // for (var s = 0; s < Card.SUITS.length; s++) {
        //     for (var v = 0; v < Card.VALUES.length; v++) {
        //         this.cards.push(new Card(s, v));
        //     }
        // }
    }

    render() {
        for (var c in this.cards) {
            this.cards[c].render((c % 13) * 55 + 105, Math.floor(c / 13) * 80 + 125, (Main.lastRender/1000) % (Math.PI * 2), c % 2 == 0);
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
            rnd = Math.floor(Math.random() * this.cards.length);
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

    render(x: number, y: number, angle: number, face: boolean) {
        var w = Card.SIZE.w / 2,
            h = Card.SIZE.h / 2;
        Main.context.save();
        Main.context.translate(x + w, y + h);
        Main.context.rotate(angle);
        if (face) {
            Main.context.drawImage(Images.card, 50, 0, 50, 70, -w, -h, 50, 70);
            Main.context.drawImage(Images.alphabet, (this.value) * 17, (this.suit % 2) * 17, 17, 17, -w + 4, -h + 3, 17, 17);
            Main.context.drawImage(Images.suits, (this.suit) * 19, 0, 19, 19, -w + 29, -h + 3, 19, 19);
            Main.context.save();
            Main.context.rotate(Math.PI);
            Main.context.drawImage(Images.alphabet, (this.value) * 17, (this.suit % 2) * 17, 17, 17, -25 + 4, -35 + 3, 17, 17);
            Main.context.drawImage(Images.suits, (this.suit) * 19, 0, 19, 19, -25 + 29, -35 + 3, 19, 19);
            Main.context.restore();
        } else {
            Main.context.drawImage(Images.card, 0, 0, 50, 70, -w, -h, 50, 70);
        }
        Main.context.restore();
    }

}

class Images {

    static table: HTMLImageElement;
    static card: HTMLImageElement;
    static alphabet: HTMLImageElement;
    static suits: HTMLImageElement;

    static init() {
        Images.table = new Image();
        Images.table.src = "res/table.png";
        Images.card = new Image();
        Images.card.src = "res/card.png";
        Images.alphabet = new Image();
        Images.alphabet.src = "res/alphabet.png";
        Images.suits = new Image();
        Images.suits.src = "res/suits.png";
    }

}

window.onload = function() {
    Images.init();
    new Main();
}

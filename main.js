function get(what) {
    return document.getElementById(what);
}
var Main = (function () {
    function Main() {
        Main.canvas = get('gameCanvas');
        Main.context = Main.canvas.getContext('2d');
        Main.SIZE = { w: Main.canvas.width, h: Main.canvas.height };
        Main.table = new Table();
        Main.table.addPlayer(new Player("AJ", Main.table, false));
        Main.loop(performance.now());
    }
    Main.loop = function (tFrame) {
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
    };
    Main.queueUpdates = function (numTicks) {
        for (var i = 0; i < numTicks; i++) {
            Main.lastTick = Main.lastTick + Main.tickLength;
            Main.update(Main.lastTick);
        }
    };
    Main.update = function (delta) {
        Main.table.update();
    };
    Main.render = function () {
        Main.context.fillStyle = "#353";
        Main.context.fillRect(0, 0, Main.SIZE.w, Main.SIZE.h);
        Main.table.render();
    };
    Main.tickLength = 1000 / 60;
    return Main;
})();
var Table = (function () {
    function Table() {
        this.maxPlayers = 6;
        this.deck = new Deck();
        this.deck.shuffle();
        this.players = new Array();
    }
    Table.prototype.addPlayer = function (player) {
        if (this.players.length === this.maxPlayers) {
            console.error("Can not add player, there are already 6!");
            return;
        }
        this.players.push(player);
    };
    Table.prototype.removePlayer = function (player) {
        var i = this.players.indexOf(player);
        if (i != -1)
            this.players.splice(i);
    };
    Table.prototype.update = function () {
    };
    Table.prototype.render = function () {
        Main.context.drawImage(Images.table, Main.SIZE.w / 2 - 360, Main.SIZE.h / 2 - 240);
        for (var p in this.players) {
            this.players[p].render();
        }
    };
    return Table;
})();
var Player = (function () {
    function Player(name, table, ai, balance) {
        if (balance === void 0) { balance = 0; }
        this.name = name;
        this.table = table;
        this.ai = ai;
        this.balance = balance;
        this.cards = new Array(0);
    }
    Player.prototype.render = function () {
        for (var c in this.cards) {
            this.cards[c].render(c * 50, 150);
        }
    };
    return Player;
})();
var Deck = (function () {
    function Deck() {
        this.cards = this.newDeck();
    }
    Deck.prototype.newDeck = function () {
        var deck = new Array(52), i = 0;
        for (var s in Card.SUITS) {
            for (var v in Card.VALUES) {
                deck[i] = new Card(s, v);
                i++;
            }
        }
        return deck;
    };
    Deck.prototype.shuffle = function () {
        var i, tempCard, rnd;
        for (i = 0; i < this.cards.length; i++) {
            rnd = Math.random() * this.cards.length;
            tempCard = this.cards[rnd];
            this.cards[rnd] = this.cards[i];
            this.cards[i] = tempCard;
        }
    };
    Deck.prototype.deal = function (players) {
        if (this.cards.length < 2 * players.length) {
            console.error("Can't deal cards! Not enough left!");
            return;
        }
        for (var i = 0; i < 2; i++) {
            players[i].cards[i] = this.cards.pop();
        }
    };
    return Deck;
})();
var Card = (function () {
    function Card(suit, value) {
        this.suit = suit;
        this.value = value;
    }
    Card.prototype.toString = function () {
        return this.value + " of " + this.suit + "s";
    };
    Card.prototype.render = function (x, y, front) {
        if (front)
            Main.context.drawImage(Images.card_back, x, y);
        else
            Main.context.drawImage(Images.card_back, x, y);
        Main.context.fillStyle = "#000";
        Main.context.fillText(Card.SUITS[this.suit].charAt(0) + " " + this.value, x, y);
    };
    Card.SUITS = ["Spade", "Heart", "Club", "Diamond"];
    Card.VALUES = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];
    Card.SIZE = { w: 50, h: 70 };
    return Card;
})();
var Images = (function () {
    function Images() {
    }
    Images.init = function () {
        Images.table = new Image();
        Images.table.src = "res/table.png";
        Images.card_front = new Image();
        Images.card_front.src = "res/card-front.png";
        Images.card_back = new Image();
        Images.card_back.src = "res/card-back.png";
    };
    return Images;
})();
window.onload = function () {
    Images.init();
    new Main();
};

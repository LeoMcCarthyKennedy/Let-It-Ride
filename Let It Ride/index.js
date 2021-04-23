/*
	Program by:

	Leo McCarthy-Kennedy	
	Gurpiar Brar 			
	Adam Khaddaj 			
*/

// this file defines the game behaviour

// possible card values
const VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
// possible card suits
const SUITS = ["C", "D", "H", "S"];

// deck of 52 cards
const CARDS = [];

// populate deck
VALUES.forEach(v => {
	SUITS.forEach(s => {
		CARDS.push({ text: v + s, value: v, suit: s });
	});
});

// total money
let balance = 1000;

// money on each bet
let bet$ = 0;
let bet2 = 0;
let bet1 = 0;

// what stage the game is in (0 deal, 1 reveal card, 2 reveal card)
let stage = 0;

// the player hand (3 cards)
let playerHand = [];
// the community hand (2 cards)
let communityHand = [];
// the combined hand (5 cards)
let combinedHand = [];

// rank of the hand and the corresponding payout
let hand = { text: "", payout: 0 };

// increases the bets by x
function placeBet(x) {
	balance -= x * 3;
	bet$ += x;
	bet2 += x;
	bet1 += x;

	update();
}

// removes all bets
function clearBet() {
	balance += bet$ + bet1 + bet2;
	bet$ = 0;
	bet2 = 0;
	bet1 = 0;

	update();
}

// deals the player hand (3 cards)
function dealPlayerHand() {
	for (let i = 0; i < 3; i++) {
		let card;

		do {
			card = CARDS[Math.floor(Math.random() * 52)];
		} while (combinedHand.includes(card));

		playerHand.push(card);
		combinedHand.push(card);
	}

	stage++;

	calculateHand();
	update();
}

// deals the community hand (1 card at a time)
function dealCommunityHand() {
	let card;

	do {
		card = CARDS[Math.floor(Math.random() * 52)];
	} while (combinedHand.includes(card));

	communityHand.push(card);
	combinedHand.push(card);

	stage++;

	calculateHand();
	update();
}

// calculates the rank of the combined hand (3 to 5 cards)
function calculateHand() {
	// used to perform rank checking calculations
	let check = combinedHand;

	// sort hand by values
	check.sort(function (a, b) {
		return VALUES.indexOf(a.value) - VALUES.indexOf(b.value);
	});

	// check if the hand is entirely royal cards (10, J, Q, K, A)
	let isRoyal = check.every(card => ["10", "J", "Q", "K", "A"].includes(card.value));
	// check if the hand is entirely one suit
	let isFlush = check.every(card => check[0].suit == card.suit);
	// used when calculating if the hand is a straight
	let isStraight = true;
	// stores the values that appear more than once
	let duplicates = {};
	// used when calculating if the hand has a four of a kind
	let fourOfAKind = false;
	// used when calculating if the hand has a three of a kind
	let threeOfAKind = false;
	// used to store possible value pairs
	let pairs = [];

	for (let i = 0; i < check.length; i++) {
		// check if the hand is a straight (if the cards are in order)
		if (isStraight && i != check.length - 1) {
			if (VALUES.indexOf(check[i].value) != VALUES.indexOf(check[i + 1].value) - 1) {
				// perform extra check since ace can be low or high
				if (!(i == check.length - 2 && check[0].value == "2" && check[i + 1].value == "A")) {
					isStraight = false;
				}
			}
		}

		// populate duplicates list
		if (duplicates[check[i].value]) {
			duplicates[check[i].value].push(0);
		} else {
			duplicates[check[i].value] = [0];
		}
	}

	// calculate values that appear more than once
	Object.keys(duplicates).forEach(key => {
		switch (duplicates[key].length) {
			case 4:
				// hand has a four of a kind
				fourOfAKind = true;
				break;
			case 3:
				// hand has a three of a kind
				threeOfAKind = true;
				break;
			case 2:
				// hand has a pair
				pairs.push(key);
				break;
			default:
				break;
		}
	});

	// check all ranks and set hand variable accordingly

	if (check.length == 5 && isRoyal && isFlush) {
		hand.text = "Royal flush";
		hand.payout = 1000;
		return;
	}

	if (check.length == 5 && isStraight && isFlush) {
		hand.text = "Straight flush";
		hand.payout = 200;
		return;
	}

	if (fourOfAKind) {
		hand.text = "Four of a kind";
		hand.payout = 50;
		return;
	}

	if (threeOfAKind && pairs.length == 1) {
		hand.text = "Full house";
		hand.payout = 11;
		return;
	}

	if (check.length == 5 && isFlush) {
		hand.text = "Flush";
		hand.payout = 8;
		return;
	}

	if (check.length == 5 && isStraight) {
		hand.text = "Straight";
		hand.payout = 5;
		return;
	}

	if (threeOfAKind) {
		hand.text = "Three of a kind";
		hand.payout = 3;
		return;
	}

	if (pairs.length == 2) {
		hand.text = "Two pair";
		hand.payout = 2;
		return;
	}

	if (pairs.length == 1) {
		hand.text = VALUES.indexOf(pairs[0]) > 7 ? "High pair" : "Low pair";
		hand.payout = VALUES.indexOf(pairs[0]) > 7 ? 1 : 0;
		return;
	}

	hand.text = check[check.length - 1].value + " high";
	hand.payout = 0;
	return;
}

// pulls a bet (1 or 2)
function pull() {
	if (stage == 1) {
		// pull bet 1
		balance += bet1;
		bet1 = 0;
	} else {
		// pull bet 2
		balance += bet2;
		bet2 = 0;
	}

	dealCommunityHand();
}

// reset game
function reset() {
	// get starting balance from drop down menu
	balance = Number(document.getElementById("resetBalance").value.slice(1));
	bet$ = 0;
	bet2 = 0;
	bet1 = 0;

	stage = 0;

	playerHand = [];
	communityHand = [];
	combinedHand = [];

	hand = { text: "", payout: 0 };

	update();
}

// update the game screen
function update() {
	if (stage == 0) {
		document.getElementById("communityCard1").src = "images/cards/red_back.png";
		document.getElementById("communityCard2").src = "images/cards/red_back.png";

		document.getElementById("playerCard1").src = "images/cards/red_back.png";
		document.getElementById("playerCard2").src = "images/cards/red_back.png";
		document.getElementById("playerCard3").src = "images/cards/red_back.png";

		document.getElementById("hand").innerText = "Hand: None";

		document.getElementById("bet$").innerText = bet$ == 0 ? "$" : "$" + bet$;
		document.getElementById("bet2").innerText = bet2 == 0 ? "2" : "$" + bet2;
		document.getElementById("bet1").innerText = bet1 == 0 ? "1" : "$" + bet1;

		document.getElementById("clearBet").disabled = bet$ == 0;
		document.getElementById("placeBet1").disabled = balance < 3;
		document.getElementById("placeBet5").disabled = balance < 15;
		document.getElementById("placeBet10").disabled = balance < 30;
		document.getElementById("placeBet50").disabled = balance < 150;
		document.getElementById("placeBet100").disabled = balance < 300;

		document.getElementById("balance").innerText = "Balance: " + balance;

		document.getElementById("deal").disabled = bet$ == 0;
		document.getElementById("letItRide").disabled = true;
		document.getElementById("pull").disabled = true;
	} else if (stage == 1) {
		document.getElementById("playerCard1").src = "images/cards/" + playerHand[0].text + ".png";
		document.getElementById("playerCard2").src = "images/cards/" + playerHand[1].text + ".png";
		document.getElementById("playerCard3").src = "images/cards/" + playerHand[2].text + ".png";

		document.getElementById("hand").innerText = "Hand: " + hand.text;

		document.getElementById("clearBet").disabled = true;
		document.getElementById("placeBet1").disabled = true;
		document.getElementById("placeBet5").disabled = true;
		document.getElementById("placeBet10").disabled = true;
		document.getElementById("placeBet50").disabled = true;
		document.getElementById("placeBet100").disabled = true;

		document.getElementById("deal").disabled = true;
		document.getElementById("letItRide").disabled = false;
		document.getElementById("pull").disabled = false;
	} else if (stage == 2) {
		document.getElementById("communityCard1").src = "images/cards/" + communityHand[0].text + ".png";

		document.getElementById("hand").innerText = "Hand: " + hand.text;

		document.getElementById("bet$").innerText = bet$ == 0 ? "$" : "$" + bet$;
		document.getElementById("bet2").innerText = bet2 == 0 ? "2" : "$" + bet2;
		document.getElementById("bet1").innerText = bet1 == 0 ? "1" : "$" + bet1;

		document.getElementById("balance").innerText = "Balance: " + balance;
	} else if (stage == 3) {
		// payout
		balance += (bet$ + bet2 + bet1) * hand.payout;

		document.getElementById("communityCard2").src = "images/cards/" + communityHand[1].text + ".png";

		document.getElementById("hand").innerText = "Hand: " + hand.text;

		document.getElementById("bet$").innerText = bet$ == 0 ? "$" : "$" + bet$;
		document.getElementById("bet2").innerText = bet2 == 0 ? "2" : "$" + bet2;
		document.getElementById("bet1").innerText = bet1 == 0 ? "1" : "$" + bet1;

		document.getElementById("balance").innerText = "Balance: " + balance;

		// delay win/lose message
		setTimeout(function () {
			// display message
			if (hand.payout > 0) {
				alert("You won $" + (bet$ + bet2 + bet1) * hand.payout);
			} else {
				alert("You lost $" + (bet$ + bet2 + bet1));
			}

			// reset all but balance

			bet$ = 0;
			bet2 = 0;
			bet1 = 0;

			stage = 0;

			playerHand = [];
			communityHand = [];
			combinedHand = [];

			hand = { text: "", payout: 0 };

			update();
		}, 500);
	}
}
# mtg-calculator

A probability calculator for the Magic: the Gathering card Tasha's Hideous Laughter. Uses the Scryfall API to fetch card data and a recursive technique to calculate odds, with memoization to keep it from taking years.

## Building

Clone the repo, yarn to install addons, typsecript to transpile to js:

```sh
yarn
tsc
```

## Running

Run with node with 1 additional input, the path to the declist file to be analyzed:

```sh
node app input_deck.txt
```

## Valid Decklists

Anything copied from the "Export to Arena" button on MTGGoldfish should work, including decks with sideboards and companions (only the maindeck will be accounted for). Anything beyond that will probably break.

## Where to Go from Here

There is probably a better way to this using calculus, but my formal education in that area is lacking. Perhaps a project for another person or another time.

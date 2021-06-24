import { promises } from "fs";
import { getCardNamed } from "scryfall-client";
import Card from "scryfall-client/dist/models/card";
const { readFile } = promises;

// const MAX_CHECK = 80;

const cache: Map<string, number[]> = new Map();

async function main() {
	const deck_path = process.argv[2];
	const text = await readFile(deck_path, "utf8");
	const m = /^Deck\n([\s\S]+)\n\n/m.exec(text);

	if (!m) throw "Invalid Input Deck";

	const deck = await Promise.all(m[1].split("\n").map(v => {
		const [_, amount, name] = /^(\d+) (.+)$/.exec(v) ?? [];
		return getCardNamed(name).then(data => ({ amount: Number(amount), data }));
	}));

	const res = calculate_tasha(deck, 20);
	console.log("Chances:");
	console.log(res);
	console.log("Or-Higher:");
	console.log(res.map((v, i) => sum(res.slice(i))));
	console.log("Or-Lower:");
	console.log(res.map((v, i) => sum(res.slice(0, i + 1))));
	console.log("Mean:");
	console.log(sum(res.map((v, i) => v * i)));
	console.log("Total:");
	console.log(sum(res));
}

function sum(arr: number[]): number {
	return arr.reduce((acc, v) => acc + v);
}

function calculate_tasha(deck: { amount: number, data: Card }[], bust_total: number = 20): number[] {
	const cmcs: number[] = Array(16).fill(0);
	for (const card of deck) cmcs[card.data.cmc] += card.amount;
	console.log(cmcs);
	return calculate_tasha_cmcs(cmcs, bust_total);
}

function calculate_tasha_cmcs(cmc_amounts: number[], bust_total: number = 20, meta_prev = 0): number[] {
	if (bust_total <= 0) return [1];
	// if (meta_prev > MAX_CHECK) return [0, 1]

	// WARNING this could result in bad values if calculate_tasha is run multiple
	// times with diferent starting bust_totals, but since its only run once its
	// fine
	const input_as_string = String(cmc_amounts);
	const cached = cache.get(input_as_string);
	if (cached) {
		console.info(`retrieving cached for ${input_as_string}`);
		return cached;
	}
	console.info(`calcing ${input_as_string}`);

	let flip_weights = [0, 0];
	for (let cmc = 0; cmc < cmc_amounts.length; cmc++) {
		const amount = cmc_amounts[cmc];
		if (amount <= 0) continue;
		if (cmc >= bust_total) {
			flip_weights[1] += amount;
		} else {
			let new_amounts = [...cmc_amounts];
			new_amounts[cmc] -= 1;
			const sub_result = calculate_tasha_cmcs(new_amounts, bust_total - cmc, meta_prev + 1);
			for (let flips = 0; flips < sub_result.length; flips++) {
				flip_weights[flips + 1] = (flip_weights[flips + 1] ?? 0) + sub_result[flips] * amount;
			}
		}
	}
	let total = 0;
	for (let flips = 0; flips < flip_weights.length; flips++) {
		total += flip_weights[flips] ?? 0;
	}
	for (let flips = 0; flips < flip_weights.length; flips++) {
		flip_weights[flips] = (flip_weights[flips] ?? 0) / total;
	}
	
	cache.set(input_as_string, flip_weights);
	return flip_weights;
}

main().catch(console.error);

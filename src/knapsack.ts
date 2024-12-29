import { Organism, GeneticAlgorithm, GeneticAlgorithmModel } from "./terrarium.js";

const MUTATION_CHANCE: number = 0.01;
const POPULATION_SIZE: number = 5;
const FRAME_DELAY: number = 40;

const CANVAS_HEIGHT: number = 250;
const CANVAS_WIDTH: number = 250;

const canvas: HTMLCanvasElement = document.createElement("canvas");
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;

//##############################################################################
// hyperparamters
//##############################################################################

const WEIGHT_CAPACITY: number = 400;
const MIN_WEIGHT: number = 50;
const MAX_WEIGHT: number = 100;
const MIN_VALUE: number = 10;
const MAX_VALUE: number = 40;
const MIN_SIZE: number = 5;
const MAX_SIZE: number = 20;

const NUM_ITEMS: number = 15;

enum Shape {
  Triangle,
  Circle,
  Square
}

type Color = {
  red: number,
  green: number,
  blue: number,
}

class Item {
  shape: Shape;
  weight: number;
  value: number;
  color: Color;

  constructor(shape: Shape, weight: number, value: number, color: Color) {
    this.shape = shape;
    this.weight = weight;
    this.value = value;
    this.color = color;
  }

  draw(canvas: HTMLCanvasElement, x: number, y: number) {
    const ctx = canvas.getContext("2d");
    const scaledSize: number = MIN_SIZE  + (this.weight - MIN_WEIGHT) * (MAX_SIZE - MIN_SIZE) / (MAX_WEIGHT - MIN_WEIGHT);

    ctx.fillStyle = `rgba(${this.color.red}, ${this.color.green}, ${this.color.blue}, 0.25)`;
    
    ctx.beginPath();

    switch (this.shape) {
      case Shape.Triangle:
        // draw a triangle at x and y
        ctx.moveTo(x, y - (scaledSize / 2));
        ctx.lineTo(x - (scaledSize / 2), y + (scaledSize / 2));
        ctx.lineTo(x + (scaledSize / 2), y + (scaledSize / 2));
        break;
      case Shape.Circle:
        // draw a circle at x and y
        ctx.ellipse(x, y, (scaledSize / 2), (scaledSize / 2), 0, 0, Math.PI * 2);
        break;
      case Shape.Square:
        // draw a squer at x and y
        ctx.rect(x - (scaledSize / 2), y - (scaledSize / 2), scaledSize, scaledSize);
        break;
      default:
        console.error("Invalid shape.");
        break;
    }

    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.font = "8px Sans";
    ctx.textAlign = "center";
    ctx.fillText(`${this.value}`, x, y + 5);
  }
}

function getRandomItem() {
  return new Item(
    getRandomInt(0, Shape.Square),
    getRandomInt(MIN_WEIGHT, MAX_WEIGHT),
    getRandomInt(MIN_VALUE, MAX_VALUE),
    {
      red: getRandomInt(0, 255),
      green: getRandomInt(0, 255),
      blue: getRandomInt(0, 255),
    }
  );
}

function clearCanvas(cv: HTMLCanvasElement, color: string = "rgb(255, 255, 255)") {
  cv.getContext("2d").fillStyle = color;
  cv.getContext("2d").fillRect(0, 0, cv.width, cv.height);
}

// create available items

let AVAILABLE_ITEMS: Item[] = [];

for (let i = 0; i < NUM_ITEMS; i++) {
  AVAILABLE_ITEMS.push(getRandomItem());
}

console.log(AVAILABLE_ITEMS);

class KnapsackOrganism implements Organism {
  mutationChance: number;
  genes: Item[];

  constructor() {
    this.mutationChance = MUTATION_CHANCE;
    this.genes = [];
    
    let available_items_copy: Item[] = AVAILABLE_ITEMS.map(item => Object.assign(Object.create(Object.getPrototypeOf(item)), item));

    while (this.getWeight() < WEIGHT_CAPACITY || available_items_copy.length <= 0) {
      const randomIndex = getRandomInt(0, available_items_copy.length - 1);
      this.genes.push(available_items_copy[randomIndex]);
      available_items_copy.splice(randomIndex, 1);
    }

    // remove the top item because it caused the overflow
    this.genes.pop();
  }

  getWeight(): number {
    let weight: number = 0;

    for (let i = 0; i < this.genes.length; i++) {
      weight += this.genes[i].weight;
    }
    
    return weight;
  }
  
  getValue(): number {
    let value: number = 0;

    for (let i = 0; i < this.genes.length; i++) {
      value += this.genes[i].value;
    }
    
    return value;
  }
}

//##############################################################################
// createOrganism
//##############################################################################

// randomly select items from the group until the weight limit is hit
function createOrganism(): KnapsackOrganism {
  return new KnapsackOrganism();
}

//##############################################################################
// crossover
//##############################################################################

// trade objects but make sure it's still within the weight limit
function crossover(parentA: KnapsackOrganism, parentB: KnapsackOrganism) {
  return structuredClone(parentA);
}

//##############################################################################
// fitness
//##############################################################################

// fitness is just the total value of all objects in the knapsack
function calculateFitness(organism: KnapsackOrganism): number {
  return organism.getValue();
}

//##############################################################################
// mutation
//##############################################################################

// trade random object out with other object
function mutate(organism: KnapsackOrganism): KnapsackOrganism {
  return organism;
}

//##############################################################################
// stepFunction
//##############################################################################

// nothing
function stepFunction(model: GeneticAlgorithmModel<KnapsackOrganism>): void {
  return;
}

//##############################################################################
// shouldProgressGeneration
//##############################################################################

function shouldProgressGeneration(model: GeneticAlgorithmModel<KnapsackOrganism>): boolean {
  return true;
}

//##############################################################################
// shouldTerminate
//##############################################################################

function shouldTerminate(model: GeneticAlgorithmModel<KnapsackOrganism>): boolean {
  return false;
}

//##############################################################################
// setup
//##############################################################################

let geneticAlgorithm = new GeneticAlgorithm(
  createOrganism,
  stepFunction,
  calculateFitness,
  crossover,
  mutate,
  shouldTerminate,
  shouldProgressGeneration,
  POPULATION_SIZE,
  false,
  FRAME_DELAY
)

let view: HTMLDivElement = document.createElement("div");
view.style.display = "flex";
view.style.alignItems = "center";
view.style.flexDirection = "column";
view.style.gap = "1rem";
view.style.justifyContent = "space-evenly";
view.style.position = "relative";

let playButton: HTMLButtonElement = document.createElement("button");
playButton.innerText = "▶ play ";
playButton.addEventListener("click", () => {
  geneticAlgorithm.play();
});

let pauseButton: HTMLButtonElement = document.createElement("button");
pauseButton.innerText = "⏸ pause";
pauseButton.addEventListener("click", () => {
  geneticAlgorithm.pause();
});

let resetButton: HTMLButtonElement = document.createElement("button");
resetButton.innerText = "⟲ reset";
resetButton.addEventListener("click", () => {
  geneticAlgorithm.reset();
});

let controls: HTMLDivElement = document.createElement("div");
controls.appendChild(playButton);
controls.appendChild(pauseButton);
controls.appendChild(resetButton);
controls.style.display = "flex";
controls.style.flexDirection = "row";
controls.style.alignItems = "flex-start";
controls.style.justifyContent = "space-evenly";
controls.style.width = "100%";

let title: HTMLParagraphElement = document.createElement("p");
title.innerText = "Knapsack problem";
title.style.position = "absolute";
title.style.left = "0px";
title.style.top = "0px";
title.style.padding = "0.25rem";
title.style.transform = "translateY(-100%)";
title.style.fontSize = "0.75rem";

// append the whole view
view.appendChild(canvas);
view.appendChild(title);
view.appendChild(controls);
document.querySelector("#view").appendChild(view);

//##############################################################################
// display
//##############################################################################
clearCanvas(canvas);

canvas.getContext("2d").rect(10, 10, CANVAS_WIDTH - 20, 60);
canvas.getContext("2d").stroke();

for (const item of AVAILABLE_ITEMS) {
  item.draw(canvas, getRandomInt(20, CANVAS_WIDTH - 20), getRandomInt(20, 50));
}

// draw each knapsack

const DISPLAY_PADDING = 10;
const GAP = 10;

const t = CANVAS_WIDTH;
const g = GAP;
const p = DISPLAY_PADDING;
const n = geneticAlgorithm.model.population.length;

const KNAPSACK_WIDTH: number = ((2 * p) + (n - 1) * g - t) / - n;

const KNAPSACK_PADDING = 5;

const ctx = canvas.getContext("2d");

for (let i = 0; i < geneticAlgorithm.model.population.length; i++) {
  const currentKnapsack = geneticAlgorithm.model.population[i];
  const x = p + i * g + i * KNAPSACK_WIDTH;
  const y = 100;

  ctx.beginPath();
  ctx.rect(x, y, KNAPSACK_WIDTH, CANVAS_HEIGHT - y - 10);
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = "black";
  ctx.font = "8px Sans";
  ctx.textAlign = "left";
  ctx.fillText(`$${currentKnapsack.getValue()}`, x, y - 6);
  ctx.fillText(`w: ${currentKnapsack.getWeight()}`, x, y - 16);

  for (let j = 0; j < geneticAlgorithm.model.population[i].genes.length; j++) {
    geneticAlgorithm.model.population[i].genes[j].draw(canvas, getRandomInt(x + 5, p + KNAPSACK_WIDTH + (i * g) + (i * KNAPSACK_WIDTH) - 5), getRandomInt(y + 5, CANVAS_HEIGHT - 15));
  }
}

// draw a green square around the current best knapsack

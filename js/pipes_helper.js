const xmax = 50;
const xmin = -50;
const ymax = 50;
const ymin = -50;
const zmax = 50;
const zmin = -50;

function validCoords(coords) {
	return coords.x <= xmax && coords.x >= xmin && coords.y <= ymax && coords.y >= ymin && coords.z <= zmax && coords.z >= zmin
}

const dirs = [
	{x: 1, y: 0, z: 0},
	{x: -1, y: 0, z: 0},
	{x: 0, y: 1, z: 0},
	{x: 0, y: -1, z: 0},
	{x: 0, y: 0, z: 1},
	{x: 0, y: 0, z: -1}
]

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

class PipeRun {
	constructor() {
		// this.materialargs = materialargs;
		this.maxlength = 100;
		this.startpos = {x: 0, y: 0, z: 0};
		this.visited = new Set();
		this.path = [];
	}

	generatePath() {
		let cur = this.startpos;
		while (this.maxlength > 0) {
			this.visited.add(JSON.stringify(cur));
			this.path.push(cur);
			shuffleArray(dirs);
			let i = 0;
			let nextdir = dirs[i];
			let nextpos = {x: cur.x + nextdir.x, y: cur.y + nextdir.y, z: cur.z + nextdir.z};
			while ( !validCoords(nextpos) || this.visited.has(JSON.stringify(nextpos)) ) {
				i += 1;
				nextdir = dirs[i];
				nextpos = {x: cur.x + nextdir.x, y: cur.y + nextdir.y, z: cur.z + nextdir.z};
			}
			cur = nextpos;
			this.maxlength -= 1;
		}
	}
}

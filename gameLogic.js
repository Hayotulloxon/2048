export default class Game2048 {
  constructor() {
    this.board = Array(4).fill().map(() => Array(4).fill(0));
    this.coins = 0;
    this.maxTile = 0;
    this.minSpawn = 2;
    this.highProb = false;
    this.addTile();
    this.addTile();
  }

  addTile() {
    const empty = [];
    this.board.forEach((row, i) => row.forEach((val, j) => { if (!val) empty.push([i, j]); }));
    if (empty.length) {
      const [i, j] = empty[Math.floor(Math.random() * empty.length)];
      const value = this.highProb && Math.random() > 0.5 ? 4 : this.minSpawn;
      this.board[i][j] = value;
      this.maxTile = Math.max(this.maxTile, value);
    }
  }

  move(direction) {
    let moved = false;
    let coinsEarned = 0;
    // Simplified: Handle one direction (extend for all)
    if (direction === 'right') {
      for (let i = 0; i < 4; i++) {
        let row = this.board[i].filter(val => val);
        for (let j = row.length - 1; j > 0; j--) {
          if (row[j] === row[j - 1]) {
            row[j] *= 2;
            row[j - 1] = 0;
            coinsEarned += row[j] / 2;
            moved = true;
          }
        }
        row = row.filter(val => val);
        this.board[i] = Array(4 - row.length).fill(0).concat(row);
      }
    }
    if (moved) {
      this.coins += coinsEarned;
      this.addTile();
    }
    return moved;
  }

  applyUpgrade(type) {
    if (type === 'highProb') this.highProb = true;
    if (type === 'minSpawn') this.minSpawn = 4;
    this.coins -= 100;
  }
}
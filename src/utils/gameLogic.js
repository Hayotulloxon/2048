export default class Game2048 {
  constructor() {
    this.board = Array.from({ length: 4 }, () => Array(4).fill(0));
    this.coins = 0;
    this.maxTile = 0;
    this.minSpawn = 2;
    this.highProb = false;
    this.coinsDelta = 0;
    this.addTile();
    this.addTile();
  }

  addTile() {
    const empty = [];
    this.board.forEach((row, i) => row.forEach((val, j) => {
      if (!val) empty.push([i, j]);
    }));
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
    if (direction === 'right') {
      for (let i = 0; i < 4; i++) {
        let row = this.board[i].filter(val => val !== 0);
        for (let j = row.length - 1; j > 0; j--) {
          if (row[j] === row[j - 1]) {
            row[j] *= 2;
            this.maxTile = Math.max(this.maxTile, row[j]);
            coinsEarned += row[j] / 2;
            row.splice(j - 1, 1);
            moved = true;
            j--;
          }
        }
        this.board[i] = [...Array(4 - row.length).fill(0), ...row];
      }
    } else if (direction === 'left') {
      for (let i = 0; i < 4; i++) {
        let row = this.board[i].filter(val => val !== 0);
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2;
            this.maxTile = Math.max(this.maxTile, row[j]);
            coinsEarned += row[j] / 2;
            row.splice(j + 1, 1);
            moved = true;
          }
        }
        this.board[i] = [...row, ...Array(4 - row.length).fill(0)];
      }
    }
    // TODO: Add up/down movements
    if (moved) {
      this.coins += coinsEarned;
      this.coinsDelta = coinsEarned;
      this.addTile();
    }
    return moved;
  }

  applyUpgrade(type) {
    if (type === 'highProb') this.highProb = true;
    if (type === 'minSpawn') this.minSpawn = 4;
    this.coins -= 100;
    this.coinsDelta = -100;
  }
}

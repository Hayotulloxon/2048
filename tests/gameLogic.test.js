import Game2048 from '../src/utils/gameLogic';

test('merge tiles earns coins', () => {
  const game = new Game2048();
  game.board = [
    [2, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  game.move('right');
  expect(game.board[0]).toEqual([0, 0, 0, 4]);
  expect(game.coinsDelta).toBe(2); // Since 2+2=4, earned 2
});

import Game2048 from '../utils/gameLogic';

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
  expect(game.coins).toBe(2);
});
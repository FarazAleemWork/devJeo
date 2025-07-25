const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

module.exports = {
  generateRoomCode: () => nanoid(),
  generatePlayerId: () => nanoid()
};

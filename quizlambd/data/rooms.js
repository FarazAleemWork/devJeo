// /data/rooms.js
const rooms = {};  // { [objRoomCode]: objRoomObject }

module.exports = {
  getRoom: (code) => rooms[code],
  setRoom: (code, data) => rooms[code] = data,
  deleteRoom: (code) => delete rooms[code],
  getAllRooms: () => rooms
};
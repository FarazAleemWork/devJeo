const roomManager = require('./managers/roomManager');

// 1. Create room with host
const room = roomManager.createRoom('Alex');
console.log('✅ Room created:', room);

// 2. Players join
const player1 = roomManager.joinRoom(room.code, 'John');
console.log('✅ Player joined:', player1);

const player2 = roomManager.joinRoom(room.code, 'Jane');
console.log('✅ Player joined:', player2);

// 3. Try to join with host name (should fail)
const badJoin = roomManager.joinRoom(room.code, 'Alex');
console.log('❌ Host name conflict:', badJoin);

// 4. Check room state
const currentState = roomManager.getRoomState(room.code);
console.log('📦 Room state:', currentState);

// 5. Player leaves
roomManager.leaveRoom(room.code, player1.player.id);
console.log('🚪 Player left:', roomManager.getRoomState(room.code));

// 6. Host leaves (room deleted)
const updatedRoom = roomManager.getRoomState(room.code);
roomManager.leaveRoom(room.code, updatedRoom.host.id);
console.log('🧹 Host left, room should be gone:', roomManager.getRoomState(room.code));

// git git git 
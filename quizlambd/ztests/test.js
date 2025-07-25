const roomManager = require('../managers/roomManager');

// 1. Create objRoom with host
const objRoom = roomManager.createRoom('Alex');
console.log('✅ objRoom created:', objRoom);

// 2. Players join
const player1 = roomManager.joinRoom(objRoom.code, 'John');
console.log('✅ Player joined:', player1);

const player2 = roomManager.joinRoom(objRoom.code, 'Jane');
console.log('✅ Player joined:', player2);

// 3. Try to join with host name (should fail)
const badJoin = roomManager.joinRoom(objRoom.code, 'Alex');
console.log('❌ Host name conflict:', badJoin);

// 4. Check objRoom state
const currentState = roomManager.getRoomState(objRoom.code);
console.log('📦 objRoom state:', currentState);

// 5. Player leaves
roomManager.leaveRoom(objRoom.code, player1.player.id);
console.log('🚪 Player left:', roomManager.getRoomState(objRoom.code));

// 6. Host leaves (objRoom deleted)
const updatedRoom = roomManager.getRoomState(objRoom.code);
roomManager.leaveRoom(objRoom.code, updatedRoom.host.id);
console.log('🧹 Host left, objRoom should be gone:', roomManager.getRoomState(objRoom.code));

// git git git 
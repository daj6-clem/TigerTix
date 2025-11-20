
import { createUser, getUserByName } from '../models/User.js';

describe('User Model', () => {
  it('should create a user and retrieve it by username', async () => {
    const username = 'testuser_' + Date.now();
    const passHash = 'hashedpassword';
    const user = await createUser(username, passHash);
    expect(user).toHaveProperty('id');
    const found = await getUserByName(username);
    expect(found).toBeDefined();
    expect(found.username).toBe(username);
    expect(found.password_hash).toBe(passHash);
  });
});

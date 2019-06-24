const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneId, setupDatabase } = require('./fixtures/db.js')

beforeEach(setupDatabase)

test('Should signup a new user', async ()=> {
    const response = await request(app).post('/users')
        .send({
            name: 'Rodney',
            email: 'rodney@gmail.com',
            password: 'MyPass123'
        }).expect(201)

    // Assert that the db was changed correctly
    const user = await User
        .findById(response.body.user._id)

    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body)
        .toMatchObject({
            user: {
                name: 'Rodney',
                email: 'rodney@gmail.com'
            },
            token: user.tokens[0].token
        })

    expect(user.password).not.toBe('MyPass123')
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,                           
            password: userOne.password
        }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login nonexistent user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'notexistuser@email.com',
            password: userOne.password
        }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should upload avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'User 1_UPDATED'
        })
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('User 1_UPDATED')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            field_not_on_model: 'SHOULD NOT UPDATED'
        })
        .expect(400)
})


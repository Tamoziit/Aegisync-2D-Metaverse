const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL;

// Describe Blocks
describe("Authentication", () => {
    //Running Tests
    test('User can Signup only once', async () => {
        const username = "Tamoziit" + Math.random();
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.userId).toBeDefined(); //for userId

        // same user not allowed to signup again
        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });
        expect(updatedResponse.statusCode).toBe(400);
    });

    test("Signup request fails if the username is empty", async () => {
        const username = `Tamoziit-${Math.random()}`;
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password,
            type: "admin"
        });
        expect(response.statusCode).toBe(400);
    });

    test("Sign in succeeds if the username and password are correct", async () => {
        const username = `Tamoziit-${Math.random()}`;
        const password = "123456";
        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined(); //for token
    });

    test("Sign in fails if the username and password are incorrect", async () => {
        const username = `Tamoziit-${Math.random()}`;
        const password = "123456";
        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "WrongUsername",
            password
        });
        expect(response.statusCode).toBe(403);
    });
});

describe("User Metadata endpoint", () => {
    let token = "";
    let avatarId = "";

    beforeAll(async () => {
        const username = `Tamoziit/${Math.random()}`;
        const password = "123456";
        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoGa43cPo70DYcZ847mc02nOf8y0r9nJ38WQ&s",
            "name": "Tymall"
        });

        avatarId = avatarResponse.data.avatarId;
    });

    test("User can't update their metadata with a wrong avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123123"
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        });

        expect(response.statusCode).toBe(400);
    });

    test("User can update their metadata with a right avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId,
        }, {
            headers: {
                "authorization": `Bearer ${token}`
            }
        });

        expect(response.statusCode).toBe(200);
    });

    test("User can't update their metadata if auth header is missing", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId,
        });

        expect(response.statusCode).toBe(403);
    });
});

describe("User avatar information", () => {
    let avatarId = "";
    let token = "";
    let userId = "";

    beforeAll(async () => {
        const username = `Tamoziit/${Math.random()}`;
        const password = "123456";
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });
        userId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });
        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoGa43cPo70DYcZ847mc02nOf8y0r9nJ38WQ&s",
            "name": "Tymall"
        });
        avatarId = avatarResponse.data.avatarId;
    });

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);

        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    });

    test("Available avatars lists the currently listed avatars", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);

        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.find(x => x.id === avatarId);
        expect(currentAvatar).toBeDefined();
    });
});

describe("Space information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let token;
    let adminId;

    beforeAll(async () => {
        const username = `Tamoziit-${Math.random()}`;
        const password = "123456";
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });
        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });
        token = response.data.token;

        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://img.freepik.com/premium-vector/chair-clipart-cartoon-style-illustration_761413-4364.jpg?semt=ais_hybrid",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://img.freepik.com/premium-vector/chair-clipart-cartoon-style-illustration_761413-4364.jpg?semt=ais_hybrid",
            "width": 1,
            "height": 1,
            "static": true
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        element1Id = element1.data.id;
        element2Id = element2.data.id;

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements": [{
                elementId: element1Id,
                x: 20,
                y: 20
            }, {
                elementId: element1Id,
                x: 18,
                y: 20
            }, {
                elementId: element2Id,
                x: 19,
                y: 20
            }]
        }, {
            headers: {
                authorization: `Bearer ${token}`
            }
        });
        mapId = map.data.id;
    });

    
});
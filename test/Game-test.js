const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Game Contract", function () {
    let Game;
    let gameContract;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        Game = await ethers.getContractFactory("Game");
        gameContract = await Game.deploy();
        await gameContract.deployed();

        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    })

    describe("Open game", function () {
        it("Should open a game", async function () {
            const count = await gameContract.getCount();
            expect(count).to.equal(0)
            
            await gameContract.openGame();
            count2 = await gameContract.getCount();
            expect(count2).to.equal(1)

            let games = await gameContract.getGames(1);
            console.log('%cGame-test.js line:34 games', 'color: #007acc;', games);
        })
    })

    describe("Accept game", function () {
        it("Should start a game with 2 players", async function () {
            const count = await gameContract.getCount();
            expect(count).to.equal(0)
            
            await gameContract.openGame();
            count2 = await gameContract.getCount();
            expect(count2).to.equal(1)

            let game = await gameContract.getGames(1);
            console.log('%cGame-test.js line:44 game', 'color: #007acc;', game);

            await gameContract.connect(addr1).acceptGame(1)
            game = await gameContract.getGames(1);
            console.log('%cGame-test.js line:48 game', 'color: #007acc;', game);

            const starter = await gameContract.getStarter(1)
            console.log('%cGame-test.js line:51 starter', 'color: #007acc;', starter);
        })

        it("Should concatenate public keys and return the hashed result", async function () {
            const ownerStr = await gameContract.addressToString(owner.address)
            console.log("Hi")
            const addr1Str = await gameContract.addressToString(addr1.address)
            console.log('%cGame-test.js line:54 ownerStr', 'color: #007acc;', ownerStr);
            console.log('%cGame-test.js line:55 addr1Str', 'color: #007acc;', addr1Str);
            const sum = await gameContract.addKeys(ownerStr, addr1Str);
            console.log('%cGame-test.js line:58 sum', 'color: #007acc;', sum);
            bit1 = sum[65]
            console.log('%cGame-test.js line:60 bit1', 'color: #007acc;', bit1);
        })

        it.only("Should let players make a move", async function () {
            const count = await gameContract.getCount();
            expect(count).to.equal(0)
            
            await gameContract.openGame();
            count2 = await gameContract.getCount();
            expect(count2).to.equal(1)

            let game = await gameContract.getGames(1);
            console.log('%cGame-test.js line:44 game', 'color: #007acc;', game);

            await gameContract.connect(addr1).acceptGame(1)
            game = await gameContract.getGames(1);
            console.log('%cGame-test.js line:48 game', 'color: #007acc;', game);

            await gameContract.makeMove(1, 0, 0);
            game = await gameContract.getGames(1);
            console.log('%cGame-test.js line:83 game', 'color: #007acc;', game);
           
            await gameContract.makeMove(1, 2, 2);
            game = await gameContract.getGames(1);
            console.log('%cGame-test.js line:87 game', 'color: #007acc;', game);
        })
    })

});

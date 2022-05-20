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

            let game = await gameContract.getGames(1);
            expect(owner.address).to.equal(game.Player1);
            expect(game.playerCount).to.equal(1)
        })

        it("Should open multiple games", async function () {
            const count = await gameContract.getCount();
            expect(count).to.equal(0)

            await gameContract.openGame();
            count2 = await gameContract.getCount();
            expect(count2).to.equal(1)

            let game1 = await gameContract.getGames(1);
            expect(owner.address).to.equal(game1.Player1)
            expect(game1.playerCount).to.equal(1)

            await gameContract.connect(addr1).openGame();

            count3 = await gameContract.getCount();
            expect(count3).to.equal(2);

            let game2 = await gameContract.getGames(2)
            expect(addr1.address).to.equal(game2.Player1)
            expect(game2.playerCount).to.equal(1)
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

            expect(game.Player1).to.equal(owner.address);
            expect(game.Player2).to.equal(addr1.address);
            expect(game.playerCount).to.equal(2);
        })

        it("Should fail since gameId is not in range", async function () {
            const count = await gameContract.getCount();
            expect(count).to.equal(0)

            await expect(gameContract.connect(addr1).acceptGame(1)).to.be.revertedWith('Game is not initiated');
        })

        it("Should fail since there are already two players in this game", async function () {
            const count = await gameContract.getCount();
            expect(count).to.equal(0)

            await gameContract.openGame();
            count2 = await gameContract.getCount();
            expect(count2).to.equal(1)

            await gameContract.connect(addr1).acceptGame(1)
            game = await gameContract.getGames(1);
            console.log('%cGame-test.js line:48 game', 'color: #007acc;', game);

            await expect(gameContract.connect(addr2).acceptGame(1)).to.be.revertedWith('Game already in progress');
        })

        describe("Make move", function () {
            it("Should let players make a move", async function () {
                const count = await gameContract.getCount();
                expect(count).to.equal(0)

                await gameContract.openGame();
                count2 = await gameContract.getCount();
                expect(count2).to.equal(1)

                let game = await gameContract.getGames(1);
                console.log('%cGame-test.js line:44 game', 'color: #007acc;', game);
                expect(game.Player1).to.equal(owner.address);

                await gameContract.connect(addr1).acceptGame(1)
                game = await gameContract.getGames(1);
                console.log('%cGame-test.js line:48 game', 'color: #007acc;', game);
                expect(game.Player2).to.equal(addr1.address);

                // moves here
                await gameContract.makeMove(1, 0, 0);
                game = await gameContract.getGames(1);
                console.log('%cGame-test.js line:83 game', 'color: #007acc;', game);

                await gameContract.connect(addr1).makeMove(1, 2, 2);
                game = await gameContract.getGames(1);
                console.log('%cGame-test.js line:87 game', 'color: #007acc;', game);

                await gameContract.makeMove(1, 1, 1);
                game = await gameContract.getGames(1);
                console.log('%cGame-test.js line:87 game', 'color: #007acc;', game);

                await gameContract.connect(addr1).makeMove(1, 1, 2);
                game = await gameContract.getGames(1);
                console.log('%cGame-test.js line:87 game', 'color: #007acc;', game);
            })
        })

        describe("Winner", function () {
            it("Should return Player1 as the row winner", async function () {
                const count = await gameContract.getCount();
                expect(count).to.equal(0)

                await gameContract.openGame();
                count2 = await gameContract.getCount();
                expect(count2).to.equal(1)

                let game = await gameContract.getGames(1);
                expect(game.Player1).to.equal(owner.address);

                await gameContract.connect(addr1).acceptGame(1)
                game = await gameContract.getGames(1);
                expect(game.Player2).to.equal(addr1.address);

                // moves here
                await gameContract.makeMove(1, 0, 0);
                await gameContract.connect(addr1).makeMove(1, 2, 2);
                await gameContract.makeMove(1, 0, 1);
                await gameContract.connect(addr1).makeMove(1, 2, 1);
                await gameContract.makeMove(1, 0, 2);
                game = await gameContract.getGames(1);

                console.log('%cGame-test.js line:186 game', 'color: #007acc;', game);
                expect(game.winner).to.equal(1)
            })

            it("Should return Player1 as the col winner", async function () {
                const count = await gameContract.getCount();
                expect(count).to.equal(0)

                await gameContract.openGame();
                count2 = await gameContract.getCount();
                expect(count2).to.equal(1)

                let game = await gameContract.getGames(1);
                expect(game.Player1).to.equal(owner.address);

                await gameContract.connect(addr1).acceptGame(1)
                game = await gameContract.getGames(1);
                expect(game.Player2).to.equal(addr1.address);

                // moves here
                await gameContract.makeMove(1, 0, 0);
                await gameContract.connect(addr1).makeMove(1, 2, 2);
                await gameContract.makeMove(1, 1, 0);
                await gameContract.connect(addr1).makeMove(1, 2, 1);
                await gameContract.makeMove(1, 2, 0);
                game = await gameContract.getGames(1);

                console.log('%cGame-test.js line:186 game', 'color: #007acc;', game);
                expect(game.winner).to.equal(1)
            })

            it("Should return Player2 as the diagonal winner", async function () {
                const count = await gameContract.getCount();
                expect(count).to.equal(0)

                await gameContract.openGame();
                count2 = await gameContract.getCount();
                expect(count2).to.equal(1)

                let game = await gameContract.getGames(1);
                expect(game.Player1).to.equal(owner.address);

                await gameContract.connect(addr1).acceptGame(1)
                game = await gameContract.getGames(1);
                expect(game.Player2).to.equal(addr1.address);

                // moves here
                await gameContract.makeMove(1, 1, 0);
                await gameContract.connect(addr1).makeMove(1, 0, 0);
                await gameContract.makeMove(1, 1, 2);
                await gameContract.connect(addr1).makeMove(1, 1, 1);
                await gameContract.makeMove(1, 2, 0);
                await gameContract.connect(addr1).makeMove(1, 2, 2);
                game = await gameContract.getGames(1);

                console.log('%cGame-test.js line:186 game', 'color: #007acc;', game);
                expect(game.winner).to.equal(2)
            })

            it("Should return a Draw", async function () {
                const count = await gameContract.getCount();
                expect(count).to.equal(0)

                await gameContract.openGame();
                count2 = await gameContract.getCount();
                expect(count2).to.equal(1)

                let game = await gameContract.getGames(1);
                expect(game.Player1).to.equal(owner.address);

                await gameContract.connect(addr1).acceptGame(1)
                game = await gameContract.getGames(1);
                expect(game.Player2).to.equal(addr1.address);

                // moves here
                await gameContract.makeMove(1, 0, 0);
                await gameContract.connect(addr1).makeMove(1, 0, 1);
                await gameContract.makeMove(1, 1, 0);
                await gameContract.connect(addr1).makeMove(1, 1, 1);
                await gameContract.makeMove(1, 2, 1);
                await gameContract.connect(addr1).makeMove(1, 2, 0);
                await gameContract.makeMove(1, 2, 2);
                await gameContract.connect(addr1).makeMove(1, 1, 2);
                await gameContract.makeMove(1, 0, 2);
                game = await gameContract.getGames(1);

                console.log('%cGame-test.js line:186 game', 'color: #007acc;', game);
                expect(game.winner).to.equal(3)
            })

            it("Should fail since gameId is not in range", async function () {
                const count = await gameContract.getCount();
                expect(count).to.equal(0)

                await gameContract.openGame();
                count2 = await gameContract.getCount();
                expect(count2).to.equal(1)

                let game = await gameContract.getGames(1);
                expect(game.Player1).to.equal(owner.address);

                await gameContract.connect(addr1).acceptGame(1)
                game = await gameContract.getGames(1);
                expect(game.Player2).to.equal(addr1.address);

                await expect(gameContract.makeMove(2, 0, 0)).to.be.revertedWith('Game is not initiated');
            })

            it("Should fail since not current users turn", async function () {
                const count = await gameContract.getCount();
                expect(count).to.equal(0)

                await gameContract.openGame();
                count2 = await gameContract.getCount();
                expect(count2).to.equal(1)

                let game = await gameContract.getGames(1);
                expect(game.Player1).to.equal(owner.address);

                await gameContract.connect(addr1).acceptGame(1)
                game = await gameContract.getGames(1);
                expect(game.Player2).to.equal(addr1.address);

                await expect(gameContract.connect(addr1).makeMove(1, 0, 0)).to.be.revertedWith('Not your turn');
            })

            it("Should fail since game is over", async function () {
                const count = await gameContract.getCount();
                expect(count).to.equal(0)

                await gameContract.openGame();
                count2 = await gameContract.getCount();
                expect(count2).to.equal(1)

                let game = await gameContract.getGames(1);
                expect(game.Player1).to.equal(owner.address);

                await gameContract.connect(addr1).acceptGame(1)
                game = await gameContract.getGames(1);
                expect(game.Player2).to.equal(addr1.address);

                // moves here
                await gameContract.makeMove(1, 0, 0);
                await gameContract.connect(addr1).makeMove(1, 2, 2);
                await gameContract.makeMove(1, 0, 1);
                await gameContract.connect(addr1).makeMove(1, 2, 1);
                await gameContract.makeMove(1, 0, 2);

                await expect(gameContract.connect(addr1).makeMove(1, 0, 0)).to.be.revertedWith('Game is already over');
            })

            it.only("Should fail since coordinate is taken", async function () {
                const count = await gameContract.getCount();
                expect(count).to.equal(0)

                await gameContract.openGame();
                count2 = await gameContract.getCount();
                expect(count2).to.equal(1)

                let game = await gameContract.getGames(1);
                expect(game.Player1).to.equal(owner.address);

                await gameContract.connect(addr1).acceptGame(1)
                game = await gameContract.getGames(1);
                expect(game.Player2).to.equal(addr1.address);

                // moves here
                await gameContract.makeMove(1, 0, 0);

                await expect(gameContract.connect(addr1).makeMove(1, 0, 0)).to.be.revertedWith('Invalid coordinates');
            })
        })
    })
});

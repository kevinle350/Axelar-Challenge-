# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```


#   Rules for tic-tac-toe:
* All state of the game should live on-chain. State includes open games, games currently in progress and completed games.
* Any user can submit a transaction to the network to invite others to start a game (i.e. create an open game).
* Other users may submit transactions to accept invitations. When an invitation is accepted, the game starts.
* The roles of “X” and “O” are decided as follows. The users' public keys are concatenated and the result is hashed. If the first bit of the output is 0, then the game's initiator (whoever posted the invitation) plays "O" and the second player plays "X" and vice versa. “X” has the first move.
* Both users submit transactions to the network to make their moves until the game is complete.
* The game needs to support multiple concurrent games sessions/players. 

#   Approach
*   Think about the state of the game: 
-   On a base level, For each game we need to keep track of two players, which letter plays next, and the state of the board
-   Also need sub states to keep track of our options on the board and who wins. We will have a Players type to be None, X, O which represents a Player and what can be put on a coordinate of the board
-   Also need a Winners type to determine who wins the current state if the game is still ongoing or finished. None means ongoing, Player1/Player2 means winner, and a Draw can occur which means no winner but the game ends
-   Need to keep track of the total number of games which is essentially represents a game Id at the time of their creation
-   Need to have a mapping to keep track of every single game relative to their Ids
*   openGame() opens up a game for another user to play
-   Need to keep track of how many players are currently in the game(max 2) so we need to add a player count to our gameState struct. When the playerCount is two that means the game starts and no other address can join the game
*   acceptGame() is how a user can join a game
-   Make sure the user chooses a game that exists already and not filled up
-   Generate the hash to check which user starts first
-   Now need to keep track of who started so add a started attribute to the GameState struct
-   Also need to keep track of who is the current player so add that attribute to GameState struct as well
*   makeMove()
-   A lot of checks to consider:
    - Game initiated
    - x, y coords in bounds
    - Contract caller has right of turn
    - Unmarked coordinates
-   After checks pass, set the coordinates to 'O' or 'X'
-   Check if there is a winner. Winner can happen by three in a row, three in a col, three diagonally
*   Calculating starter address
-   Convert the addresses to strings then using abi.encodedPacked to concacinate the two string addresses then using keccak256 hash function to turn the data into bytes32 which we check the 0th index(furthest right) to check if its 0
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

 /*
    Rules of tic-tak-toe:   (r, c)
          0  1  2       
        0 __|__|__
        1 __|__|__ 
        2   |  |
    Row Wins:                       Col Wins:                       Diagonal Wins:
    [(0, 0), (0, 1), (0, 2)],       [(0, 0), (1, 0), (2, 0)],       [(0, 0), (1, 1), (2, 2)],
    [(1, 0), (1, 1), (1, 2)],       [(0, 1), (1, 1), (2, 1)],       [(0, 2), (1, 1), (2, 0)],
    [(2, 0), (2, 1), (2, 2)],       [(0, 2), (1, 2), (2, 2)],
 */

contract Game {

    enum Players {
        None,
        Player1,
        Player2,
        X,
        O
    }

    enum Winners {
        None,
        Player1,
        Player2,
        Draw
    }

    struct GameState {
        address Player1;
        address Player2;
        Players started;
        address current;
        uint256 playerCount;
        Winners winner;
        Players next;
        Players[3][3] board;
    }

    uint256 private totGames; 
    mapping(uint256 => GameState) private gameIds; 

    // Create open game
    function openGame() public returns (uint256) {
        GameState memory game; 
        game.Player1 = msg.sender;
        game.playerCount = 1;   
        totGames += 1; 
        gameIds[totGames] = game;

        return totGames;
    }

    // Accept game invitation aka start to a game
    function acceptGame(uint256 _gameId) public returns (bool) {
        require(_gameId <= totGames, "Game is not initiated");
        GameState storage game = gameIds[_gameId];
        require(game.playerCount == 1, "Game is not initiated");

        game.Player2 = msg.sender;
        game.playerCount = 2;
        string memory publicKey1 = addressToString(game.Player1);
        string memory publicKey2 = addressToString(game.Player2);
        bytes32 resultHash = addKeys(publicKey1, publicKey2);

        if (resultHash[31] == 0) {  
            game.started = Players.Player2;    // Initialize player2 to be 'X' to start first
            game.current = game.Player2;    // address of P2
        } else {
            game.started = Players.Player1;    // Initialize player1 to be 'X' to start first
            game.current = game.Player1;    // address of P1
        }
        game.next = Players.X;    

        return true;
    }

    /*
        Conditions to check:
        - Game initiated
        - x, y coords in bounds
        - Contract caller has right of turn
        - Unmarked coordinates
    */
    function makeMove(uint256 _gameId, uint256 _x, uint256 _y) public returns (bool) {
        require(_gameId <= totGames, "Game is not initiated");
        require(_x >= 0 && _x < 3, "x coordiated is out of bounds");
        require(_y >= 0 && _y < 3, "y coordiated is out of bounds");
        GameState storage game = gameIds[_gameId];
        require(game.current == msg.sender, "Not your turn");
        require(game.winner == Winners.None, "Game is already over");
        require(game.board[_x][_y] == Players.None, "Invalid coordinates");
        
        game.board[_x][_y] = game.next; 

        Winners winner = checkWinner(game.board, game.started); 
        if (game.winner == Winners.Player1 || game.winner == Winners.Player2 || game.winner == Winners.Draw) {
            game.winner = winner;
            return true;
        } 

        if (game.next == Players.X) {
            game.next = Players.O;
        } else {
            game.next = Players.X;
        }

        return true;
    }

    function checkWinner(Players[3][3] memory _board, Players _started) private pure returns (Winners winner) {
        Players player = checkRow(_board);  // Get the 'X' or 'O' or 'None' on the board
        if (player == Players.X) {
            if (_started == Players.Player1) {
                return Winners.Player1;
            } 
            if (_started == Players.Player2) {
                return Winners.Player2;
            }
        }
        if (player == Players.O) {
            if (_started == Players.Player1) {
                return Winners.Player2;
            } 
            if (_started == Players.Player2) {
                return Winners.Player1;
            }
        } 

        player = checkCol(_board);  
        if (player == Players.X) {
            if (_started == Players.Player1) {
                return Winners.Player2;
            } 
            if (_started == Players.Player2) {
                return Winners.Player1;
            }
        }
        if (player == Players.O) {
            if (_started == Players.Player1) {
                return Winners.Player2;
            } 
            if (_started == Players.Player2) {
                return Winners.Player1;
            }
        } 

        player = checkDiagonal(_board);  
        if (player == Players.X) {
            if (_started == Players.Player1) {
                return Winners.Player2;
            } 
            if (_started == Players.Player2) {
                return Winners.Player1;
            }
        }
        if (player == Players.O) {
            if (_started == Players.Player1) {
                return Winners.Player2;
            } 
            if (_started == Players.Player2) {
                return Winners.Player1;
            }
        } 

        if (checkDraw(_board)) {
            return Winners.Draw;
        } else {
            return Winners.None;    // No winners or draws, continue
        }
    }


    /* Helper funtions */

    function addressToString(address _addr) public pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(51);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function addKeys(string memory key1, string memory key2) public pure returns (bytes32) {
        bytes32 resultHash = keccak256(     //Hash function turns data into bytes32
            abi.encodePacked(key1, key2)    //concats key1 and key2
        ); 

        return resultHash;
    }

    function checkRow(Players[3][3] memory _board) private pure returns (Players) {
        for (uint i = 0; i < 3; i++) {
            if (_board[i][0] != Players.None && _board[i][0] == _board[i][1] && _board[i][0] == _board[i][2]) {
                return _board[i][0];
            } 
        }

        return Players.None;
    }

    function checkCol(Players[3][3] memory _board) private pure returns (Players) {
        for (uint i = 0; i < 3; i++) {
            if (_board[i][0] != Players.None && _board[i][0] == _board[i][1] && _board[i][0] == _board[i][2]) {
                return _board[i][0];
            }
        }

        return Players.None;
    }

    function checkDiagonal(Players[3][3] memory _board) private pure returns (Players) {
        if (_board[0][0] != Players.None && _board[0][0] == _board[1][1] && _board[0][0] == _board[2][2]) {
            return _board[0][0];
        } else if (_board[0][2] != Players.None && _board[0][2] == _board[1][1] && _board[0][2] == _board[2][0]) {
            return _board[0][2];
        } else {
            return Players.None;
        }
    }

    function checkDraw(Players[3][3] memory _board) private pure returns (bool) {
        for (uint i = 0; i < 3; i++) {
            for (uint j = 0; j < 3; j++) {
                if (_board[i][j] == Players.None) {
                    return false;
                }
            }
        }

        return true;
    }

    /* Getter test functions */

    function getCount() external view returns(uint256) {
        return totGames;
    }

    function getGames(uint i) external view returns(GameState memory) {
        return gameIds[i];
    }

    function getStarter(uint i) external view returns(Players) {
        GameState storage game = gameIds[i];
        return game.started;
    }
    
}
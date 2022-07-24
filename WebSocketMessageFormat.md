# WebSocket Message Format
This file details the format of requests for websockets.  All messages on websockets are JSON formatted.

## Client to Server messages
All messages from the client to the server should contain an `action` attribute.  Any parameters should be included in the `params` attribute, which should be an object.  For most actions, the server will send a message back with the same message that contains an acknowledgement if the request was successful or an error if it failed.  The supported actions are listed below with their required parameters.

`action: 'create-game'`

> Creates a game on the server and adds client to the list of players.  Client can only be in one game at a time.
> 
> Required parameters:
> * `params.playerName` (String): The name to associate to this client and to share with the other players
> 
> Optional parameters:
> * `params.numDots` (Number): The number of dots to have on each card

`action: 'join-game'`

> Adds client to a game on the server with the given name
> 
> Required parameters:
> * `params.playerName` (String): The name to associate to this client and to share with the other players
> * `params.gameId` (String): 6-digit identifier for game to join

`action: 'start-game'`

> Starts game that player is in for all players
> 
> No required parameters

`action: 'submit-set'`

> Submits a move to the server.  If the set is valid, the cards will be removed from the game and more will be added.
> 
> Required parameters:
> * `params.cards` (Number[][]): List of cards. Each card is represented as a `Number[]` containing only `1`s and `0`s.  The cards must all be on the table (see below).  The cards must also be a valid set, meaning for every index *0 <= i < numDots* in the cards, the sum of the *i*th index of all the cards in `params.cards` must be even.

`action: 'start-game'`

> Leaves game that player is in.  Will also end game if no one is left.
> 
> No required parameters

## Server to Client messages
Messages from the server to the client will also contain an `action` attribute, usually corresponding to a request made by the client or another player's client.
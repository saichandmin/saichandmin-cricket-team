const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,

      driver: sqlite3.Database,
    })

    app.listen(3009, () => {
      console.log('Server Running at http://localhost:3009/')
    })
  } catch (e) {
    console.log(`Db Error:${e.message}`)

    process.exit(1)
  }
}

initialiseDBAndServer()

const ConvertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getCricketQuerry = `
 Select
 *
 From
 cricket_team`
  const cricketArray = await db.all(getCricketQuerry)
  response.send(
    cricketArray.map(eachPlayer => ConvertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
 INSERT INTO
 cricket_team(player_name,jerseyNumber,role)
 VALUES
 ('${playerName}',${jerseyNumber},'${role}')`
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuerry = `Select
  *
  From
  cricket_team
  Where
  playerId=${playerId};`
  const player = await db.get(getPlayerQuerry)
  response.send(ConvertDbObjectToResponseObject(player))
})
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuerry = `
 UPDATE
 cricket_team
 SET
 player_name='${playerName}',
 jersey_number='${jerseyNumber}',
 role='${role}'
 WHERE
 playerId=${playerId};`
  await db.run(updatePlayerQuerry)
  response.send('Player Detailed Updated')
})

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuerry = `
 DELETE FROM
 cricket_team
 WHERE
 playerId=${playerId};`
  await db.run(deletePlayerQuerry)
  response.send('Player Removed')
})

module.exports = app

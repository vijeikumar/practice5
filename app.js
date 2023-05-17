const express = require("express");
const app = express();

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");
const path = require("path");

app.use(express.json());

const dbPath = path.join(__dirname, "movieData.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3009, () => {
      console.log("Server Running http://localhost:3009/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertPascalToCamel = (dbObject) => {
  return {
    movieName: dbObject.movie_id,
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    leadActor: dbObject.leadActor,
  };
};
const convertDirectorObjectToResponse = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/movies/", async (request, response) => {
  const getMovies = `SELECT movie_name FROM movie`;
  const dbRes = await db.all(getMovies);
  response.send(dbRes.map((movieName) => convertPascalToCamel(movieName)));
});

app.post("/movies/", async (request, response) => {
  const getRequest = request.body;
  const { directorId, movieName, leadActor } = getRequest;
  const addDetails = `INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addDetails);

  console.log("Movie Successfully Added");
});

app.get("/movies/movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovies = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const dbResponse = awaitdb.get(getMovies);
  response.send(convertPascalToCamel(dbResponse));
});

app.put("/movies/movieId", async (request, response) => {
  const getTheMovies = request.body;
  const { directorId, movieName, leadActor } = getTheMovies;
  const getFromDb = `UPDATE movie SET 
    director_id=${directorId},
    movie_name='${movieName},
    lead_actor='${leadActor}'
    WHERE 
    movie_id=${movieId}`;
  await db.run(getFromDb);
  response.send("Movie Details Updated");
});

app.delete("/movies/movieId", async (request, response) => {
  const { movieId } = request.params;
  const delMovie = `DELETE FROM movie WHERE movie_id=${movieId}`;
  const dbRes = await db.run(delMovie);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirect = request.body;
  const { directorId, directorName } = getDirect;
  const getAllDirectors = `SELECT * FROM director`;
  const getTheDirectors = await db.all(getTheDirectors);
  response.send(
    getTheDirectors.map((eachObj) => convertDirectorObjectToResponse(eachObj))
  );
});

app.get("/director/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovies = `SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const getMoviesList = await db.all(getMovies);
  response.send(
    getMoviesList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;

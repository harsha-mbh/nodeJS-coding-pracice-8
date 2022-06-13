const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API1
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  let getTodosquery;
  if (status !== "") {
    getTodosquery = `
    SELECT * 
    FROM todo
    WHERE status='${status}';`;
  } else if (priority !== "") {
    getTodosquery = `
    SELECT * 
    FROM todo
    WHERE priority='${priority}';`;
  } else if (search_q !== "") {
    getTodosquery = `
    SELECT * 
    FROM todo
    WHERE todo LIKE '%${search_q}%';`;
  } else if (status !== "" && priority !== "") {
    getTodosquery = `
    SELECT * 
    FROM todo
    WHERE status='${status}' AND priority='${priority}';`;
  }

  const todosArray = await db.all(getTodosquery);
  response.send(todosArray);
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT *
    FROM todo
    WHERE id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `
INSERT INTO todo
(id, todo, priority, status)
VALUES(${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo = "", status = "", priority = "" } = request.body;
  const updateTodo = `
UPDATE todo
SET todo = '${todo}',
status = '${status}',
priority = '${priority}'
WHERE id = ${todoId};
`;
  await db.run(updateTodo);
  if (todo !== "") {
    response.send("Todo Updated");
  } else if (status !== "") {
    response.send("Status Updated");
  } else if (priority !== "") {
    response.send("Priority Updated");
  }
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
DELETE FROM todo
WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;

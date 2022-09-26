package main

import (
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type todo struct {
	ID int
	Name string `json:"Name"`
	Description string `json:"Description"`
	Status bool `json:"Status"`
}

var todos = []todo{}
var LastID int = 0;

func getTodos(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, todos)
}

func getTodoByID(c *gin.Context) {
	ID, err := strconv.Atoi(c.Param("ID"))

	if err != nil {
		return
	}

	for _, a := range todos {
			if a.ID == ID {
			c.IndentedJSON(http.StatusOK, a)
			return
		}
	}

	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "Todo not found"})
}

func addTodo(c *gin.Context) {
	var newTodo todo;

	if err := (c.BindJSON(&newTodo)); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error in creating todo": err.Error()})
    	return
    }
	
	newTodo.ID = LastID
	todos = append(todos, newTodo);
	LastID++

	c.IndentedJSON(http.StatusOK, newTodo)
}

func main() {
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}

	router.Use(cors.New(config))
	router.GET("/todos", getTodos)
	router.GET("/todos:ID", getTodoByID)
	router.POST("/todos", addTodo)

	router.Run("localhost:8080")
}

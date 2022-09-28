package main

import (
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Todo struct {	
	ID uint `gorm:"primaryKey" json:"ID" binding:"required"`
	Name string `gorm:"notNull" json:"Name" binding:"required"`
	Description string `json:"Description"`
	Status bool `json:"Status"`
}

type AddTodoRequest struct {	
	Name string `json:"name"`
	Description string `json:"description"`
	Status bool `json:"status"`
}

var user string
var password string
var dbName string
var host string
var port string
var ssl string
var dbConn *gorm.DB

func getTodos(c *gin.Context) {
	db, err := getDatabaseConnection()
	if err != nil {
		print(err)
	}

	//todos = append(todos, newTodo);
	var todos []Todo
	result := db.Find(&todos)

	if result.Error != nil {
		print(result.Error)
		return
	}

	c.IndentedJSON(http.StatusOK, todos)
}

func getTodoByID(c *gin.Context) {
	var todoId uint

	if err := c.ShouldBindUri(&todoId); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"message": err.Error(),
		})
		return
	}
	
	db, err := getDatabaseConnection()
	if err != nil {
		print(err)
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"message": "Service is unavailable",
		})
		return
	}

	var todo Todo
	result := db.First(&todo, "ID = ?", todoId)
	if result.Error != nil {
		print(result.Error)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Record not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Error occurred while fetching user",
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"result": todo,
	})
}

func addTodo(c *gin.Context) {	
	var newTodo AddTodoRequest;

	if err := (c.BindJSON(&newTodo)); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error in creating todo": err.Error()})
    	return
    }

	db, err := getDatabaseConnection()
	if err != nil {
		print(err)
	}

	//todos = append(todos, newTodo);
	var todo Todo;
	todo.Name = newTodo.Name;
	todo.Description = newTodo.Description;
	todo.Status = newTodo.Status;
	result := db.Create(&todo)

	if result.Error != nil && result.RowsAffected != 1 {
		print(result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error occurred while creating a new todo",
		})
		return
	}

	c.IndentedJSON(http.StatusOK, todo)
}

func getDsn() string {
	return fmt.Sprintf("host=%s user=%s dbname=%s port=%s sslmode=%s", host, user, dbName, port, ssl)
}

func createDBConnection() error {
	db, err := gorm.Open(postgres.New(postgres.Config{
			DSN: 	getDsn(),
			PreferSimpleProtocol: true,
		}), &gorm.Config{})
	
	if err != nil {
		panic(err)
	}

	//sqlDB, err := db.DB()
	dbConn = db

	return err
}


func getDatabaseConnection() (*gorm.DB, error) {
	sqlDB, err := dbConn.DB()
	if err != nil {
		return dbConn, err
	}
	if err := sqlDB.Ping(); err != nil {
		return dbConn, err
	}
	return dbConn, nil
}
  
func autoMigrateDB() error {
	// Auto migrate database
	db, connErr := getDatabaseConnection()
	if connErr != nil {
		return connErr
	}

	err := db.AutoMigrate(Todo{})
 
	return err
}

func init() {
	err := godotenv.Load(".env")

	if err != nil {
	  log.Fatalf("Error loading .env file")
	}

	user = os.Getenv("DB_USER")
	password = os.Getenv("DB_PASSWORD")
	dbName = os.Getenv("DB_NAME")
	host = os.Getenv("DB_HOST")
	port = os.Getenv("DB_PORT")
	ssl = os.Getenv("DB_SSL")
}

func main() {
	//	Connect to database
	err := createDBConnection()
	if err != nil {
		panic(err)
	}
	
	fmt.Println("Successfully connected to database!")

	err = autoMigrateDB()
	if err != nil {
		panic(err)
	}

	//	Routing with gin
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}

	router.Use(cors.New(config))
	router.GET("/todos", getTodos)
	router.GET("/todos/:ID", getTodoByID)
	router.POST("/todos", addTodo)

	router.Run("localhost:8080")
}

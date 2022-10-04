package main

import (
	"todo-list-api/todo"
	"todo-list-api/user"
	"todo-list-api/utils"

	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var dbuser string
var password string
var dbName string
var host string
var port string
var ssl string
var dbConn *gorm.DB
  
func init() {
	err := godotenv.Load(".env")

	if err != nil {
	  log.Fatalf("Error loading .env file")
	}

	dbuser = os.Getenv("DB_USER")
	password = os.Getenv("DB_PASSWORD")
	dbName = os.Getenv("DB_NAME")
	host = os.Getenv("DB_HOST")
	port = os.Getenv("DB_PORT")
	ssl = os.Getenv("DB_SSL")
}

func createDBConnection() error {
	db, err := gorm.Open(postgres.New(postgres.Config{
			DSN: 	utils.GetDsn(host, dbuser, dbName, port, ssl),
			PreferSimpleProtocol: true,
		}), &gorm.Config{})

	if err != nil {
		panic(err)
	}

	dbConn = db

	return err
}

func main() {
	//	Connect to database
	err := createDBConnection()
	if err != nil {
		panic(err)
	}
	
	fmt.Println("Successfully connected to database!")

	//	Routing with gin
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}

	todo.Init(dbConn, router)
	user.Init(dbConn, router)

	router.Use(cors.New(config))
	router.Run("localhost:8080")
}

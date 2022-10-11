package api

import (
	"api/todo"
	"api/user"
	"api/utils"

	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/joho/godotenv"

	"github.com/gin-gonic/gin"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var dbuser string
var password string
var dbName string
var host string
var port string
var dbConn *gorm.DB
var router *gin.Engine

func init() {
	err := godotenv.Load(".env")

	if err != nil {
	  log.Printf("Error loading .env file - Production build found")
	}

	dbuser = os.Getenv("DB_USER")
	password = os.Getenv("DB_PASSWORD")
	dbName = os.Getenv("DB_NAME")
	host = os.Getenv("DB_HOST")
	port = os.Getenv("DB_PORT")

	log.Printf("Gin cold start")
	router = gin.Default()
	router.Use(cors.Default())

	//	Connect to database
	errConn := createDBConnection()
	if errConn != nil {
		panic(errConn) 
	}
	
	fmt.Println("Successfully connected to database!")

	todo.Init(dbConn, router)
	user.Init(dbConn, router)

	
	//router.Run("localhost:8080")
}

func createDBConnection() error {
	db, err := gorm.Open(postgres.New(postgres.Config{
			DSN: 	utils.GetDsn(host, dbuser, password, dbName, port),
			PreferSimpleProtocol: true,
		}), &gorm.Config{})

	if err != nil {
		panic(err)
	}

	dbConn = db

	return err
}

// Entrypoint
func Handler(w http.ResponseWriter, r *http.Request) {
	router.ServeHTTP(w, r)
}

func Ping(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ping": "pong"})
}
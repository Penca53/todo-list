package main

import (
	"context"
	"todo-list-api/todo"
	"todo-list-api/user"
	"todo-list-api/utils"

	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
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
var dbConn *gorm.DB
var ginLambda *ginadapter.GinLambda
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

	// stdout and stderr are sent to AWS CloudWatch Logs
	log.Printf("Gin cold start")
	router = gin.Default()
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	
	ginLambda = ginadapter.New(router)
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

func Handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// If no name is provided in the HTTP request body, throw an error
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	//	Connect to database
	err := createDBConnection()
	if err != nil {
		panic(err) 
	}
	
	fmt.Println("Successfully connected to database!")

	//	Routing with gin
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"*"}

	todo.Init(dbConn, router)
	user.Init(dbConn, router)

	router.Use(cors.New(config))
	//router.Run("localhost:8080")

	lambda.Start(Handler)
}


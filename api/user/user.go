package user

import (
	"api/todo"
	"api/utils"

	"errors"
	"strconv"

	"net/http"

	"github.com/gin-gonic/gin"

	"gorm.io/gorm"
)

var dbConn *gorm.DB

type User struct {	
	gorm.Model
	Name string `gorm:"notNull" json:"name" binding:"required"`
	Email string `gorm:"notNull" json:"email" binding:"required"`
	Password string `gorm:"notNull" json:"password" binding:"required"`
	Todos []todo.Todo 
}

type SignUpRequest struct {	
	Name string `gorm:"notNull" json:"name" binding:"required"`
	Email string `gorm:"notNull" json:"email" binding:"required"`
	Password string `gorm:"notNull" json:"password" binding:"required"`
}

func Init(gormdb *gorm.DB, router *gin.Engine) {
    dbConn = gormdb

    dbConn.AutoMigrate(&User{})

    router.GET("/users", getUsers)
	router.POST("/users", createUser)
	router.GET("/users/:ID", getUserTodos)
}

func getUsers(c *gin.Context) {
	db, err := utils.GetDatabaseConnection(dbConn)
	if err != nil {
		print(err)
	}

	var users []User
	result := db.Find(&users)

	if result.Error != nil {
		print(result.Error)
		return
	}

	c.IndentedJSON(http.StatusOK, users)
}

func createUser(c *gin.Context) {	
	var newUser SignUpRequest;

	if err := (c.BindJSON(&newUser)); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error in binding newTodo": err.Error()})
    	return
    }

	db, err := utils.GetDatabaseConnection(dbConn)
	if err != nil {
		print(err)
	}

	var user User;
	user.Name = newUser.Name;
	user.Email = newUser.Email;
	user.Password = newUser.Password;
	result := db.Create(&user)

	if result.Error != nil && result.RowsAffected != 1 {
		print(result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error occurred while creating a new todo",
		})
		return
	}

	c.IndentedJSON(http.StatusOK, user)
}

func getUserTodos(c *gin.Context) {
	urlId := c.Param("ID")
	userId, _ := strconv.Atoi(urlId)

	db, err := utils.GetDatabaseConnection(dbConn)
	if err != nil {
		print(err)
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"message": "Service is unavailable",
		})
		return
	}

	var user User
	result := db.First(&user, "ID = ?", userId)
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

	var todos []todo.Todo
	error := dbConn.Model(&user).Association("Todos").Find(&todos)
	if error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error occurred while finding associations",
		})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{
		"result": todos,
	})
}
package todo

import (
	"todo-list-api/utils"

	"errors"
	"strconv"

	"net/http"

	"github.com/gin-gonic/gin"

	"gorm.io/gorm"
)

var dbConn *gorm.DB

type Todo struct {	
	gorm.Model
	Name string `gorm:"notNull" binding:"required"`
	Description string
	Status bool
	UserID uint
}

type AddTodoRequest struct {	
	Name string 
	Description string 
	Status bool 
	UserID uint 
}

type UpdateTodoStatusRequest struct {
	Status bool `json:"status"`
}

func Init(gormdb *gorm.DB, router *gin.Engine) {
    dbConn = gormdb // set package global

    dbConn.AutoMigrate(&Todo{})

    router.GET("/todos", getTodos)
	router.GET("/todos/:ID", getTodoByID)
	router.POST("/todos", addTodo)
	router.PATCH("/todos/:ID", updateTodoStatus)
	router.DELETE("/todos/:ID", deleteTodo)
}

func getTodos(c *gin.Context) {
	db, err := utils.GetDatabaseConnection(dbConn)
	if err != nil {
		print(err)
	}

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
	
	db, err := utils.GetDatabaseConnection(dbConn)
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
        c.JSON(http.StatusBadRequest, gin.H{"error in binding newTodo": err.Error()})
    	return
    }

	db, err := utils.GetDatabaseConnection(dbConn)
	if err != nil {
		print(err)
	}

	var todo Todo;
	todo.Name = newTodo.Name;
	todo.Description = newTodo.Description;
	todo.Status = newTodo.Status;
	todo.UserID = newTodo.UserID;
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

func updateTodoStatus(c *gin.Context) {
	var newStatus UpdateTodoStatusRequest

	if err := (c.BindJSON(&newStatus)); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error in binding todo status": err.Error()})
    	return
    }

	urlId := c.Param("ID")
	id, _ := strconv.Atoi(urlId)

	db, conErr := utils.GetDatabaseConnection(dbConn)
	if conErr != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"message": "Service is unavailable",
		})
		return
	}

	var value Todo
	result := db.First(&value, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Record not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Error occurred while updating todo",
			})
		}
		return
	}

	value.Status = newStatus.Status

	tx := db.Save(value)
	if tx.RowsAffected != 1 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error occurred while updating user",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Todo status updated successfully",
		"result":  value,
	})
}

func deleteTodo(c *gin.Context) {
	urlId := c.Param("ID")
	id, _ := strconv.Atoi(urlId)

	db, conErr := utils.GetDatabaseConnection(dbConn)
	if conErr != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"message": "Service is unavailable",
		})
		return
	}

	var value Todo
	result := db.First(&value, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Record not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Error occurred while updating todo",
			})
		}
		return
	}

	tx := db.Delete(value)
	if tx.RowsAffected != 1 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error occurred while deleting todo",
		})
		return
	}

	c.JSON(http.StatusNoContent, gin.H{})
}

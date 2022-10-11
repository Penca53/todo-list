package utils

import (
	"fmt"

	"gorm.io/gorm"
)

func GetDsn(host string, user string, password string, dbName string ,port string) string {
	return fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s", host, user, password, dbName, port)
}

func GetDatabaseConnection(dbConn *gorm.DB) (*gorm.DB, error) {
	sqlDB, err := dbConn.DB()
	if err != nil {
		return dbConn, err
	}
	if err := sqlDB.Ping(); err != nil {
		return dbConn, err
	}
	return dbConn, nil
}
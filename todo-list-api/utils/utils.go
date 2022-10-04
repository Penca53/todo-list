package utils

import (
	"fmt"

	"gorm.io/gorm"
)

func GetDsn(host string, user string ,dbName string ,port string,ssl string) string {
	return fmt.Sprintf("host=%s user=%s dbname=%s port=%s sslmode=%s", host, user, dbName, port, ssl)
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
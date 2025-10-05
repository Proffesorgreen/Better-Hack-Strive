package router

import (
	"better-form-doc-backend/controller"
	_ "better-form-doc-backend/docs"
	"better-form-doc-backend/infrastructure"
	"net/http"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRouter initializes and configures all the application routes
func SetupRouter(chatController controller.ChatController) *gin.Engine {
	router := gin.Default()

	// --- Public Routes ---
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// --- Protected Routes ---
	api := router.Group("/api")
	api.Use(infrastructure.AuthMiddleware()) // Apply auth middleware to this group
	{
		// Add the new chat endpoint
		api.POST("/chat", chatController.GenerateChatResponse)
	}

	return router
}

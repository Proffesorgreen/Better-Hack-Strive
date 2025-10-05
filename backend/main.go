// main.go
package main

import (
	"better-form-doc-backend/controller"
	"better-form-doc-backend/infrastructure"
	"better-form-doc-backend/router"
	"better-form-doc-backend/usecase"
	"log"
	"os"

	"github.com/joho/godotenv"
)

// @title           Go Stateless Chat API
// @version         1.0
// @description     A secure, stateless API to interact with Google's Gemini AI.
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description "Type 'Bearer' followed by a space and a JWT."
func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Load config from environment
	geminiAPIKey := os.Getenv("GEMINI_API_KEY")
	if geminiAPIKey == "" {
		log.Fatal("GEMINI_API_KEY is not set")
	}
	geminiModelName := os.Getenv("GEMINI_MODEL_NAME")
	if geminiModelName == "" {
		geminiModelName = "gemini-2.5-flash"
	}

	// Instantiate our infrastructure components
	geminiClient := infrastructure.NewGeminiClient(geminiAPIKey, geminiModelName)
	chatUsecase := usecase.NewChatUseCase(geminiClient)
	chatController := controller.NewChatController(chatUsecase)
	router := router.SetupRouter(*chatController)

	// Start the server
	port := "8080"
	log.Printf("🚀 Server starting on http://localhost:%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

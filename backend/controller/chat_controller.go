package controller

import (
	"better-form-doc-backend/usecase"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ChatController will hold the dependencies for the chat handlers
type ChatController struct {
	chatUseCase usecase.ChatUseCaseInterface
}

// NewChatController creates a new instance of ChatController
func NewChatController(chatUseCase usecase.ChatUseCaseInterface) *ChatController {
	return &ChatController{
		chatUseCase: chatUseCase,
	}
}

// ChatRequest defines the structure of the incoming JSON request
type ChatRequest struct {
	Prompt string `json:"prompt" binding:"required"`
}

// GenerateChatResponse godoc
// @Summary      Generate a chat response from the AI
// @Description  Accepts a user prompt and returns a JSON response from the Gemini AI model.
// @Tags         chat
// @Accept       json
// @Produce      json
// @Param        prompt  body      ChatRequest  true  "User's prompt for the AI"
// @Success      200     {object}  map[string]interface{}
// @Failure      400 {string}  "Invalid request"
// @Failure      401 {string}  "Unauthorized"
// @Failure      500 {string}  "Server error"
// @Security     BearerAuth
// @Router       /chat [post]
func (cc *ChatController) GenerateChatResponse(c *gin.Context) {
	var request ChatRequest

	// Bind the incoming JSON to the ChatRequest struct.
	// If the "prompt" field is missing or not a string, it will return an error.
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Call the use case layer with the user's prompt
	response, err := cc.chatUseCase.GenerateChatResponse(request.Prompt)
	if err != nil {
		// If the use case returns an error (e.g., Gemini API is down), send a 500 error.
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate AI response", "details": err.Error()})
		return
	}

	// Send the successful response from the use case back to the client.
	c.JSON(http.StatusOK, response)
}

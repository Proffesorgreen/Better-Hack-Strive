// usecase/chat_usecase.go
package usecase

import "fmt"

// GeminiClientInterface defines the contract for our AI client.
// This allows us to swap the implementation (e.g., for testing) without changing the use case.
type GeminiClientInterface interface {
	GenerateContent(prompt string) (map[string]interface{}, error)
}

// ChatUseCaseInterface defines the contract for our chat use case.
type ChatUseCaseInterface interface {
	GenerateChatResponse(prompt string) (map[string]interface{}, error)
}

// ChatUseCase is the implementation of our chat use case.
type ChatUseCase struct {
	geminiClient GeminiClientInterface
}

// NewChatUseCase creates a new instance of ChatUseCase.
func NewChatUseCase(geminiClient GeminiClientInterface) ChatUseCaseInterface {
	return &ChatUseCase{
		geminiClient: geminiClient,
	}
}

// GenerateChatResponse contains the core logic for the chat feature.
func (uc *ChatUseCase) GenerateChatResponse(prompt string) (map[string]interface{}, error) {
	// --- Business Logic ---
	// Here is the placeholder logic you requested.
	// We modify the user's prompt to instruct the AI to respond in JSON format.
	enhancedPrompt := fmt.Sprintf(`
		Based on the following user request, please provide a response in JSON format.
		The JSON object should contain relevant information based on the user's query.

		User Request: "%s"

		JSON Response:
	`, prompt)

	// Call the infrastructure layer (Gemini client) to get the AI response.
	response, err := uc.geminiClient.GenerateContent(enhancedPrompt)
	if err != nil {
		// Pass the error up the chain
		return nil, err
	}

	return response, nil
}

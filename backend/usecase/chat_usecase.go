// usecase/chat_usecase.go
package usecase

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

// GeminiClientInterface remains the same.
type GeminiClientInterface interface {
	GenerateContent(prompt string) (map[string]interface{}, error)
}

// ChatUseCaseInterface defines the contract for our form generation use case.
type ChatUseCaseInterface interface {
	GenerateChatResponse(userPrompt string) (map[string]interface{}, error)
}

// FormGeneratorUseCase is the new implementation.
type FormGeneratorUseCase struct {
	geminiClient GeminiClientInterface
}

// NewChatUseCase creates a new instance of FormGeneratorUseCase.
func NewChatUseCase(geminiClient GeminiClientInterface) ChatUseCaseInterface {
	return &FormGeneratorUseCase{
		geminiClient: geminiClient,
	}
}

// GenerateChatResponse contains the core logic for the form generation feature.
func (uc *FormGeneratorUseCase) GenerateChatResponse(userPrompt string) (map[string]interface{}, error) {
	// 1. Construct the full, detailed prompt using the template.
	fullPrompt := fmt.Sprintf(formGenerationPrompt, userPrompt)

	// 2. Call the infrastructure layer (Gemini client) to get the AI response.
	rawResponse, err := uc.geminiClient.GenerateContent(fullPrompt)
	if err != nil {
		return nil, fmt.Errorf("error from Gemini client: %w", err)
	}

	parsedJSON, err := extractAndParseJSON(rawResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to process AI response: %w", err)
	}

	// --- VALIDATION LOGIC STARTS HERE ---

	// 1. Check if the AI returned our specific error object
	if errVal, ok := parsedJSON["error"]; ok {
		if errType, isString := errVal.(string); isString && errType == "IrrelevantPrompt" {
			// The AI has correctly identified an irrelevant prompt.
			// We can return a specific, user-friendly error from our API.
			return nil, errors.New("irrelevant prompt: please describe the form you want to build")
		}
	}

	// 2. Check for the essential fields of a valid FormConfig
	// A valid form config MUST have 'fields' and 'submit'.
	if _, hasFields := parsedJSON["fields"]; !hasFields {
		return nil, errors.New("invalid form config: missing 'fields' property")
	}
	if _, hasSubmit := parsedJSON["submit"]; !hasSubmit {
		return nil, errors.New("invalid form config: missing 'submit' property")
	}

	// --- VALIDATION LOGIC ENDS HERE ---

	// If we passed the checks, it's likely a valid FormConfig
	return parsedJSON, nil
}

// extractAndParseJSON is a helper function to robustly find and parse the JSON
// from the AI's potentially messy output.
func extractAndParseJSON(rawResponse map[string]interface{}) (map[string]interface{}, error) {
	// This logic depends heavily on the actual response structure from your GeminiClient.
	// Let's assume the client might return something like:
	// { "candidates": [ { "content": { "parts": [ { "text": "```json\n{...}\n```" } ] } } ] }
	// We need to navigate this structure to get to the "text".

	text, ok := findNestedString(rawResponse, "text")
	if !ok || text == "" {
		return nil, errors.New("no text content found in AI response")
	}

	// The AI might wrap the JSON in markdown code blocks (```json ... ```). Let's strip them.
	// Trim whitespace
	cleanedText := strings.TrimSpace(text)
	// Trim ```json prefix
	cleanedText = strings.TrimPrefix(cleanedText, "```json")
	// Trim ``` suffix
	cleanedText = strings.TrimSuffix(cleanedText, "```")
	// Trim any remaining whitespace
	cleanedText = strings.TrimSpace(cleanedText)

	var formConfig map[string]interface{}
	err := json.Unmarshal([]byte(cleanedText), &formConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JSON from AI output: %w. Raw text: %s", err, cleanedText)
	}

	return formConfig, nil
}

// findNestedString is a utility to search for a key in a nested map.
func findNestedString(data map[string]interface{}, key string) (string, bool) {
	if val, ok := data[key]; ok {
		if strVal, ok := val.(string); ok {
			return strVal, true
		}
	}
	for _, v := range data {
		if nestedMap, ok := v.(map[string]interface{}); ok {
			if strVal, found := findNestedString(nestedMap, key); found {
				return strVal, true
			}
		}
		if nestedSlice, ok := v.([]interface{}); ok {
			for _, item := range nestedSlice {
				if itemMap, ok := item.(map[string]interface{}); ok {
					if strVal, found := findNestedString(itemMap, key); found {
						return strVal, true
					}
				}
			}
		}
	}
	return "", false
}

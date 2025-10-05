package infrastructure

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// GeminiClient is a client for interacting with the Google Gemini API.
type GeminiClient struct {
	httpClient *http.Client
	apiKey     string
	modelName  string // e.g., "gemini-pro"
}

// NewGeminiClient creates a new instance of the GeminiClient.
func NewGeminiClient(apiKey, modelName string) *GeminiClient {
	return &GeminiClient{
		httpClient: &http.Client{
			Timeout: 30 * time.Second, // Set a reasonable timeout
		},
		apiKey:    apiKey,
		modelName: modelName,
	}
}

// --- Gemini API Request/Response Structures ---

// geminiRequest represents the JSON payload sent to the Gemini API.
type geminiRequest struct {
	Contents []*geminiContent `json:"contents"`
}

type geminiContent struct {
	Parts []*geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

// geminiResponse is the structure of the JSON response from the Gemini API.
// We only care about the text content for now, so we'll simplify it.
type geminiResponse struct {
	Candidates []*geminiCandidate `json:"candidates"`
}

type geminiCandidate struct {
	Content *geminiContent `json:"content"`
}

// GenerateContent sends a prompt to the Gemini API and returns the response.
func (gc *GeminiClient) GenerateContent(prompt string) (map[string]interface{}, error) {
	// Construct the API URL
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", gc.modelName, gc.apiKey)

	// Prepare the request body according to the Gemini API spec
	reqBody := geminiRequest{
		Contents: []*geminiContent{
			{
				Parts: []*geminiPart{
					{Text: prompt},
				},
			},
		},
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	// Create the HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	resp, err := gc.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request to Gemini API: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check for non-200 status codes
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Gemini API returned an error: %s - %s", resp.Status, string(respBody))
	}

	// Unmarshal the successful response into a generic map
	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("failed to unmarshal Gemini response: %w", err)
	}

	return result, nil
}

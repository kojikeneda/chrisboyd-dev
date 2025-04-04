package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"

	"chrisboyd.dev/telemetry/collector"
	"github.com/joho/godotenv"
	"go.opentelemetry.io/otel/attribute"
)

// EventData represents the telemetry data from client
type EventData struct {
	EventType  string            `json:"eventType"`
	EventName  string            `json:"eventName"`
	Timestamp  string            `json:"timestamp"`
	Properties map[string]string `json:"properties"`
}

func main() {
	// Load environment variables from .env file at project root
	loadEnvFile()

	// Initialize OpenTelemetry
	shutdown, err := collector.InitProvider()
	if err != nil {
		log.Fatalf("Failed to initialize OpenTelemetry: %v", err)
	}
	defer shutdown()

	// Get tracer
	tracer := collector.GetTracer()

	// Configure HTTP server with CORS support
	http.HandleFunc("/collect", func(w http.ResponseWriter, r *http.Request) {
		// Enable CORS
		enableCors(&w, r)

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Only accept POST requests
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Parse JSON payload
		var events []EventData
		if err := json.NewDecoder(r.Body).Decode(&events); err != nil {
			log.Printf("Error parsing request body: %v", err)
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Process each event concurrently
		var wg sync.WaitGroup
		for _, event := range events {
			wg.Add(1)
			go func(e EventData) {
				defer wg.Done()

				// Create context and span for this event
				_, span := tracer.Start(r.Context(), fmt.Sprintf("process_%s", e.EventType))

				// Add event attributes to span
				for key, value := range e.Properties {
					span.SetAttributes(attribute.String(key, value))
				}

				// Log the event for debugging
				log.Printf("Received telemetry event: %s/%s with %d properties",
					e.EventType, e.EventName, len(e.Properties))

				// End the span after processing
				span.End()
			}(event)
		}

		// Wait for all events to be processed
		wg.Wait()

		// Return success response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "success",
			"message": fmt.Sprintf("Processed %d events", len(events)),
		})
	})

	// Determine port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start HTTP server
	log.Printf("Telemetry service running on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

// Helper function to enable CORS
func enableCors(w *http.ResponseWriter, r *http.Request) {
	// Get the origin header
	origin := r.Header.Get("Origin")
	if origin == "" {
		// If no origin header is present, use a safe default
		origin = "http://localhost:1313"
	}

	// Set CORS headers with specific origin instead of wildcard
	(*w).Header().Set("Access-Control-Allow-Origin", origin)
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	(*w).Header().Set("Access-Control-Allow-Credentials", "true")
}

// loadEnvFile loads environment variables from .env file
func loadEnvFile() {
	// First try current directory
	err := godotenv.Load()
	if err != nil {
		// If that fails, try going up one level (project root)
		cwd, _ := os.Getwd()
		parentDir := filepath.Dir(cwd)
		envFile := filepath.Join(parentDir, ".env")

		err = godotenv.Load(envFile)
		if err != nil {
			log.Printf("Warning: Could not load .env file, using system environment variables: %v", err)
		} else {
			log.Println("Loaded environment variables from parent directory:", envFile)
		}
	} else {
		log.Println("Loaded environment variables from current directory")
	}

	// Print key environment variables for debugging (without values)
	envVars := []string{"DASH0_API_KEY", "DASH0_DATASET", "OTEL_SERVICE_NAME", "OTEL_EXPORTER_OTLP_ENDPOINT"}
	presentVars := make([]string, 0)

	for _, v := range envVars {
		if os.Getenv(v) != "" {
			presentVars = append(presentVars, v)
		}
	}

	log.Printf("Environment variables present: %v", presentVars)
}

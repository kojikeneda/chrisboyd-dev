package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"chrisboyd.dev/telemetry/collector"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

// EventData represents telemetry data from the client
type EventData struct {
	Name       string            `json:"name"`
	URL        string            `json:"url"`
	UserAgent  string            `json:"userAgent"`
	Referrer   string            `json:"referrer"`
	Attributes map[string]string `json:"attributes,omitempty"`
}

func main() {
	// Initialize OpenTelemetry
	shutdown, err := collector.InitProvider()
	if err != nil {
		log.Fatalf("Failed to initialize OpenTelemetry: %v", err)
	}
	defer shutdown()

	// Get tracer
	tracer := collector.GetTracer()

	// Create a more robust CORS-enabled HTTP server
	mux := http.NewServeMux()

	// Add the collect endpoint with CORS support
	mux.HandleFunc("/collect", func(w http.ResponseWriter, r *http.Request) {
		// Handle preflight OPTIONS request
		if r.Method == "OPTIONS" {
			enableCors(&w, r)
			w.WriteHeader(http.StatusOK)
			return
		}

		// Enable CORS for the actual request
		enableCors(&w, r)

		if r.Method != "POST" {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		var eventData EventData
		if err := json.NewDecoder(r.Body).Decode(&eventData); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Log the received data for debugging
		fmt.Printf("Received telemetry event: %s from %s\n", eventData.Name, eventData.URL)

		// Create a context with timeout
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Start a span for this telemetry event
		ctx, span := tracer.Start(
			ctx,
			eventData.Name,
			trace.WithAttributes(
				attribute.String("url", eventData.URL),
				attribute.String("userAgent", eventData.UserAgent),
				attribute.String("referrer", eventData.Referrer),
			),
		)

		// Add custom attributes to span
		for k, v := range eventData.Attributes {
			span.SetAttributes(attribute.String(k, v))
		}

		// End the span
		span.End()

		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ok"}`)
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	// Handle graceful shutdown
	go func() {
		signals := make(chan os.Signal, 1)
		signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM)
		<-signals

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("HTTP server shutdown error: %v", err)
		}
	}()

	log.Printf("Telemetry service running on port %s", port)
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("HTTP server error: %v", err)
	}
}

// enableCors sets CORS headers for the response
func enableCors(w *http.ResponseWriter, r *http.Request) {
	// Get the Origin header
	origin := r.Header.Get("Origin")
	if origin == "" {
		// If no Origin header, allow all origins
		origin = "*"
	}

	// Set CORS headers
	(*w).Header().Set("Access-Control-Allow-Origin", origin)
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")

	// Allow all requested headers instead of being specific
	// This follows the advice from the GitHub issue
	requestedHeaders := r.Header.Get("Access-Control-Request-Headers")
	if requestedHeaders != "" {
		(*w).Header().Set("Access-Control-Allow-Headers", requestedHeaders)
	} else {
		// Default set of headers if none requested
		(*w).Header().Set("Access-Control-Allow-Headers",
			"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	}

	(*w).Header().Set("Access-Control-Allow-Credentials", "true")
	(*w).Header().Set("Access-Control-Max-Age", "7200") // Cache preflight for 2 hours (same as in the GitHub issue)
}

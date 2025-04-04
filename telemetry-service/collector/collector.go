package collector

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc/credentials"
)

var tracer trace.Tracer

// InitProvider initializes OpenTelemetry with Dash0 exporter
func InitProvider() (func(), error) {
	// Get environment variables
	dash0Endpoint := getEnv("OTEL_EXPORTER_OTLP_ENDPOINT", "https://ingress.us-west-2.aws.dash0.com:4317")
	dash0Headers := getEnv("OTEL_EXPORTER_OTLP_HEADERS", "")
	serviceName := getEnv("OTEL_SERVICE_NAME", "chrisboyd-blog")

	// Create exporter
	secureOption := otlptracegrpc.WithTLSCredentials(credentials.NewClientTLSFromCert(nil, ""))

	// Create OTLP exporter client
	client := otlptracegrpc.NewClient(
		otlptracegrpc.WithEndpoint(dash0Endpoint),
		secureOption,
	)

	// If headers are provided, add them
	if dash0Headers != "" {
		client = otlptracegrpc.NewClient(
			otlptracegrpc.WithEndpoint(dash0Endpoint),
			secureOption,
			otlptracegrpc.WithHeaders(parseHeaders(dash0Headers)),
		)
	}

	exporter, err := otlptrace.New(context.Background(), client)
	if err != nil {
		return nil, fmt.Errorf("failed to create exporter: %w", err)
	}

	// Create resource with service information
	res, err := resource.New(
		context.Background(),
		resource.WithAttributes(
			semconv.ServiceNameKey.String(serviceName),
			semconv.ServiceVersionKey.String("1.0.0"),
		),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	// Create trace provider with the exporter
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(res),
	)

	// Set global trace provider
	otel.SetTracerProvider(tp)

	// Create tracer
	tracer = tp.Tracer("chrisboyd.dev/telemetry")

	// Return a function that will shutdown the exporter
	return func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := tp.Shutdown(ctx); err != nil {
			fmt.Printf("Error shutting down tracer provider: %v\n", err)
		}
	}, nil
}

// GetTracer returns the global tracer
func GetTracer() trace.Tracer {
	return tracer
}

// Helper function to get environment variables with fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// Parse headers from the OTEL_EXPORTER_OTLP_HEADERS format
// e.g. "Authorization=Bearer token,Dash0-Dataset=default"
func parseHeaders(headersStr string) map[string]string {
	headers := make(map[string]string)

	// Simple parsing for header format "key1=value1,key2=value2"
	currentKey := ""
	currentValue := ""
	isKey := true

	for _, char := range headersStr {
		switch char {
		case '=':
			isKey = false
		case ',':
			if currentKey != "" {
				headers[currentKey] = currentValue
			}
			currentKey = ""
			currentValue = ""
			isKey = true
		default:
			if isKey {
				currentKey += string(char)
			} else {
				currentValue += string(char)
			}
		}
	}

	// Add the last key-value pair
	if currentKey != "" {
		headers[currentKey] = currentValue
	}

	return headers
}

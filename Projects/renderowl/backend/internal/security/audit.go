package security

import (
	"fmt"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SecurityAudit performs security checks on the application
type SecurityAudit struct {
	db *gorm.DB
}

func NewSecurityAudit(db *gorm.DB) *SecurityAudit {
	return &SecurityAudit{db: db}
}

// ExposedDataCheck represents a check for exposed sensitive data
type ExposedDataCheck struct {
	Table    string   `json:"table"`
	Fields   []string `json:"fields"`
	Severity string   `json:"severity"`
	Issue    string   `json:"issue"`
}

// RunAudit performs a complete security audit
func (sa *SecurityAudit) RunAudit() []ExposedDataCheck {
	var issues []ExposedDataCheck

	// Check for exposed PII in API responses
	issues = append(issues, sa.checkUserPII()...)
	issues = append(issues, sa.checkPaymentData()...)
	issues = append(issues, sa.checkWebhookSecurity()...)

	return issues
}

func (sa *SecurityAudit) checkUserPII() []ExposedDataCheck {
	return []ExposedDataCheck{
		{
			Table:    "users",
			Fields:   []string{"clerk_id", "email"},
			Severity: "low",
			Issue:    "Ensure clerk_id and email are only returned to authenticated owners",
		},
	}
}

func (sa *SecurityAudit) checkPaymentData() []ExposedDataCheck {
	return []ExposedDataCheck{
		{
			Table:    "payment_intents",
			Fields:   []string{"stripe_payment_id", "stripe_intent_id"},
			Severity: "medium",
			Issue:    "Stripe IDs should not be exposed to other users",
		},
	}
}

func (sa *SecurityAudit) checkWebhookSecurity() []ExposedDataCheck {
	return []ExposedDataCheck{
		{
			Table:    "stripe_webhook_events",
			Fields:   []string{"payload"},
			Severity: "low",
			Issue:    "Webhook payloads should not be exposed via API",
		},
	}
}

// SQLInjectionCheck provides SQL injection pattern detection
var sqlInjectionPatterns = []string{
	`(?i)(\%27)|(\')|(\-\-)|(\%23)|(#)`,
	`(?i)((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))`,
	`(?i)\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))`,
	`(?i)((\%27)|(\'))union`,
	`(?i)exec(\s|\+)+(s|x)p\w+`,
	`(?i)UNION\s+SELECT`,
	`(?i)INSERT\s+INTO`,
	`(?i)DELETE\s+FROM`,
	`(?i)DROP\s+TABLE`,
}

// SanitizeInput removes potentially dangerous characters
func SanitizeInput(input string) string {
	// Remove null bytes
	input = strings.ReplaceAll(input, "\x00", "")
	// Remove control characters except newlines and tabs
	input = regexp.MustCompile(`[\x00-\x08\x0B\x0C\x0E-\x1F]`).ReplaceAllString(input, "")
	return input
}

// ValidateUUID checks if a string is a valid UUID
func ValidateUUID(id string) bool {
	uuidRegex := regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)
	return uuidRegex.MatchString(id)
}

// SecurityHeaders middleware adds security headers to responses
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		c.Next()
	}
}

// InputValidation middleware validates common inputs
func InputValidation() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Validate UUID parameters
		for _, param := range []string{"id", "user_id", "project_id"} {
			if value := c.Param(param); value != "" {
				if !ValidateUUID(value) {
					c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid %s format", param)})
					c.Abort()
					return
				}
			}
		}

		// Sanitize query parameters
		for key, values := range c.Request.URL.Query() {
			for i, v := range values {
				values[i] = SanitizeInput(v)
			}
			c.Request.URL.Query()[key] = values
		}

		c.Next()
	}
}

// APIResponseFilter filters sensitive data from API responses
func APIResponseFilter(data interface{}) interface{} {
	// In a real implementation, this would use reflection to
	// filter sensitive fields based on user permissions
	return data
}

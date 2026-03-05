package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RenderStatus string

const (
	RenderStatusPending    RenderStatus = "pending"
	RenderStatusProcessing RenderStatus = "processing"
	RenderStatusCompleted  RenderStatus = "completed"
	RenderStatusFailed     RenderStatus = "failed"
	RenderStatusCancelled  RenderStatus = "cancelled"
)

type Render struct {
	ID             uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ProjectID      uuid.UUID      `json:"project_id" gorm:"type:uuid;not null;index:idx_render_project_status"`
	UserID         uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	Status         RenderStatus   `json:"status" gorm:"default:pending;index:idx_render_project_status"`
	CreditsUsed    int64          `json:"credits_used"`
	ReplicateID    string         `json:"replicate_id" gorm:"index"`
	OutputURL      string         `json:"output_url"`
	ErrorMessage   string         `json:"error_message"`
	StartedAt      *time.Time     `json:"started_at"`
	CompletedAt    *time.Time     `json:"completed_at"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`

	Project Project `json:"project,omitempty" gorm:"foreignKey:ProjectID"`
	User    User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (r *Render) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

type RenderWebhook struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	RenderID  uuid.UUID      `json:"render_id" gorm:"type:uuid;not null;index"`
	Type      string         `json:"type"`
	Payload   JSON           `json:"payload" gorm:"type:jsonb"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (rw *RenderWebhook) BeforeCreate(tx *gorm.DB) error {
	if rw.ID == uuid.Nil {
		rw.ID = uuid.New()
	}
	return nil
}

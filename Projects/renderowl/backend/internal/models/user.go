package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ClerkID   string         `json:"clerk_id" gorm:"uniqueIndex;not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Name      string         `json:"name"`
	AvatarURL string         `json:"avatar_url"`
	Credits   int64          `json:"credits" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	Projects       []Project       `json:"projects,omitempty" gorm:"foreignKey:UserID"`
	CreditTxs      []CreditTx      `json:"credit_transactions,omitempty" gorm:"foreignKey:UserID"`
	PaymentIntents []PaymentIntent `json:"payment_intents,omitempty" gorm:"foreignKey:UserID"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type Project struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	Status      string         `json:"status" gorm:"default:draft"`
	TemplateID  string         `json:"template_id"`
	Data        JSON           `json:"data" gorm:"type:jsonb"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	User    User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Renders []Render `json:"renders,omitempty" gorm:"foreignKey:ProjectID"`
}

func (p *Project) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CreditTxType string

const (
	CreditTxTypePurchase  CreditTxType = "purchase"
	CreditTxTypeUsage     CreditTxType = "usage"
	CreditTxTypeRefund    CreditTxType = "refund"
	CreditTxTypeBonus     CreditTxType = "bonus"
	CreditTxTypeAdjustment CreditTxType = "adjustment"
)

type CreditTx struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index:idx_credit_user_created"`
	Type        CreditTxType   `json:"type" gorm:"not null;index"`
	Amount      int64          `json:"amount"`
	Balance     int64          `json:"balance"`
	Description string         `json:"description"`
	RenderID    *uuid.UUID     `json:"render_id,omitempty" gorm:"type:uuid;index"`
	PaymentID   *uuid.UUID     `json:"payment_id,omitempty" gorm:"type:uuid;index"`
	Metadata    JSON           `json:"metadata" gorm:"type:jsonb"`
	CreatedAt   time.Time      `json:"created_at" gorm:"index:idx_credit_user_created"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	User    User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Render  *Render        `json:"render,omitempty" gorm:"foreignKey:RenderID"`
	Payment *PaymentIntent `json:"payment,omitempty" gorm:"foreignKey:PaymentID"`
}

func (ct *CreditTx) BeforeCreate(tx *gorm.DB) error {
	if ct.ID == uuid.Nil {
		ct.ID = uuid.New()
	}
	return nil
}

type CreditPackage struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Credits     int64          `json:"credits" gorm:"not null"`
	PriceCents  int64          `json:"price_cents" gorm:"not null"`
	Currency    string         `json:"currency" gorm:"default:USD"`
	StripePriceID string       `json:"stripe_price_id"`
	IsActive    bool           `json:"is_active" gorm:"default:true;index"`
	SortOrder   int            `json:"sort_order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

func (cp *CreditPackage) BeforeCreate(tx *gorm.DB) error {
	if cp.ID == uuid.Nil {
		cp.ID = uuid.New()
	}
	return nil
}

package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

type Client struct {
	client *asynq.Client
}

const (
	QueueDefault = "default"
	QueueRender  = "render"
	QueueEmail   = "email"
)

type TaskType string

const (
	TaskTypeRenderVideo   TaskType = "render:video"
	TaskTypeProcessExport TaskType = "export:process"
	TaskTypeSendEmail     TaskType = "email:send"
	TaskTypeCreditUpdate  TaskType = "credit:update"
)

type RenderTask struct {
	RenderID  uuid.UUID `json:"render_id"`
	ProjectID uuid.UUID `json:"project_id"`
	UserID    uuid.UUID `json:"user_id"`
}

type CreditUpdateTask struct {
	UserID  uuid.UUID `json:"user_id"`
	Amount  int64     `json:"amount"`
	Reason  string    `json:"reason"`
}

func NewClient(redisURL string) (*Client, error) {
	opt, err := asynq.ParseRedisURI(redisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse redis URI: %w", err)
	}

	client := asynq.NewClient(opt)
	return &Client{client: client}, nil
}

func (c *Client) Close() error {
	return c.client.Close()
}

func (c *Client) EnqueueRender(ctx context.Context, renderID, projectID uuid.UUID) error {
	task := RenderTask{
		RenderID:  renderID,
		ProjectID: projectID,
	}

	payload, err := json.Marshal(task)
	if err != nil {
		return fmt.Errorf("failed to marshal render task: %w", err)
	}

	info, err := c.client.EnqueueContext(ctx, asynq.NewTask(
		string(TaskTypeRenderVideo),
		payload,
		asynq.Queue(QueueRender),
		asynq.MaxRetry(3),
		asynq.Timeout(30*time.Minute),
		asynq.Retention(24*time.Hour),
	))
	if err != nil {
		return fmt.Errorf("failed to enqueue render: %w", err)
	}

	fmt.Printf("Enqueued render task: id=%s queue=%s\n", info.ID, info.Queue)
	return nil
}

func (c *Client) EnqueueCreditUpdate(ctx context.Context, userID uuid.UUID, amount int64, reason string) error {
	task := CreditUpdateTask{
		UserID: userID,
		Amount: amount,
		Reason: reason,
	}

	payload, err := json.Marshal(task)
	if err != nil {
		return fmt.Errorf("failed to marshal credit task: %w", err)
	}

	info, err := c.client.EnqueueContext(ctx, asynq.NewTask(
		string(TaskTypeCreditUpdate),
		payload,
		asynq.Queue(QueueDefault),
		asynq.MaxRetry(5),
		asynq.Timeout(30*time.Second),
	))
	if err != nil {
		return fmt.Errorf("failed to enqueue credit update: %w", err)
	}

	fmt.Printf("Enqueued credit update: id=%s queue=%s\n", info.ID, info.Queue)
	return nil
}

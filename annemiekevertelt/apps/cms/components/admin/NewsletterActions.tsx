'use client';

import React, { useState } from 'react';
import { useDocumentInfo } from '@payloadcms/ui';

export const NewsletterActions: React.FC = () => {
  const { id } = useDocumentInfo();
  const [isSending, setIsSending] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [showTestForm, setShowTestForm] = useState(false);

  const handleSendNewsletter = async () => {
    if (!id) return;

    if (!confirm('Weet je zeker dat je deze nieuwsbrief naar ALLE abonnees wilt versturen?')) {
      return;
    }

    setIsSending(true);
    setMessage('');

    try {
      const response = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId: id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setMessageType('success');
      } else {
        setMessage(`❌ ${data.error || 'Er ging iets mis'}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ Er ging iets mis bij het versturen');
      setMessageType('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTest = async () => {
    if (!id || !testEmail) return;

    setIsTesting(true);
    setMessage('');

    try {
      const response = await fetch('/api/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterId: id, testEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setMessageType('success');
        setShowTestForm(false);
        setTestEmail('');
      } else {
        setMessage(`❌ ${data.error || 'Er ging iets mis'}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ Er ging iets mis bij het versturen van de test');
      setMessageType('error');
    } finally {
      setIsTesting(false);
    }
  };

  if (!id) return null;

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
      }}
    >
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 600 }}>
        📧 Nieuwsbrief versturen
      </h3>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowTestForm(!showTestForm)}
          disabled={isTesting || isSending}
          style={{
            padding: '10px 20px',
            background: '#C4A77D',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isTesting || isSending ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            opacity: isTesting || isSending ? 0.6 : 1,
          }}
        >
          {showTestForm ? '❌ Annuleer test' : '🧪 Stuur test e-mail'}
        </button>

        <button
          onClick={handleSendNewsletter}
          disabled={isSending || isTesting}
          style={{
            padding: '10px 20px',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isSending || isTesting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            opacity: isSending || isTesting ? 0.6 : 1,
          }}
        >
          {isSending ? '⏳ Bezig met versturen...' : '🚀 Verstuur naar alle abonnees'}
        </button>
      </div>

      {showTestForm && (
        <div
          style={{
            marginTop: '15px',
            padding: '15px',
            background: 'white',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Test e-mailadres:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="jouw@email.nl"
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
            <button
              onClick={handleSendTest}
              disabled={isTesting || !testEmail}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isTesting || !testEmail ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                opacity: isTesting || !testEmail ? 0.6 : 1,
              }}
            >
              {isTesting ? '⏳ Bezig...' : 'Verstuur test'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: '15px',
            padding: '12px 15px',
            background: messageType === 'success' ? '#dcfce7' : '#fee2e2',
            color: messageType === 'success' ? '#166534' : '#991b1b',
            borderRadius: '6px',
            fontSize: '14px',
            border:
              messageType === 'success'
                ? '1px solid #86efac'
                : '1px solid #fca5a5',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

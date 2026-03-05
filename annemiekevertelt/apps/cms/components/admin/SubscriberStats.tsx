'use client';

import React, { useState, useEffect } from 'react';

interface SubscriberStats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
}

export const SubscriberStats: React.FC = () => {
  const [stats, setStats] = useState<SubscriberStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/subscribers/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/export-subscribers');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `abonnees-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: '20px',
          background: '#f9f9f9',
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        Laden...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          📊 Abonnee statistieken
        </h3>
        <button
          onClick={handleExport}
          disabled={isExporting}
          style={{
            padding: '8px 16px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isExporting ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            opacity: isExporting ? 0.6 : 1,
          }}
        >
          {isExporting ? '⏳ Exporteren...' : '📥 Exporteer CSV'}
        </button>
      </div>

      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
          }}
        >
          <StatBox
            label="Totaal"
            value={stats.total}
            color="#6b7280"
          />
          <StatBox
            label="Actief"
            value={stats.active}
            color="#22c55e"
          />
          <StatBox
            label="Uitgeschreven"
            value={stats.unsubscribed}
            color="#ef4444"
          />
          <StatBox
            label="Bounced"
            value={stats.bounced}
            color="#f59e0b"
          />
        </div>
      )}
    </div>
  );
};

const StatBox: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div
    style={{
      padding: '15px',
      background: 'white',
      borderRadius: '6px',
      textAlign: 'center',
      border: '1px solid #e5e7eb',
    }}
  >
    <div
      style={{
        fontSize: '24px',
        fontWeight: 700,
        color: color,
        marginBottom: '4px',
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: '12px',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {label}
    </div>
  </div>
);

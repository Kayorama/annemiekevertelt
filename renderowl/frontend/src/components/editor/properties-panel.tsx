'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-sm font-medium hover:bg-muted/50"
      >
        {title}
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        <span className="text-xs">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export default function PropertiesPanel() {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  // Mock transform values
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
  });

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-3">
        <h3 className="font-medium">Properties</h3>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Layer info */}
        <div className="flex items-center gap-2 border-b p-3">
          <button className="rounded p-1 hover:bg-muted">
            <Eye className="h-4 w-4" />
          </button>
          <button className="rounded p-1 hover:bg-muted">
            <Lock className="h-4 w-4" />
          </button>
          <span className="flex-1 text-sm font-medium truncate">Main Video</span>
        </div>

        {/* Transform */}
        <Section title="Transform">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Position X"
              value={transform.x}
              onChange={(v) =>
                setTransform((t) => ({ ...t, x: parseFloat(v) || 0 }))
              }
              type="number"
            />
            <Input
              label="Position Y"
              value={transform.y}
              onChange={(v) =>
                setTransform((t) => ({ ...t, y: parseFloat(v) || 0 }))
              }
              type="number"
            />
          </div>
          <Slider
            label="Scale"
            value={transform.scale}
            min={0}
            max={3}
            onChange={(v) => setTransform((t) => ({ ...t, scale: v }))}
          />
          <Input
            label="Rotation"
            value={transform.rotation}
            onChange={(v) =>
              setTransform((t) => ({ ...t, rotation: parseFloat(v) || 0 }))
            }
            type="number"
          />
          <Slider
            label="Opacity"
            value={transform.opacity}
            min={0}
            max={1}
            onChange={(v) => setTransform((t) => ({ ...t, opacity: v }))}
          />
        </Section>

        {/* Appearance */}
        <Section title="Appearance" defaultOpen={false}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Blend Mode</span>
              <select className="rounded border bg-background px-2 py-1 text-sm">
                <option>Normal</option>
                <option>Multiply</option>
                <option>Screen</option>
                <option>Overlay</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Speed */}
        <Section title="Time" defaultOpen={false}>
          <Input
            label="Speed"
            value={1}
            onChange={() => {}}
            type="number"
          />
          <div className="text-xs text-muted-foreground">
            1.0 = Normal speed
          </div>
        </Section>

        {/* Effects */}
        <Section title="Effects" defaultOpen={false}>
          <div className="space-y-2">
            {['Color Correction', 'Blur', 'Sharpen'].map((effect) => (
              <div
                key={effect}
                className="flex items-center justify-between rounded border p-2"
              >
                <span className="text-sm">{effect}</span>
                <button className="text-xs text-muted-foreground hover:text-foreground">
                  Edit
                </button>
              </div>
            ))}
            <button className="w-full rounded border border-dashed p-2 text-sm text-muted-foreground hover:bg-muted">
              + Add Effect
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

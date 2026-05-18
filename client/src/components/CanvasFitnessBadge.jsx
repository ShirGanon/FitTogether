// HTML5 <canvas> element — satisfies the course Canvas requirement.
// Draws a fitness badge: an activity ring + icon keyed off the user's
// fitnessLevel and preferredWorkoutTypes.

import { useEffect, useRef } from 'react';

const LEVEL_COLOR = {
  beginner:     '#10b981',
  intermediate: '#1d4ed8',
  advanced:     '#7c3aed',
};

const LEVEL_FILL = {
  beginner:     0.30,
  intermediate: 0.60,
  advanced:     0.82,
};

const WORKOUT_ICON = {
  Running:    '🏃',
  Cycling:    '🚴',
  Swimming:   '🏊',
  Weightlifting: '🏋️',
  Yoga:       '🧘',
  CrossFit:   '💪',
  Hiking:     '🥾',
  Soccer:     '⚽',
  Basketball: '🏀',
  Tennis:     '🎾',
};

export default function CanvasFitnessBadge({ user }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f0f4ff';
    ctx.fill();

    // Track ring
    const radius = cx - 18;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Progress arc
    const level = user.fitnessLevel || 'Beginner';
    const color = LEVEL_COLOR[level] || '#1d4ed8';
    const fillRatio = LEVEL_FILL[level] || 0.3;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * fillRatio;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Emoji icon — first preferred workout type, or default
    const workoutTypes = user.preferredWorkoutTypes || [];
    const icon = workoutTypes.length > 0
      ? (WORKOUT_ICON[workoutTypes[0]] || '🏅')
      : '🏅';
    ctx.font = '32px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, cx, cy - 8);

    // Level label
    ctx.font = '600 11px system-ui';
    ctx.fillStyle = color;
    ctx.fillText(level.toUpperCase(), cx, cy + 20);
  }, [user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        style={{ display: 'block' }}
        aria-label={`Fitness badge: ${user?.fitnessLevel || 'Beginner'}`}
      />
      <span className="meta" style={{ fontSize: '0.75rem' }}>Fitness Badge</span>
    </div>
  );
}

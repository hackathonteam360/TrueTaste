import React from 'react';
import Svg, { Circle, G } from 'react-native-svg';
import { useThemeColors } from '../constants/theme';

export default function StatsPieChart({ items }: { items: { value: number; color: string }[] }) {
  const colors = useThemeColors();
  const total = items.reduce((a, s) => a + s.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let acc = 0;

  return (
    <Svg width={140} height={140} viewBox="0 0 140 140">
      {total === 0 ? (
        <Circle cx={70} cy={70} r={r} stroke={colors.border} strokeWidth={16} fill="none" />
      ) : (
        <G rotation={-90} origin="70,70">
          {items.map((s, i) => {
            const frac = s.value / total;
            const dash = frac * c;
            const offset = -acc;
            acc += dash;
            return (
              <Circle
                key={i}
                cx={70}
                cy={70}
                r={r}
                stroke={s.color}
                strokeWidth={16}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={offset}
                fill="none"
              />
            );
          })}
        </G>
      )}
    </Svg>
  );
}
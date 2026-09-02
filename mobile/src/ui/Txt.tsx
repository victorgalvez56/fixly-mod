import { Text, type TextProps } from 'react-native';

import { Colors, Type, type TypeRole } from '@/theme/tokens';

type Props = TextProps & {
  /** Named `variant`, not `role` — RN's TextProps already has an accessibility `role`. */
  variant?: TypeRole;
  color?: string;
  tabularNums?: boolean;
};

/** System font throughout — no custom font loading, no Android weight-synthesis issues. */
export function Txt({ variant = 'body', color, tabularNums, style, ...rest }: Props) {
  const typeStyle = Type[variant];

  return (
    <Text
      style={[
        typeStyle,
        { color: color ?? Colors.textPrimary },
        tabularNums ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
      {...rest}
    />
  );
}

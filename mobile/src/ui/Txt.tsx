import { Text, type TextProps } from 'react-native';

import { Colors, TABULAR_ROLES, Type, type TypeRole } from '@/theme/tokens';

type Props = TextProps & {
  /** Named `variant`, not `role` — RN's TextProps already has an accessibility `role`. */
  variant?: TypeRole;
  color?: string;
  /** Force tabular digits, or force them OFF (rare: a mono role holding non-comparable text). */
  tabularNums?: boolean;
};

/** System font throughout — no custom font loading, no Android weight-synthesis issues. */
export function Txt({ variant = 'body', color, tabularNums, style, ...rest }: Props) {
  const typeStyle = Type[variant];
  const wantsTabular = tabularNums ?? TABULAR_ROLES.has(variant);

  return (
    <Text
      style={[
        typeStyle,
        { color: color ?? Colors.textPrimary },
        wantsTabular ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
      {...rest}
    />
  );
}

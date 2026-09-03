import { Text, type TextProps } from 'react-native';

import { Colors, TABULAR_ROLES, Type, type TypeRole } from '@/theme/tokens';

type Props = TextProps & { variant?: TypeRole; color?: string; tabularNums?: boolean };

export function Txt({ variant = 'body', color, tabularNums, style, ...rest }: Props) {
  const typeStyle = Type[variant];
  const wantsTabular = tabularNums ?? TABULAR_ROLES.has(variant);
  return <Text selectable style={[typeStyle, { color: color ?? Colors.textPrimary }, wantsTabular ? { fontVariant: ['tabular-nums'] } : null, style]} {...rest} />;
}

import { Card as MantineCard, Group, Stack, Text, Title } from "@mantine/core";
import type { BoxProps, CardProps as MantineCardProps } from "@mantine/core";
import type * as React from "react";

type DivProps = BoxProps & React.ComponentPropsWithoutRef<"div">;
type HeadingProps = BoxProps & React.ComponentPropsWithoutRef<"h2">;
type ParagraphProps = BoxProps & React.ComponentPropsWithoutRef<"p">;

export function Card(props: MantineCardProps) {
  return (
    <MantineCard
      bg="var(--mantine-color-body)"
      padding="lg"
      radius="sm"
      shadow="xs"
      withBorder
      {...props}
    />
  );
}

export function CardHeader(props: DivProps) {
  return <Group align="center" gap="xs" mb="md" {...props} />;
}

export function CardTitle(props: HeadingProps) {
  return <Title order={2} size="h4" fw={650} {...props} />;
}

export function CardDescription(props: ParagraphProps) {
  return <Text c="dimmed" size="sm" lh={1.55} {...props} />;
}

export function CardContent(props: DivProps) {
  return <Stack gap="md" {...props} />;
}

export function CardFooter(props: DivProps) {
  return (
    <Group
      align="center"
      gap="sm"
      mt="lg"
      pt="lg"
      style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
      {...props}
    />
  );
}

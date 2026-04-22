import {
  AppShell as MantineAppShell,
  Alert,
  Box,
  Container as MantineContainer,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  ThemeIcon,
} from "@mantine/core";
import type { BoxProps, ContainerProps } from "@mantine/core";
import type * as React from "react";

type DivProps = BoxProps & React.ComponentPropsWithoutRef<"div">;
type SectionProps = BoxProps & React.ComponentPropsWithoutRef<"section">;
type HeadingProps = BoxProps & React.ComponentPropsWithoutRef<"h1">;
type ParagraphProps = BoxProps & React.ComponentPropsWithoutRef<"p">;

export function AppSurface({ children, ...props }: DivProps) {
  return (
    <MantineAppShell bg="var(--mantine-color-body)" {...props}>
      {children}
    </MantineAppShell>
  );
}

export function Container(props: ContainerProps) {
  return (
    <MantineContainer size="xl" px={{ base: "md", sm: "lg" }} {...props} />
  );
}

export function PageSection(props: SectionProps) {
  return <Stack component="section" gap="xl" py="xl" {...props} />;
}

export function PageHeader(props: DivProps) {
  return (
    <Group
      align="flex-end"
      justify="space-between"
      gap="lg"
      pb="xl"
      style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
      {...props}
    />
  );
}

export function Kicker(props: ParagraphProps) {
  return (
    <Text
      c="teal.7"
      fw={700}
      size="sm"
      tt="uppercase"
      component="p"
      {...props}
    />
  );
}

export function PageTitle(props: HeadingProps) {
  return (
    <Title
      order={1}
      maw={900}
      size="clamp(2.25rem, 6vw, 3.75rem)"
      lh={1.08}
      fw={700}
      {...props}
    />
  );
}

export function PageLead(props: ParagraphProps) {
  return (
    <Text c="dimmed" size="lg" lh={1.65} maw={760} component="p" {...props} />
  );
}

export {
  Alert,
  Box,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
};

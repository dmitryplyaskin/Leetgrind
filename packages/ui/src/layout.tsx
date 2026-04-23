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
    <MantineAppShell bg="var(--lg-color-canvas)" {...props}>
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
  return (
    <Stack
      component="section"
      gap="xl"
      py="var(--lg-space-section)"
      {...props}
    />
  );
}

export function PageHeader(props: DivProps) {
  return (
    <Group
      align="flex-end"
      justify="space-between"
      gap="lg"
      pb="xl"
      style={{ borderBottom: "1px solid var(--lg-color-border)" }}
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
      lts={0}
      tt="uppercase"
      component="p"
      {...props}
    />
  );
}

export function PageTitle({ style, ...props }: HeadingProps) {
  return (
    <Title
      order={1}
      fz={{ base: "2.25rem", sm: "2.6rem", md: "3rem" }}
      maw={900}
      lh={1.08}
      fw={700}
      style={{ overflowWrap: "anywhere", ...style }}
      {...props}
    />
  );
}

export function PageLead(props: ParagraphProps) {
  return (
    <Text
      c="dimmed"
      fz={{ base: "md", sm: "lg" }}
      lh={1.65}
      maw={760}
      component="p"
      {...props}
    />
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

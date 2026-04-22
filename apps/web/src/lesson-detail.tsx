import { Link, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Kicker,
  PageHeader,
  PageLead,
  PageSection,
  PageTitle,
  Stack,
  Text
} from "@leetgrind/ui";
import { trpc } from "./trpc";

export function LessonDetailRoute() {
  const { lessonId } = useParams({ from: "/lessons/$lessonId" });
  const { t } = useTranslation();
  const lesson = trpc.lessons.get.useQuery({ lessonId });

  return (
    <Container>
      <PageSection>
        <PageHeader>
          <Stack gap="xs" maw={760}>
            <Kicker>{t("lessons.kicker")}</Kicker>
            <PageTitle>{lesson.data?.title ?? t("lessons.detail.title")}</PageTitle>
            <PageLead>{lesson.data?.summary ?? t("lessons.subtitle")}</PageLead>
          </Stack>
          <Button color="gray" component={Link} to="/lessons" variant="default">
            {t("lessons.back")}
          </Button>
        </PageHeader>

        {lesson.error ? (
          <Alert color="red" radius="sm" variant="light">
            {t("common.loadError")}
          </Alert>
        ) : null}

        {lesson.data ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("lessons.detail.content")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack gap="md">
                <Text>{lesson.data.payload.body}</Text>
                <Stack gap={4}>
                  <Text fw={650}>{t("lessons.detail.takeaways")}</Text>
                  {lesson.data.payload.takeaways.map((item) => (
                    <Text key={item}>• {item}</Text>
                  ))}
                </Stack>
                {lesson.data.payload.practicePrompt ? (
                  <Stack gap={4}>
                    <Text fw={650}>{t("lessons.detail.practicePrompt")}</Text>
                    <Text>{lesson.data.payload.practicePrompt}</Text>
                  </Stack>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        ) : null}
      </PageSection>
    </Container>
  );
}

import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconExclamationMark, IconTrash } from "@tabler/icons";
import dayjs from "dayjs";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { TypeOf, z } from "zod";
import MainLayout from "../../components/MainLayout";
import PageHeader from "../../components/PageHeader";
import { prisma } from "../../lib/prisma";
import { formatTransactionToSave } from "../../utils/formatTransactionToSave";

const schema = z.object({
  amount: z.number(),
  date: z.date({ required_error: "Required" }),
  note: z.string().nullable(),
  providerId: z.string().min(1, "Required"),
});

interface Props {
  providers: Awaited<ReturnType<typeof getProviders>>;
  expense: Awaited<ReturnType<typeof getExpense>>;
}

export default function IncomeView({ expense, providers }: Props) {
  const router = useRouter();
  const theme = useMantineTheme();

  const form = useForm({
    initialValues: {
      amount: expense.amount / 100,
      date: dayjs(expense.date).toDate(),
      note: expense.note,
      providerId: expense.Provider.id,
    },
    validate: zodResolver(schema),
  });

  const handleDelete = async () => {
    const result = await fetch(`/api/expenses/${expense.id}`, {
      method: "DELETE",
    });

    if (!result.ok) {
      showNotification({
        color: "red",
        title: "Error",
        message: "There was an error deleting the expense.",
        icon: <IconExclamationMark size={16} />,
      });
      return;
    }

    showNotification({
      color: "teal",
      title: `Expense deleted`,
      message: "The expense was deleted successfully.",
      icon: <IconCheck size={16} />,
    });

    router.push("/expenses");
  };

  const handleSubmit = async (data: TypeOf<typeof schema>) => {
    const result = await fetch(`/api/expenses/${expense.id}`, {
      body: JSON.stringify(formatTransactionToSave(data)),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });

    if (!result.ok) {
      showNotification({
        color: "red",
        title: "Error",
        message: "There was an error updating the income.",
        icon: <IconExclamationMark size={16} />,
      });
      return;
    }

    showNotification({
      color: "teal",
      title: "Expense updated",
      message: "The expense was updated successfully.",
      icon: <IconCheck size={16} />,
    });

    router.push("/expenses");

    return;
  };

  const openModal = () =>
    openConfirmModal({
      title: `Are you sure you want to delete this expense?`,
      children: <Text size="sm">This action cannot be reverted.</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: {
        color: "red",
      },
      onConfirm: handleDelete,
    });

  return (
    <MainLayout>
      <PageHeader backHref="/expenses" title="Edit expense">
        <ActionIcon color="red" onClick={openModal} size="lg" variant="subtle">
          <IconTrash />
        </ActionIcon>
      </PageHeader>

      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Stack spacing="xl" sx={{ maxWidth: theme.breakpoints.xs }}>
          <NumberInput
            hideControls
            label="Amount"
            precision={2}
            {...form.getInputProps("amount")}
          />

          <DatePicker
            clearable={false}
            firstDayOfWeek="sunday"
            label="Date"
            {...form.getInputProps("date")}
          />

          <Select
            data={providers.map((provider) => ({
              value: provider.id,
              label: provider.name,
            }))}
            label="Provider"
            {...form.getInputProps("providerId")}
          />

          <Textarea label="Note" {...form.getInputProps("note")} />

          <Group>
            <Button type="submit">Save</Button>
          </Group>
        </Stack>
      </form>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps<
  {
    expense: Awaited<ReturnType<typeof getExpense>>;
    providers: Awaited<ReturnType<typeof getProviders>>;
  },
  { id: string }
> = async ({ params }) => {
  try {
    const expense = await getExpense(params?.id);
    const providers = await getProviders();

    return { props: { providers, expense } };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function getProviders() {
  return prisma.provider.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

async function getExpense(id?: string) {
  const expense = await prisma.expense.findFirstOrThrow({
    select: {
      id: true,
      amount: true,
      date: true,
      note: true,
      Provider: { select: { id: true } },
    },
    where: { id },
  });

  return {
    ...expense,
    date: dayjs(expense.date).format(),
  };
}

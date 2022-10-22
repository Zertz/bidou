import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Group } from "@mantine/core";
import Link from "next/link";
import { ApiGetExpenses } from "../server/expenses";
import displayAmount from "../utils/displayAmount";
import { displayDate } from "../utils/displayDate";

interface RowProps {
  expense: ApiGetExpenses[number]["transactions"][number];
}
export default function ExpenseRow({ expense }: RowProps) {
  return (
    <Link href={`/expenses/${expense.id}`}>
      <tr style={{ cursor: "pointer" }}>
        <td style={{ width: "25%" }}>{expense.Category.name}</td>
        <td style={{ width: "25%" }}>{expense.Category.Parent?.name || ""}</td>
        <td style={{ width: "25%" }}>{displayDate(expense.date)}</td>
        <td style={{ width: "25%" }}>
          <Group position="right">
            {displayAmount(expense.amount)}{" "}
            <FontAwesomeIcon icon={faChevronRight} size="sm" />
          </Group>
        </td>
      </tr>
    </Link>
  );
}

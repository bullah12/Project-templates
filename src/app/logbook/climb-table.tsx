"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { AscentStyle, Discipline } from "@/generated/prisma/enums";
import { ascentStyleLabels, disciplineLabels } from "@/lib/climbs/labels";
import { deleteClimb } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ClimbRow = {
  id: string;
  routeName: string;
  discipline: Discipline;
  date: string; // YYYY-MM-DD
  gradeRaw: string;
  ascentStyle: AscentStyle;
  areaName: string | null;
  notes: string | null;
};

export function ClimbTable({ climbs }: { climbs: ClimbRow[] }) {
  const [dateOrder, setDateOrder] = useState<"desc" | "asc">("desc");

  const sorted = [...climbs].sort((a, b) =>
    dateOrder === "desc"
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date)
  );

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                type="button"
                className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                onClick={() =>
                  setDateOrder(dateOrder === "desc" ? "asc" : "desc")
                }
                aria-label={`Sort by date, currently ${
                  dateOrder === "desc" ? "newest first" : "oldest first"
                }`}
              >
                Date
                {dateOrder === "desc" ? (
                  <ArrowDown className="size-3.5" />
                ) : (
                  <ArrowUp className="size-3.5" />
                )}
              </button>
            </TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Discipline</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Style</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((climb) => (
            <TableRow key={climb.id}>
              <TableCell className="whitespace-nowrap">{climb.date}</TableCell>
              <TableCell className="max-w-56">
                <div className="truncate font-medium" title={climb.routeName}>
                  {climb.routeName}
                </div>
                {climb.notes && (
                  <div
                    className="truncate text-xs text-muted-foreground"
                    title={climb.notes}
                  >
                    {climb.notes}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {disciplineLabels[climb.discipline]}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {climb.gradeRaw}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {ascentStyleLabels[climb.ascentStyle]}
              </TableCell>
              <TableCell className="max-w-40">
                <div className="truncate" title={climb.areaName ?? undefined}>
                  {climb.areaName ?? "—"}
                </div>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/logbook/${climb.id}/edit`} />}
                >
                  Edit
                </Button>
                <DeleteClimbButton
                  climbId={climb.id}
                  routeName={climb.routeName}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DeleteClimbButton({
  climbId,
  routeName,
}: {
  climbId: string;
  routeName: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-destructive" />
        }
      >
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this climb?</AlertDialogTitle>
          <AlertDialogDescription>
            “{routeName}” will be removed from your logbook. This can’t be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={deleteClimb}>
            <input type="hidden" name="climbId" value={climbId} />
            <AlertDialogAction type="submit" variant="destructive">
              Delete
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

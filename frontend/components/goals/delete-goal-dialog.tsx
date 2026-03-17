"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

import type { Goal } from "@/types/goal";

interface DeleteGoalDialogProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteGoalDialog({
  goal,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteGoalDialogProps) {
  const handleConfirm = async () => {
    if (!goal) return;
    await onConfirm(goal.id);
  };

  if (!goal) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir meta</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a meta{" "}
            <span className="font-medium text-foreground">
              &quot;{goal.name}&quot;
            </span>
            ? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Spinner className="mr-2" />}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

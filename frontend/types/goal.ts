export type GoalType = "SAVING" | "PURCHASE" | "DEBT";

export type GoalStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Goal {
    id: string;
    userId: string;
    name: string;
    description: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    type: GoalType;
    status: GoalStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateGoalRequest {
    name: string;
    description: string;
    targetAmount: number;
    deadline: string;
    type: GoalType;
}

export interface AddProgressRequest {
    amount: number;
}

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
    SAVING: "Poupança",
    PURCHASE: "Compra",
    DEBT: "Quitação de Dívida",
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
    ACTIVE: "Ativo",
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
};

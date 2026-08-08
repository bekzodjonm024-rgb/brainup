import { AdaptiveAction } from "@/generated/prisma";

export interface AdaptiveContext {
  masteryScore: number;
  recentAccuracy: number;
  repeatedErrors: number;
  retentionScore: number;
  retentionThreshold?: number;
  attemptsOnTopic: number;
}

export interface AdaptiveDecision {
  action: AdaptiveAction;
  reason: string;
}

// Rule-based adaptive engine — configurable thresholds
export const ADAPTIVE_THRESHOLDS = {
  masteryLow: 0.50,
  masteryMid: 0.70,
  masteryHigh: 0.85,
  repeatedErrorsMax: 3,
  retentionDefault: 0.60,
};

export function decideNextAction(ctx: AdaptiveContext): AdaptiveDecision {
  const retentionThreshold = ctx.retentionThreshold ?? ADAPTIVE_THRESHOLDS.retentionDefault;

  if (ctx.repeatedErrors >= ADAPTIVE_THRESHOLDS.repeatedErrorsMax) {
    return {
      action: AdaptiveAction.PREREQUISITE,
      reason: `${ctx.repeatedErrors} ta ketma-ket xato — oldingi bilimni tekshiring`,
    };
  }

  if (ctx.retentionScore < retentionThreshold && ctx.retentionScore > 0) {
    return {
      action: AdaptiveAction.RETRIEVE,
      reason: "Retention pastligi sababli takrorlash kerak",
    };
  }

  if (ctx.masteryScore < ADAPTIVE_THRESHOLDS.masteryLow) {
    return {
      action: AdaptiveAction.PREREQUISITE,
      reason: `Mastery ${pct(ctx.masteryScore)} — oldingi mavzuni ko'rib chiqing`,
    };
  }

  if (ctx.masteryScore < ADAPTIVE_THRESHOLDS.masteryMid) {
    return {
      action: AdaptiveAction.PRACTICE,
      reason: `Mastery ${pct(ctx.masteryScore)} — qo'shimcha mashq kerak`,
    };
  }

  if (ctx.masteryScore < ADAPTIVE_THRESHOLDS.masteryHigh) {
    return {
      action: AdaptiveAction.PRACTICE,
      reason: `Mastery ${pct(ctx.masteryScore)} — mustahkamlash uchun mashq`,
    };
  }

  if (ctx.masteryScore >= ADAPTIVE_THRESHOLDS.masteryHigh) {
    if (ctx.retentionScore >= retentionThreshold || ctx.retentionScore === 0) {
      return {
        action: AdaptiveAction.CONTINUE,
        reason: `Mastery ${pct(ctx.masteryScore)} — keyingi mavzuga o'ting`,
      };
    }
    return {
      action: AdaptiveAction.RETRIEVE,
      reason: "Mastery yuqori, lekin retention tekshiruvi kerak",
    };
  }

  return {
    action: AdaptiveAction.PRACTICE,
    reason: "Standart tavsiya: mashq qiling",
  };
}

function pct(v: number) {
  return `${Math.round(v * 100)}%`;
}

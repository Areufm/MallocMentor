import type { CapabilityRadar } from "@/types/api";

export interface RadarDataItem {
  subject: string;
  A: number;
  fullMark: number;
}

export interface RadarMeta {
  overallScore: number;
  topDimension: string;
}

const RADAR_DIMENSIONS: Array<{ key: keyof CapabilityRadar; label: string }> = [
  { key: "basicSyntax", label: "基础语法" },
  { key: "memoryManagement", label: "内存管理" },
  { key: "dataStructures", label: "数据结构" },
  { key: "oop", label: "面向对象" },
  { key: "stlLibrary", label: "STL使用" },
  { key: "systemProgramming", label: "系统编程" },
];

/** 将 CapabilityRadar 对象转换为 recharts 雷达图所需格式 */
export function toRadarData(radar: CapabilityRadar): RadarDataItem[] {
  return RADAR_DIMENSIONS.map(({ key, label }) => ({
    subject: label,
    A: radar[key] as number,
    fullMark: 100,
  }));
}

/** 计算雷达图综合评分（六项均值） */
export function calcOverallScore(radar: CapabilityRadar): number {
  const values = RADAR_DIMENSIONS.map(({ key }) => radar[key] as number);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** 找出雷达图中得分最高的维度 */
export function findTopDimension(radar: CapabilityRadar): string {
  return RADAR_DIMENSIONS.reduce((prev, curr) =>
    (radar[curr.key] as number) > (radar[prev.key] as number) ? curr : prev,
  ).label;
}

/** 一次性计算雷达图相关的展示数据 */
export function buildRadarMeta(radar: CapabilityRadar | undefined): RadarMeta {
  if (!radar) return { overallScore: 0, topDimension: "" };
  return {
    overallScore: calcOverallScore(radar),
    topDimension: findTopDimension(radar),
  };
}

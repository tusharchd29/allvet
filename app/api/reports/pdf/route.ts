import { createElement, type ReactElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { getSession } from "@/lib/session";
import { getReportData, REPORT_SECTIONS, type ReportSection } from "@/lib/reports";
import { ReportDocument } from "@/lib/report-pdf";

// @react-pdf/renderer needs Node APIs (Buffer, fs for font handling) that
// aren't available on the Edge runtime.
export const runtime = "nodejs";

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start") ?? "";
  const end = searchParams.get("end") ?? "";

  if (!isValidDate(start) || !isValidDate(end)) {
    return NextResponse.json({ error: "Start and end date are required (YYYY-MM-DD)." }, { status: 400 });
  }
  if (start > end) {
    return NextResponse.json({ error: "Start date must be on or before the end date." }, { status: 400 });
  }

  // Cap the range so a very wide, unbounded query can't be used to pull the
  // whole database's history in one request.
  const spanDays = (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000;
  if (spanDays > 366) {
    return NextResponse.json({ error: "Date range can't be longer than a year." }, { status: 400 });
  }

  // Owner only: which reps' data to include (repeated ?rep=<id> params;
  // none picked means "whole team"), and which of the seven report
  // sections to render (repeated ?section=<name>; none picked means all).
  const repIds = searchParams.getAll("rep").filter(Boolean);
  const requestedSections = searchParams.getAll("section").filter(Boolean) as ReportSection[];
  const sections = requestedSections.filter((s) => (REPORT_SECTIONS as readonly string[]).includes(s));

  const data = await getReportData(session, start, end, {
    repIds: repIds.length > 0 ? repIds : null,
    sections: sections.length > 0 ? sections : undefined,
  });
  // ReportDocument is a component that renders a single <Document> — this
  // satisfies renderToBuffer's runtime contract, but its type only accepts
  // a ReactElement<DocumentProps> directly, not a wrapper component, hence
  // the cast.
  const element = createElement(ReportDocument, { data }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="allvet-report-${start}-to-${end}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

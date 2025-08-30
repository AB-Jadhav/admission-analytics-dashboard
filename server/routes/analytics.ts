import { RequestHandler } from "express";

function generateTrends(days = 30) {
  const today = new Date();
  const data: { date: string; applications: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const base = 60 + Math.round(40 * Math.sin((i / days) * Math.PI * 2));
    const noise = Math.round(((i % 5) - 2) * 3);
    const applications = Math.max(10, base + noise);
    data.push({ date: d.toISOString().slice(0, 10), applications });
  }
  return data;
}

export const handleAdmissionsAnalytics: RequestHandler = (_req, res) => {
  const perProgram = [
    { program: "Computer Science", applications: 1180 },
    { program: "Mechanical Engineering", applications: 640 },
    { program: "Business Administration", applications: 520 },
    { program: "Psychology", applications: 410 },
    { program: "Biology", applications: 360 },
  ];

  const totalApplicants = perProgram.reduce((sum, p) => sum + p.applications, 0);
  const verifiedApplicants = Math.round(totalApplicants * 0.72);
  const rejectedApplicants = Math.round(totalApplicants * 0.18);

  const trends = generateTrends(45);

  res.json({
    totalApplicants,
    verifiedApplicants,
    rejectedApplicants,
    perProgram,
    trends,
    generatedAt: new Date().toISOString(),
  });
};

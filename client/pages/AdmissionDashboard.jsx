import { useEffect, useMemo, useState } from "react";
import { fetchAdmissionAnalytics } from "@/api/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function useHighlight(value) {
  if (value > 1000) return "text-red-600";
  if (value > 500) return "text-orange-500";
  return "text-emerald-600";
}

export default function AdmissionDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const d = await fetchAdmissionAnalytics();
      setData(d);
    } catch (e) {
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTrends = useMemo(() => {
    if (!data?.trends) return [];
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    return data.trends.filter((t) => {
      const d = new Date(t.date);
      if (fromDate && d < fromDate) return false;
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [data, from, to]);

  const StatCard = ({ title, value }) => {
    const color = useHighlight(value);
    return (
      <Card className="bg-white/60 backdrop-blur border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-600 font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-extrabold tracking-tight ${color}`}>{value?.toLocaleString?.() ?? "-"}</div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Admission Analytics Dashboard</h1>
            <p className="text-slate-600">University Admin Portal</p>
          </div>
          <div className="flex items-end gap-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="from" className="text-slate-700">From</Label>
                <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="to" className="text-slate-700">To</Label>
                <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
            <Button onClick={load} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {!data && loading && (
          <div className="h-[50vh] grid place-items-center text-slate-600">Loading analytics…</div>
        )}
        {error && (
          <div className="h-[30vh] grid place-items-center">
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="text-red-700 font-medium">{error}</div>
              <div className="text-sm text-red-600 mt-1">Use the refresh button to try again.</div>
            </Card>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard title="Total Applicants" value={data.totalApplicants} />
              <StatCard title="Verified Applicants" value={data.verifiedApplicants} />
              <StatCard title="Rejected Applicants" value={data.rejectedApplicants} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Applications per Program</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {data.perProgram?.length ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.perProgram} margin={{ left: 4, right: 16 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="program" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                          <YAxis />
                          <Tooltip formatter={(v) => v.toLocaleString()} />
                          <Bar dataKey="applications" name="Applications" radius={[6, 6, 0, 0]} fill="#1E3A8A" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-40 grid place-items-center text-slate-500">No data available</div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Application Trends</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {filteredTrends?.length ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={filteredTrends} margin={{ left: 4, right: 16 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip formatter={(v) => v.toLocaleString()} />
                          <Line type="monotone" dataKey="applications" name="Applications" stroke="#F59E0B" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-40 grid place-items-center text-slate-500">No data in selected range</div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Programs Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.perProgram?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Program</TableHead>
                          <TableHead className="text-right">Applicants</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.perProgram.map((row) => (
                          <TableRow key={row.program}>
                            <TableCell className="font-medium">{row.program}</TableCell>
                            <TableCell className="text-right">
                              <span className={`font-semibold ${useHighlight(row.applications)}`}>
                                {row.applications.toLocaleString()}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="h-20 grid place-items-center text-slate-500">No data available</div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

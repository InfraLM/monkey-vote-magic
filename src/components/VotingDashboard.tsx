import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BarChart3, PieChart } from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface VoteData {
  name: string;
  votes: number;
}

interface CategoryStats {
  categoryId: string;
  categoryTitle: string;
  data: VoteData[];
  total: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const VotingDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  useEffect(() => {
    fetchVotingStats();
  }, []);

  const fetchVotingStats = async () => {
    setLoading(true);
    try {
      // Fetch all categories
      const { data: categories, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");

      if (catError) throw catError;

      if (!categories || categories.length === 0) {
        setStats([]);
        setLoading(false);
        return;
      }

      // Fetch vote counts for each category
      const statsPromises = categories.map(async (category) => {
        const { data: votes, error: votesError } = await supabase
          .from("votes")
          .select("selected_alternative")
          .eq("category_id", category.id);

        if (votesError) throw votesError;

        // Count votes per alternative
        const voteCounts: Record<string, number> = {};
        category.alternatives.forEach((alt: string) => {
          voteCounts[alt] = 0;
        });

        votes?.forEach((vote) => {
          if (voteCounts[vote.selected_alternative] !== undefined) {
            voteCounts[vote.selected_alternative]++;
          }
        });

        const data: VoteData[] = Object.entries(voteCounts).map(([name, votes]) => ({
          name,
          votes,
        }));

        return {
          categoryId: category.id,
          categoryTitle: category.title,
          data,
          total: votes?.length || 0,
        };
      });

      const resolvedStats = await Promise.all(statsPromises);
      setStats(resolvedStats);
    } catch (error: any) {
      console.error("Error fetching voting stats:", error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Nenhum voto registrado ainda. Os gráficos aparecerão quando houver votos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Type Toggle */}
      <div className="flex justify-end gap-2">
        <Button
          variant={chartType === "bar" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("bar")}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Barras
        </Button>
        <Button
          variant={chartType === "pie" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("pie")}
        >
          <PieChart className="w-4 h-4 mr-2" />
          Pizza
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <Card key={stat.categoryId} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardTitle className="text-xl font-bold text-foreground">
                {stat.categoryTitle}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-semibold">
                Total de votos: <span className="text-primary font-black">{stat.total}</span>
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {stat.total === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Nenhum voto ainda</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === "bar" ? (
                    <BarChart data={stat.data}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  ) : (
                    <RechartsPie>
                      <Pie
                        data={stat.data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="hsl(var(--primary))"
                        dataKey="votes"
                      >
                        {stat.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </RechartsPie>
                  )}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
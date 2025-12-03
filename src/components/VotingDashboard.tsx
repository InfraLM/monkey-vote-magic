import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BarChart3, PieChart, Download, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type DateFilter = "all" | "today" | "week" | "month";

export const VotingDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchVotingStats();
  }, [dateFilter]);

  const getDateFilterQuery = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateFilter) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        return null;
    }

    return startDate.toISOString();
  };

  // ✅ FUNÇÃO CORRIGIDA - Implementa paginação para suportar mais de 1000 votos
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

      const startDate = getDateFilterQuery();

      // Fetch vote counts for each category with pagination
      const statsPromises = categories.map(async (category) => {
        let allVotes: any[] = [];
        let page = 0;
        let hasMore = true;
        const pageSize = 1000; // Supabase limit per request

        // Paginate through all votes
        while (hasMore) {
          let query = supabase
            .from("votes")
            .select("selected_alternative")
            .eq("category_id", category.id)
            .range(page * pageSize, (page + 1) * pageSize - 1);

          // Apply date filter if not "all"
          if (startDate) {
            query = query.gte("created_at", startDate);
          }

          const { data: votes, error: votesError } = await query;

          if (votesError) throw votesError;

          if (!votes || votes.length === 0) {
            hasMore = false;
          } else {
            allVotes = [...allVotes, ...votes];
            // Se recebeu menos de 1000, não há mais páginas
            if (votes.length < pageSize) {
              hasMore = false;
            }
            page++;
          }
        }

        // Count votes per alternative
        const voteCounts: Record<string, number> = {};
        category.alternatives.forEach((alt: string) => {
          voteCounts[alt] = 0;
        });

        allVotes.forEach((vote) => {
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
          total: allVotes.length, // Total correto (todos os votos, não apenas 1000)
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

  // ✅ FUNÇÃO CORRIGIDA - Exportação também implementa paginação
  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const startDate = getDateFilterQuery();

      // Fetch all votes with date filter - WITH PAGINATION
      let allVotes: any[] = [];
      let page = 0;
      let hasMore = true;
      const pageSize = 1000;

      while (hasMore) {
        let query = supabase
          .from("votes")
          .select("*")
          .order("created_at", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (startDate) {
          query = query.gte("created_at", startDate);
        }

        const { data: votes, error } = await query;

        if (error) throw error;

        if (!votes || votes.length === 0) {
          hasMore = false;
        } else {
          allVotes = [...allVotes, ...votes];
          if (votes.length < pageSize) {
            hasMore = false;
          }
          page++;
        }
      }

      if (allVotes.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Não há votos no período selecionado.",
          variant: "destructive",
        });
        return;
      }

      // Create CSV content
      const headers = ["Data/Hora", "IP", "Categoria", "Alternativa Selecionada"];
      const csvRows = [headers.join(",")];

      allVotes.forEach((vote) => {
        const row = [
          new Date(vote.created_at).toLocaleString("pt-BR"),
          vote.ip_address,
          `"${vote.category_title}"`,
          `"${vote.selected_alternative}"`,
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      
      // Add BOM for Excel UTF-8 support
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const filterLabel = dateFilter === "all" ? "todos" : 
                         dateFilter === "today" ? "hoje" :
                         dateFilter === "week" ? "7dias" : "30dias";
      link.download = `votos_mda2025_${filterLabel}_${new Date().toISOString().split("T")[0]}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Exportação concluída!",
        description: `${allVotes.length} votos exportados com sucesso.`,
      });
    } catch (error: any) {
      console.error("Error exporting votes:", error);
      toast({
        title: "Erro ao exportar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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

  const getFilterLabel = () => {
    switch (dateFilter) {
      case "today":
        return "Hoje";
      case "week":
        return "Últimos 7 dias";
      case "month":
        return "Últimos 30 dias";
      default:
        return "Todo o período";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Date Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Filter Display */}
          <div className="text-sm font-semibold text-muted-foreground">
            Exibindo: <span className="text-primary">{getFilterLabel()}</span>
          </div>
        </div>

        {/* Export and Chart Type Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={isExporting || stats.length === 0}
            className="flex-1 sm:flex-none"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </>
            )}
          </Button>
          
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("bar")}
          >
            <BarChart3 className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Barras</span>
          </Button>
          <Button
            variant={chartType === "pie" ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType("pie")}
          >
            <PieChart className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Pizza</span>
          </Button>
        </div>
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

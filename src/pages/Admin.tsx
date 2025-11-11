import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VotingDashboard } from "@/components/VotingDashboard";

interface Category {
  id: string;
  title: string;
  alternatives: string[];
  display_order: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newCategory, setNewCategory] = useState({ title: "", alternatives: "" });
  const [votingActive, setVotingActive] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadVotingStatus();
    }
  }, [isAuthenticated, isAdmin]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        setIsAuthenticated(true);
        setIsAdmin(true);
        loadCategories();
      }
    }
    
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username !== "mda2025") {
      toast({
        title: "Erro de autenticação",
        description: "Usuário incorreto",
        variant: "destructive",
      });
      return;
    }

    const adminEmail = "admin@mda.local";
    
    // Tentar fazer login
    let { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password,
    });

    // Se o usuário não existe, chamar a função para criá-lo
    if (error?.message?.includes("Invalid login credentials")) {
      try {
        await supabase.functions.invoke("ensure-admin", {
          body: { email: adminEmail, password }
        });
        
        // Tentar login novamente após criar o usuário
        const result = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password,
        });
        data = result.data;
        error = result.error;
      } catch (err) {
        toast({
          title: "Erro ao configurar admin",
          description: "Erro ao criar usuário administrador",
          variant: "destructive",
        });
        return;
      }
    }

    if (error) {
      toast({
        title: "Erro de autenticação",
        description: "Senha incorreta",
        variant: "destructive",
      });
      return;
    }

    if (data.user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        setIsAuthenticated(true);
        setIsAdmin(true);
        loadCategories();
      } else {
        await supabase.auth.signOut();
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão de administrador",
          variant: "destructive",
        });
      }
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");

    if (error) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCategories(data || []);
  };

  const handleCreate = async () => {
    if (!newCategory.title || !newCategory.alternatives) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e as alternativas",
        variant: "destructive",
      });
      return;
    }

    const alternatives = newCategory.alternatives.split(",").map(a => a.trim());
    const maxOrder = Math.max(...categories.map(c => c.display_order), 0);

    const { error } = await supabase.from("categories").insert({
      title: newCategory.title,
      alternatives,
      display_order: maxOrder + 1,
    });

    if (error) {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Categoria criada com sucesso!" });
    setNewCategory({ title: "", alternatives: "" });
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro ao deletar categoria",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Categoria deletada com sucesso!" });
    loadCategories();
  };

  const loadVotingStatus = async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "voting_active")
      .single();
    
    if (data && !error) {
      setVotingActive(data.value === true);
    }
  };

  const toggleVotingStatus = async (checked: boolean) => {
    const { error } = await supabase
      .from("settings")
      .update({ value: checked })
      .eq("key", "voting_active");
    
    if (!error) {
      setVotingActive(checked);
      toast({
        title: checked ? "✅ Votação ativada!" : "🔒 Votação desativada!",
        description: checked 
          ? "Os usuários podem votar novamente" 
          : "A página de votação foi desativada",
      });
    } else {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-center">Admin - MDA 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite o usuário"
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                />
              </div>
              <Button type="submit" className="w-full font-bold">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black text-primary">Painel Administrativo</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Ver Votação
          </Button>
        </div>

        {/* Voting Status Toggle */}
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="voting-toggle" className="text-2xl font-black text-foreground">
                  Status da Votação
                </Label>
                <p className="text-base font-semibold text-muted-foreground">
                  {votingActive 
                    ? "✅ Votação ATIVA - Usuários podem votar" 
                    : "🔒 Votação ENCERRADA - Página bloqueada"}
                </p>
              </div>
              <Switch
                id="voting-toggle"
                checked={votingActive}
                onCheckedChange={toggleVotingStatus}
                className="scale-150 data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Voting Dashboard */}
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-primary flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Dashboard de Votação
          </h2>
          <VotingDashboard />
        </div>

        {/* Category Management */}
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-primary">Gerenciar Categorias</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Categoria</Label>
                <Input
                  id="title"
                  value={newCategory.title}
                  onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                  placeholder="Ex: Melhor Artista do Ano"
                />
              </div>
              <div>
                <Label htmlFor="alternatives">Alternativas (separadas por vírgula)</Label>
                <Input
                  id="alternatives"
                  value={newCategory.alternatives}
                  onChange={(e) => setNewCategory({ ...newCategory, alternatives: e.target.value })}
                  placeholder="Ex: Artista 1, Artista 2, Artista 3"
                />
              </div>
              <Button onClick={handleCreate} className="w-full font-bold">
                Criar Categoria
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-2xl font-black text-secondary">Categorias Existentes</h3>
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{category.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {category.alternatives.join(", ")}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

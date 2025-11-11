import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ title: "", alternatives: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "mda2025" && password === "senhaultrasecreta") {
      setIsAuthenticated(true);
      loadCategories();
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Usuário ou senha incorretos",
        variant: "destructive",
      });
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

  if (!isAuthenticated) {
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
                  placeholder="Digite a senha"
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black text-primary">Gerenciar Categorias</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Ver Votação
          </Button>
        </div>

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
          <h2 className="text-2xl font-black text-secondary">Categorias Existentes</h2>
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
  );
};

export default Admin;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Heart, TrendingUp, Laptop, Smartphone, Headphones, Watch, Monitor, Mic } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import RecommendationsSection from "@/components/RecommendationsSection";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getProductById, products, toCardProduct } from "@/data/products";
import { hasCompletedOnboarding } from "@/utils/session";

// Destacados: laptops para el guion de Black Friday y algunos de otras categorías
const featuredProducts = [9, 1, 10, 2]
  .map((id) => getProductById(id))
  .filter((p): p is NonNullable<typeof p> => !!p)
  .map(toCardProduct);

const categories = [
  { name: "Celulares", slug: "celulares", icon: Smartphone, count: products.filter((p) => p.category === "celulares").length },
  { name: "Monitores", slug: "monitores", icon: Monitor, count: products.filter((p) => p.category === "monitores").length },
  { name: "Smartwatches", slug: "smartwatches", icon: Watch, count: products.filter((p) => p.category === "smartwatches").length },
  { name: "Audífonos", slug: "audifonos", icon: Headphones, count: products.filter((p) => p.category === "audifonos").length },
  { name: "PCs de Marca", slug: "pcs-de-marca", icon: Monitor, count: products.filter((p) => p.category === "pcs-de-marca").length },
  { name: "Laptops", slug: "laptops", icon: Laptop, count: products.filter((p) => p.category === "laptops").length }
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserSession = () => {
      const userData = localStorage.getItem("user");
      const isUserLoggedIn = !!userData;
      
      setIsLoggedIn(isUserLoggedIn);
      
      // Check if user is logged in but hasn't completed onboarding
      if (isUserLoggedIn && !hasCompletedOnboarding()) {
        setShouldShowOnboarding(true);
      }
    };

    // Verificar inmediatamente
    checkUserSession();

    // Configurar un listener para cambios en localStorage
    const handleStorageChange = () => {
      checkUserSession();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // También verificar periódicamente por si el localStorage cambia en la misma pestaña
    const interval = setInterval(checkUserSession, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Redirect to onboarding if needed
  useEffect(() => {
    if (shouldShowOnboarding) {
      navigate('/onboarding');
    }
  }, [shouldShowOnboarding, navigate]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error de búsqueda",
        description: "Por favor ingresa un término de búsqueda",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to products page with search query
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleVoiceSearch = () => {
    toast({
      title: "Búsqueda por voz",
      description: "Función de búsqueda por voz próximamente disponible",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            SmartShop
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Compara precios de tecnología en tiendas oficiales del Perú en una sola vista.
            Revisa el historial para saber si el descuento es real antes de comprar.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar productos tecnológicos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-24 h-12 text-lg"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleVoiceSearch}
                className="p-2"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSearch}
                size="sm"
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Categorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link key={category.name} to={`/products?category=${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer text-center">
                  <CardContent className="p-6">
                    <category.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} {category.count === 1 ? "producto" : "productos"}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Productos Destacados</h2>
            <Link to="/products">
              <Button variant="outline">Ver todos</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations Section - Only for logged in users */}
      <RecommendationsSection isLoggedIn={isLoggedIn} />

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué SmartShop?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Historial de Precios</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Rastrea el historial de precios y recibe alertas cuando baje el precio de tus productos favoritos.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Lista de Deseos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Guarda productos en tu lista de deseos y recibe notificaciones de ofertas especiales.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Recibe recomendaciones personalizadas basadas en tus gustos y búsquedas anteriores.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
